#!/usr/bin/env node

/**
 * 检测文件中未国际化的中文硬编码
 *
 * 用法:
 *   node scripts/check-i18n.js [文件...]        # 检查指定文件（lint-staged 模式）
 *   node scripts/check-i18n.js --all            # 全量扫描（CI 模式）
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// 中文字符正则（CJK 统一汉字）
const CHINESE_RE = /[\u4E00-\u9FFF]/

// 需要排除的目录/文件模式
const EXCLUDE_PATTERNS = [
  /[\\/]locales?[\\/]/,
  /[\\/]node_modules[\\/]/,
  /[\\/]dist[\\/]/,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.d\.ts$/,
  /[\\/]i18n[\\/]langs[\\/]/,
  /scripts[\\/]check-i18n\.js$/,
]

// 需要检查的文件扩展名
const CHECK_EXTENSIONS = ['.vue', '.js', '.ts', '.tsx', '.jsx']

// 行级别排除规则 —— 命中则跳过该行
const LINE_SKIP_PATTERNS = [
  /^\s*\/\//, // 单行注释
  /^\s*\*/, // 块注释中间行
  /^\s*\/\*.*\*\/\s*$/, // 单行块注释
  /^\s*<!--.*-->\s*$/, // HTML 注释
  /^\s*<!--/, // HTML 注释开始
  /\/\*[^\n\r\u2028\u2029\u4E00-\u9FFF]*[\u4E00-\u9FFF].*\*\//, // CSS/JS 块注释内含中文
  /console\.(log|warn|error|info|debug)\s*\(/, // console 输出
  /eslint-disable/, // eslint 禁用注释
  /i18n-ignore/, // 显式标记忽略
  /\/\/\s*TODO/, // TODO 注释
  /\/\/\s*FIXME/, // FIXME 注释
  /\/\/\s*HACK/, // HACK 注释
  /\/\/\s*NOTE/, // NOTE 注释
]

