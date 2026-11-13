#!/usr/bin/env node
/**
 * Vue SFC 编译检查：用 @vue/compiler-sfc 解析并编译改动文件的 script 与 template。
 * 纯 JS 的 <script>（无 lang="ts"）中混入类型注解等语法错误会在这里失败，
 * 而不是等到浏览器里变成 500 / 白屏（TAP-13018 F-05）。
 *
 * 用法：node scripts/check-vue-sfc.mjs <file...>
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const process = require('node:process')

function loadCompiler() {
  try {
    return require('@vue/compiler-sfc')
  } catch {
    // pnpm 提升布局下从 .pnpm 目录定位
    const { execSync } = require('node:child_process')
    const root = execSync(
      'find node_modules/.pnpm -maxdepth 1 -name "@vue+compiler-sfc@*" | head -1',
      { encoding: 'utf8' },
    ).trim()
    if (!root) throw new Error('未找到 @vue/compiler-sfc')
    return require(
      require('node:path').resolve(root, 'node_modules/@vue/compiler-sfc'),
    )
  }
}

const sfc = loadCompiler()
const files = process.argv.slice(2).filter((f) => f.endsWith('.vue'))
let failed = 0

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const { descriptor, errors } = sfc.parse(source, { filename: file })
  const problems = errors.map((e) => e.message)
  const hasScript = !!descriptor.script || !!descriptor.scriptSetup
  if (hasScript) {
    try {
      sfc.compileScript(descriptor, { id: file })
    } catch (error) {
      problems.push(`script: ${error.message.split('\n')[0]}`)
    }
  }
  if (descriptor.template) {
    const result = sfc.compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id: file,
    })
    problems.push(...result.errors.map((e) => `template: ${e.message || e}`))
  }
  if (problems.length) {
    failed += 1
    console.error(`✗ ${file}`)
    problems.forEach((p) => console.error(`    ${p}`))
  }
}

if (failed) {
  console.error(`\n${failed} 个 Vue 文件编译失败`)
  process.exit(1)
}
console.log(`✓ Vue SFC 编译检查通过（${files.length} 个文件）`)
