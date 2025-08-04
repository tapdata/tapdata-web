<script setup>
import * as monaco from 'monaco-editor'
// Configure Monaco Editor environment for Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  language: {
    type: String,
    default: 'javascript',
  },
  theme: {
    type: String,
    default: 'vs',
  },
  height: {
    type: [String, Number],
    default: '200px',
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const editorContainer = ref(null)
let editor = null

// 使用 Monaco Editor 内置格式化
const formatJavaScript = async (editor) => {
  if (!editor) return

  try {
    // 方法1: 使用格式化 Action
    const formatAction = editor.getAction('editor.action.formatDocument')
    if (formatAction) {
      await formatAction.run()
      return
    }

    // 方法2: 手动调用格式化服务
    const model = editor.getModel()
    if (model) {
      const formatEdits = await monaco.languages.provideDocumentFormattingEdits(
        model,
        {
          tabSize: 2,
          insertSpaces: true,
        },
      )

      if (formatEdits && formatEdits.length > 0) {
        editor.executeEdits('format', formatEdits)
      }
    }
  } catch (error) {
    console.warn('格式化失败:', error)
  }
}

const defaultOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
  },
  wordWrap: 'off',
  // 缩进设置
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: false,
  // 格式化设置
  formatOnPaste: true,
  formatOnType: true,
}

onMounted(async () => {
  await nextTick()

  if (!editorContainer.value) return

  // 配置 TypeScript/JavaScript 编译器选项，禁用不需要的诊断
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
    diagnosticCodesToIgnore: [
      7028, // 忽略 "Unused label" 警告
      1005, // 忽略 "';' expected" 错误
      1002, // 忽略 "Unterminated string literal" 错误
      1003, // 忽略 "Identifier expected" 错误
    ],
  })

  // 配置编译器选项
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
    // 更宽松的语法检查
    noImplicitAny: false,
    strictNullChecks: false,
    strictFunctionTypes: false,
    noImplicitReturns: false,
    noImplicitThis: false,
    alwaysStrict: false,
  })

  // 配置 JavaScript 格式化选项
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

  // 注册自定义语言模式用于 MongoDB 查询
  if (
    !monaco.languages.getLanguages().some((lang) => lang.id === 'mongodb-query')
  ) {
    monaco.languages.register({ id: 'mongodb-query' })

    // 设置语言配置
    monaco.languages.setLanguageConfiguration('mongodb-query', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    })

    // 设置语法高亮
    monaco.languages.setMonarchTokensProvider('mongodb-query', {
      keywords: [
        '$eq',
        '$gt',
        '$gte',
        '$in',
        '$lt',
        '$lte',
        '$ne',
        '$nin',
        '$and',
        '$not',
        '$nor',
        '$or',
        '$exists',
        '$type',
        '$regex',
        '$text',
        '$search',
        '$all',
        '$elemMatch',
        '$size',
        '$where',
        '$mod',
        '$slice',
        '$push',
        '$pull',
        '$set',
        '$unset',
        'true',
        'false',
        'null',
      ],
      tokenizer: {
        root: [
          [/\$[a-z_]\w*/i, 'keyword'],
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          [/\d+(\.\d+)?/, 'number'],
          [/true|false|null/, 'keyword'],
          [/[{}[\]()]/, 'delimiter'],
          [/[:,]/, 'delimiter'],
          [/[a-z_]\w*/i, 'identifier'],
          [/\s+/, 'white'],
        ],
      },
    })

    // 更新语言配置，添加单词模式
    monaco.languages.setLanguageConfiguration('mongodb-query', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,
    })
  }

  // 合并配置选项
  const editorOptions = {
    ...defaultOptions,
    ...props.options,
    language: props.language,
    theme: props.theme,
    value: props.modelValue,
  }

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, editorOptions)

  // 添加格式化快捷键 (Shift+Alt+F)
  editor.addCommand(
    monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
    () => {
      formatCode()
    },
  )

  // 添加测试快捷键 (Ctrl+T) 来手动触发补全
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT, () => {
    editor.trigger('test', 'editor.action.triggerSuggest', {})
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emit('update:modelValue', value)
    emit('change', value)
  })

  // 监听焦点事件
  editor.onDidFocusEditorText(() => {
    emit('focus')
  })

  editor.onDidBlurEditorText(() => {
    emit('blur')
  })

  // 设置容器尺寸
  updateSize()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue || '')
    }
  },
)

// 监听配置变化
watch(
  () => props.options,
  (newOptions) => {
    if (editor) {
      editor.updateOptions(newOptions)
    }
  },
  { deep: true },
)

// 监听语言变化
watch(
  () => props.language,
  (newLanguage) => {
    if (editor) {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage)
      }
    }
  },
)

// 监听主题变化
watch(
  () => props.theme,
  (newTheme) => {
    if (editor) {
      monaco.editor.setTheme(newTheme)
    }
  },
)

// 监听尺寸变化
watch([() => props.height, () => props.width], () => {
  updateSize()
})

function updateSize() {
  if (!editorContainer.value) return

  const height =
    typeof props.height === 'number' ? `${props.height}px` : props.height
  const width =
    typeof props.width === 'number' ? `${props.width}px` : props.width

  editorContainer.value.style.height = height
  editorContainer.value.style.width = width

  if (editor) {
    editor.layout()
  }
}

// 格式化当前代码
const formatCode = async () => {
  if (!editor) return

  // 使用 Monaco Editor 内置格式化
  await formatJavaScript(editor)
}

// 暴露编辑器实例和方法
defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value) => editor?.setValue(value || ''),
  focus: () => editor?.focus(),
  layout: () => editor?.layout(),
  format: formatCode,
})
</script>

<template>
  <div ref="editorContainer" class="monaco-editor-container" />
</template>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 200px;
}
</style>