// 已国际化调用模式 —— 行内中文如果全部在这些调用内部则放行
const I18N_CALL_PATTERNS = [
  /\$t\s*\(/, // $t('key')
  /\bt\s*\(/, // t('key')
  /\$tc\s*\(/, // $tc('key', ...)
  /\$te\s*\(/, // $te('key')
  /i18n\.t\s*\(/, // i18n.t('key')
  /getMessage\s*\(/, // node.getMessage('token')
  /getDesignerMessage\s*\(/, // GlobalRegistry.getDesignerMessage
]

// 块级排除 —— 当检测到开始标记时，直到对应结束，整块跳过
const BLOCK_SKIP_PATTERNS = [
  /registerDesignerLocales\s*\(/, // GlobalRegistry.registerDesignerLocales({...})
  /mergeLocaleMessage\s*\(/, // i18n.global.mergeLocaleMessage(...)
  /\.merge\s*\(/, // i18n.merge(...)
]

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some((p) => p.test(filePath))
}

function isCheckableFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return CHECK_EXTENSIONS.includes(ext)
}

function shouldSkipLine(line) {
  return LINE_SKIP_PATTERNS.some((p) => p.test(line))
}

function isInI18nCall(line) {
  return I18N_CALL_PATTERNS.some((p) => p.test(line))
}

/**
 * 去掉行尾的 // 注释部分（简单处理，不考虑字符串内的 //）
 * 对于 `code // 中文注释` 这种情况，返回 `code `
 */
function stripTrailingComment(line) {
  // 从后往前找 //，跳过在引号内的情况（简化处理）
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  for (let i = 0; i < line.length - 1; i++) {
    const ch = line[i]
    const next = line[i + 1]
    if (ch === "'" && !inDouble && !inTemplate) inSingle = !inSingle
    else if (ch === '"' && !inSingle && !inTemplate) inDouble = !inDouble
    else if (ch === '`' && !inSingle && !inDouble) inTemplate = !inTemplate
    else if (
      ch === '/' &&
      next === '/' &&
      !inSingle &&
      !inDouble &&
      !inTemplate
    ) {
      return line.slice(0, i)
    }
  }
  return line
}

function checkFile(filePath) {
  const errors = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  let inBlockComment = false
  let inHtmlComment = false
  let skipBlockDepth = 0 // 块级排除：追踪括号深度

  for (const [i, line] of lines.entries()) {
    const lineNum = i + 1

    // HTML 块注释追踪 <!-- ... -->
    if (inHtmlComment) {
      if (line.includes('-->')) inHtmlComment = false
      continue
    }
    if (line.includes('<!--') && !line.includes('-->')) {
      inHtmlComment = true
      continue
    }

    // 块级排除追踪（如 registerDesignerLocales 整块）
    if (skipBlockDepth > 0) {
      for (const ch of line) {
        if (ch === '(') skipBlockDepth++
        if (ch === ')') skipBlockDepth--
      }
      continue
    }
    // 检测是否进入需要排除的块
    if (BLOCK_SKIP_PATTERNS.some((p) => p.test(line))) {
      skipBlockDepth = 1
      for (const ch of line) {
        if (ch === '(') skipBlockDepth++
        if (ch === ')') skipBlockDepth--
      }
      if (skipBlockDepth > 0) continue
      // 如果同一行就闭合了，也跳过
      continue
    }

    // JS 块注释追踪
    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false
      continue
    }
    if (line.trim().startsWith('/*') && !line.trim().includes('*/')) {
      inBlockComment = true
      continue
    }
    // 单行块注释
    if (/^\s*\/\*.*\*\//.test(line)) continue

    // 无中文则跳过
    if (!CHINESE_RE.test(line)) continue

    // 行级排除
    if (shouldSkipLine(line)) continue

    // 去掉行尾注释后再检测：如果中文只在行尾注释里，放行
    const lineWithoutTrailingComment = stripTrailingComment(line)
    if (!CHINESE_RE.test(lineWithoutTrailingComment)) continue

    // 宽松策略：如果行内有 i18n 调用标记，就放行
    if (isInI18nCall(line)) continue

    errors.push({
      file: filePath,
      line: lineNum,
      content: line.trim(),
    })
  }

  return errors
}

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git'
      )
        continue
      getAllFiles(fullPath, files)
    } else if (isCheckableFile(fullPath) && !shouldExcludeFile(fullPath)) {
      files.push(fullPath)
    }
  }
  return files
}

// --- Main ---
const args = process.argv.slice(2)
let files = []

if (args.includes('--all')) {
  // 全量扫描: 扫描 apps/ 和 packages/ 目录
  files = [...getAllFiles('apps'), ...getAllFiles('packages')]
} else if (args.length > 0) {
  // lint-staged 模式: 检查传入的文件
  files = args.filter(
    (f) => isCheckableFile(f) && !shouldExcludeFile(f) && fs.existsSync(f),
  )
} else {
  // 无参数时检查 git staged 文件
  try {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    })
    files = staged
      .trim()
      .split('\n')
      .filter(
        (f) =>
          f && isCheckableFile(f) && !shouldExcludeFile(f) && fs.existsSync(f),
      )
  } catch {
    console.error('无法获取 git staged 文件列表')
    process.exit(1)
  }
}

if (files.length === 0) {
  process.exit(0)
}

const allErrors = []
for (const file of files) {
  const errors = checkFile(file)
  allErrors.push(...errors)
}

if (allErrors.length > 0) {
  console.error(
    `\n\u001B[31m✗ 发现 ${allErrors.length} 处未国际化的中文硬编码:\u001B[0m\n`,
  )
  for (const err of allErrors) {
    console.error(
      `  \u001B[36m${err.file}\u001B[0m:\u001B[33m${err.line}\u001B[0m`,
    )
    console.error(`    ${err.content}\n`)
  }
  console.error("\u001B[33m提示: 请使用 $t('key') 或 t('key') 进行国际化处理。")
  console.error('如需忽略某行，请在行尾添加注释: // i18n-ignore\u001B[0m\n')
  process.exit(1)
} else {
  console.log('\u001B[32m✓ 未发现中文硬编码问题\u001B[0m')
  process.exit(0)
}
