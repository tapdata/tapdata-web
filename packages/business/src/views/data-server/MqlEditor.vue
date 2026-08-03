<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import JSON5 from 'json5'
import * as monaco from 'monaco-editor'
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const { t } = useI18n()
const JSON5_LANGUAGE_ID = 'json5'

const props = defineProps({
  height: {
    type: Number,
    default: 200,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    type: Array,
    default: () => [],
  },
  variables: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['change', 'validationChange'])

const editorValue = defineModel('modelValue', {
  type: String,
  default: '',
})
const monacoEditorRef = ref<any>(null)

let json5LanguageRegistered = false

const registerJson5Language = () => {
  if (json5LanguageRegistered) return

  monaco.languages.register({
    id: JSON5_LANGUAGE_ID,
    extensions: ['.json5'],
    aliases: ['JSON5', 'json5'],
  })

  monaco.languages.setLanguageConfiguration(JSON5_LANGUAGE_ID, {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  })

  monaco.languages.setMonarchTokensProvider(JSON5_LANGUAGE_ID, {
    defaultToken: '',
    tokenPostfix: '.json5',
    tokenizer: {
      root: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'comment', next: '@comment' }],
        [/\b(?:true|false|null|Infinity|NaN)\b/, 'keyword'],
        [
          /[+\-]?(?:0x[0-9a-f]+|(?:\d+\.\d*|\.\d+|\d+)(?:e[+\-]?\d+)?)/i,
          'number',
        ],
        [/'(?:[^'\\]|\\.)*'/, 'string'],
        [/"(?:[^"\\]|\\.)*"/, 'string'],
        [/[A-Z_$][\w$]*/i, 'identifier'],
        [/[{}[\]]/, '@brackets'],
        [/[:,]/, 'delimiter'],
        [/./, 'delimiter.invalid'],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/[/*]/, 'comment'],
      ],
    },
  })

  json5LanguageRegistered = true
}

registerJson5Language()

const mongoOperators = [
  // Comparison operators
  {
    label: '$eq',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_eq'),
  },
  {
    label: '$gt',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_gt'),
  },
  {
    label: '$gte',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_gte'),
  },
  {
    label: '$in',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_in'),
  },
  {
    label: '$lt',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_lt'),
  },
  {
    label: '$lte',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_lte'),
  },
  {
    label: '$ne',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_ne'),
  },
  {
    label: '$nin',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_nin'),
  },

  // Logical operators
  {
    label: '$and',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_and'),
  },
  {
    label: '$nor',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_nor'),
  },
  {
    label: '$or',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_or'),
  },

  // Element operators
  {
    label: '$exists',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_exists'),
  },
  {
    label: '$type',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_type'),
  },

  // Evaluation operators
  {
    label: '$regex',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_regex'),
  },

  // Array operators
  {
    label: '$all',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_all'),
  },
  {
    label: '$elemMatch',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_elemMatch'),
  },
  {
    label: '$size',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_size'),
  },

  // Additional common operators
  {
    label: '$mod',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: t('packages_business_mongo_operator_mod'),
  },
]

const registerMongoCompletion = (languageId: string) => {
  return monaco.languages.registerCompletionItemProvider(languageId, {
    triggerCharacters: ['$', '"', "'", '{'],
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position)
      const lineContent = model.getLineContent(position.lineNumber)
      const textBeforeCursor = lineContent.slice(
        0,
        Math.max(0, position.column - 1),
      )
      const isJson5 = model.getLanguageId() === JSON5_LANGUAGE_ID

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions: any[] = []

      if (lineContent?.trim() === '{}') return { suggestions }

      // 检查是否已经在引号内
      const beforeCursor = textBeforeCursor
      const lastQuoteIndex = Math.max(
        beforeCursor.lastIndexOf('"'),
        beforeCursor.lastIndexOf("'"),
      )
      const isInQuotes =
        lastQuoteIndex > -1 &&
        !beforeCursor.slice(lastQuoteIndex + 1).includes('"') &&
        !beforeCursor.slice(lastQuoteIndex + 1).includes("'")

      const matchingOperators = mongoOperators.filter((op) =>
        op.label.toLowerCase().startsWith(word.word.toLowerCase()),
      )

      let replaceRange = range
      if (word.word.startsWith('$')) {
        replaceRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
      } else if (textBeforeCursor.endsWith('$')) {
        replaceRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - 1,
          endColumn: position.column,
        }
      }

      suggestions.push(
        ...matchingOperators.map((op) => ({
          label: op.label,
          kind: op.kind,
          detail: op.detail,
          insertText: isInQuotes || isJson5 ? op.label : `"${op.label}"`,
          range: replaceRange,
          sortText: `2${op.label}`,
        })),
      )

      if (props.fields && props.fields.length > 0) {
        const matchingFields = (props.fields as any[]).filter((field: any) =>
          field.field_name.toLowerCase().startsWith(word.word.toLowerCase()),
        )
        if (matchingFields.length > 0) {
          suggestions.push(
            ...matchingFields.map((field) => ({
              label: field.field_name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: field.data_type,
              insertText:
                isInQuotes || isJson5
                  ? field.field_name
                  : `"${field.field_name}"`,
              range,
              sortText: `1${field.field_name}`,
            })),
          )
        }
      }

      if (props.variables && props.variables.length > 0 && word.word) {
        const matchingVariables = (props.variables as any[]).filter(
          (variable: any) =>
            variable.name.toLowerCase().startsWith(word.word.toLowerCase()),
        )

        console.info('🔍 Matching variables:', matchingVariables)

        if (matchingVariables.length > 0) {
          // 分析上下文：检查是否在 {{}} 内部
          const openBraceIndex = textBeforeCursor.lastIndexOf('{{')
          const closeBraceIndex = textBeforeCursor.lastIndexOf('}}')
          const isInsideBraces =
            openBraceIndex > closeBraceIndex && openBraceIndex !== -1

          // 检查光标后是否有 }}
          const textAfterCursor = lineContent.slice(position.column - 1)
          const hasClosingBraces = textAfterCursor.startsWith('}}')

          console.info('🔍 Variable completion context:', {
            isInsideBraces,
            hasClosingBraces,
            openBraceIndex,
            closeBraceIndex,
            word: word.word,
          })

          suggestions.push(
            ...matchingVariables.map((variable) => {
              let insertText
              let replaceRange = range

              if (isInsideBraces) {
                // 在 {{}} 内部，只需要变量名，可能需要 }}
                insertText = hasClosingBraces
                  ? variable.name
                  : `${variable.name}}}`
                // 替换从 {{ 后面到当前位置
                replaceRange = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: openBraceIndex + 3, // +3 = +1(Monaco 1-based) +2(skip {{)
                  endColumn: position.column,
                }
              } else {
                // 不在 {{}} 内部，需要完整的 {{variable}}
                insertText =
                  isInQuotes || isJson5
                    ? `{{${variable.name}}}`
                    : `"{{${variable.name}}}"`
              }

              return {
                label: `{{${variable.name}}}`,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: variable.type,
                insertText,
                range: replaceRange,
                sortText: `0${variable.name}`,
              }
            }),
          )
        }
      }

      return {
        suggestions,
        incomplete: false, // 告诉Monaco这是完整的列表，不需要其他提供器
        dispose: () => {}, // 添加dispose方法
      }
    },
  })
}

// 注册自动补全
let completionRegistered = false

if (typeof monaco !== 'undefined' && !completionRegistered) {
  completionRegistered = true
  registerMongoCompletion('json')
  registerMongoCompletion(JSON5_LANGUAGE_ID)
}

const validateJSON = (jsonString: string) => {
  if (!jsonString.trim()) {
    return { isValid: true, error: null }
  }

  try {
    const parsed = JSON5.parse(jsonString)
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        isValid: false,
        error: {
          message: 'JSON must be an object or array',
          line: 1,
          column: 1,
        },
      }
    }
    return { isValid: true, error: null }
  } catch (syntaxError: any) {
    const errorMessage = String(syntaxError?.message ?? '').replace(
      /^JSON5:\s*/,
      '',
    )
    return {
      isValid: false,
      error: {
        message: errorMessage,
        line: syntaxError.lineNumber || getErrorLine(errorMessage) || 1,
        column: syntaxError.columnNumber || getErrorColumn(errorMessage) || 1,
      },
    }
  }
}

// Extract line number from JSON parse error message
function getErrorLine(errorMessage: string) {
  const lineMatch = errorMessage.match(/line (\d+)/i)
  return Number.parseInt(lineMatch?.[1] ?? '1')
}

function getErrorColumn(errorMessage: string) {
  const columnMatch = errorMessage.match(/column (\d+)/i)
  return Number.parseInt(columnMatch?.[1] ?? '1')
}

const validationError = ref<{
  message: string
  line: number
  column: number
} | null>(null)

const handleChange = (val: string) => {
  const validation = validateJSON(val)
  validationError.value = validation.error

  emit('change', val)
  emit('validationChange', {
    isValid: validation.isValid,
    error: validation.error,
    value: val,
  })
}

const normalizeJSON = (jsonString: string) => {
  if (!jsonString.trim()) {
    return ''
  }

  try {
    const parsed = JSON5.parse(jsonString)
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }
    return JSON.stringify(parsed, null, 2)
  } catch {
    return null
  }
}

const formatCode = () => {
  const normalized = normalizeJSON(editorValue.value)
  if (normalized !== null) {
    editorValue.value = normalized
  }
}

defineExpose({
  format: formatCode,
  normalize: normalizeJSON,
  getEditor: () => monacoEditorRef.value?.getEditor(),
  validateJSON,
})
</script>

<template>
  <div
    class="mql-editor border rounded-xl overflow-hidden"
    :class="{ 'has-error': validationError }"
  >
    <div class="editor-container" :style="{ height: `${height}px` }">
      <MonacoEditor
        ref="monacoEditorRef"
        v-model="editorValue"
        :options="{
          language: 'json5',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: disabled,
          lineNumbers: 'on',
          lineNumbersMinChars: 3, // 设置行号最小字符数，减少宽度
          glyphMargin: false, // 禁用字形边距以节省空间
          suggestOnTriggerCharacters: true,
          quickSuggestions: true, // 启用快速建议来测试
          wordBasedSuggestions: 'off', // 禁用基于单词的建议
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          fixedOverflowWidgets: true,
          formatOnPaste: false,
          formatOnType: false,
          ...options,
        }"
        :height="height"
        @change="handleChange"
      />
    </div>
    <div v-if="validationError" class="validation-error">
      <i class="el-icon-warning-outline" />
      <span
        >{{ $t('public_json_format_error') }}:
        {{ validationError.message }}</span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mql-editor {
  position: relative;

  .editor-header {
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 4px 4px 0 0;

    .editor-actions {
      display: flex;
      justify-content: flex-end;

      .format-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 12px;
        color: #606266;
        background: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          color: #409eff;
          border-color: #c6e2ff;
          background-color: #ecf5ff;
        }

        &:disabled {
          color: #c0c4cc;
          cursor: not-allowed;
          background-color: #f5f7fa;
        }

        i {
          font-size: 12px;
        }
      }
    }
  }

  .editor-container {
    border-radius: 0;
    position: relative;
    overflow: visible;
  }

  .validation-error {
    padding: 8px 12px;
    background-color: #fef0f0;
    border-top: 1px solid #fbc4c4;
    color: #f56c6c;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 0 0 4px 4px;

    i {
      font-size: 14px;
    }
  }

  &.has-error {
    border-color: #f56c6c;
  }
}

// 全局样式，控制Monaco编辑器行号宽度
:deep(.monaco-editor .margin) {
  width: 50px !important; // 设置行号区域宽度为50px
}

:deep(.monaco-editor .line-numbers) {
  width: 50px !important; // 设置行号宽度为50px
  text-align: center; // 行号居中显示
  font-size: 12px; // 调整行号字体大小
}

:deep(.monaco-editor .margin-view-overlays) {
  width: 50px !important; // 设置边距覆盖层宽度
}

// 去掉选中行的边框
:deep(.monaco-editor .current-line) {
  border: none !important; // 移除当前行边框
  box-shadow: none !important; // 移除阴影
}

:deep(.monaco-editor .view-line) {
  border: none !important; // 移除所有行的边框
}

// 去掉当前行高亮的边框装饰
:deep(.monaco-editor .current-line-exact) {
  border: none !important;
  box-shadow: none !important;
}

// 去掉行高亮的装饰器
:deep(.monaco-editor .view-overlays .current-line) {
  border: none !important;
  box-shadow: none !important;
}
</style>
