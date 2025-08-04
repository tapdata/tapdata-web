<script setup>
import * as monaco from 'monaco-editor'
import { onBeforeUnmount, ref, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
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
})

const emit = defineEmits(['change', 'validationChange'])

const editorValue = ref(props.value)
const monacoEditorRef = ref(null)

// MongoDB operators with descriptions
const mongoOperators = [
  // Comparison operators
  {
    label: '$eq',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches values that are equal to a specified value.',
  },
  {
    label: '$gt',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches values that are greater than a specified value.',
  },
  {
    label: '$gte',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail:
      'Matches values that are greater than or equal to a specified value.',
  },
  {
    label: '$in',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches any of the values specified in an array.',
  },
  {
    label: '$lt',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches values that are less than a specified value.',
  },
  {
    label: '$lte',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches values that are less than or equal to a specified value.',
  },
  {
    label: '$ne',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches all values that are not equal to a specified value.',
  },
  {
    label: '$nin',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches none of the values specified in an array.',
  },

  // Logical operators
  {
    label: '$and',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Joins query clauses with a logical AND.',
  },
  {
    label: '$not',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Inverts the effect of a query expression.',
  },
  {
    label: '$nor',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Joins query clauses with a logical NOR.',
  },
  {
    label: '$or',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Joins query clauses with a logical OR.',
  },

  // Element operators
  {
    label: '$exists',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches documents that have the specified field.',
  },
  {
    label: '$type',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Selects documents if a field is of the specified type.',
  },

  // Evaluation operators
  {
    label: '$regex',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail:
      'Selects documents where values match a specified regular expression.',
  },
  {
    label: '$text',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Performs text search.',
  },
  {
    label: '$where',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches documents that satisfy a JavaScript expression.',
  },

  // Array operators
  {
    label: '$all',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Matches arrays that contain all elements specified in the query.',
  },
  {
    label: '$elemMatch',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail:
      'Selects documents if element in the array field matches all the specified conditions.',
  },
  {
    label: '$size',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Selects documents if the array field is a specified size.',
  },

  // Additional common operators
  {
    label: '$mod',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Performs a modulo operation on the value of a field.',
  },
  {
    label: '$slice',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Limits the number of elements projected from an array.',
  },
  {
    label: '$push',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Adds an item to an array.',
  },
  {
    label: '$pull',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Removes all array elements that match a specified query.',
  },
  {
    label: '$set',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Sets the value of a field in a document.',
  },
  {
    label: '$unset',
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: 'Removes the specified field from a document.',
  },
]

// 强制注册 MongoDB 自动补全（每次都重新注册以确保生效）
const registerMongoCompletion = () => {
  return monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['$', ' ', '\n'],
    provideCompletionItems: (model, position) => {
      console.info('MongoDB completion triggered') // 调试信息

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      // MongoDB 操作符建议
      const suggestions = mongoOperators.map((op) => ({
        label: op.label,
        kind: op.kind,
        detail: op.detail,
        insertText: op.label,
        range,
        sortText: `0${op.label}`, // 确保排在前面
      }))

      console.info('Providing suggestions:', suggestions.length) // 调试信息
      return { suggestions }
    },
  })
}

// 注册自动补全
let completionDisposable = null
if (typeof monaco !== 'undefined') {
  completionDisposable = registerMongoCompletion()
}

// JSON/JavaScript validation function (supports JSON5-like syntax)
const validateJSON = (jsonString) => {
  if (!jsonString.trim()) {
    return { isValid: true, error: null }
  }

  try {
    // 首先尝试标准 JSON 解析
    JSON.parse(jsonString)
    return { isValid: true, error: null }
  } catch {
    // 如果标准 JSON 解析失败，尝试简单的语法检查
    // 这里可以添加更宽松的验证逻辑，支持 JSON5 特性
    try {
      // 简单的括号匹配检查
      const stack = []
      const pairs = { '{': '}', '[': ']', '(': ')' }

      for (const char of jsonString) {
        if (char in pairs) {
          stack.push(char)
        } else if (Object.values(pairs).includes(char)) {
          const last = stack.pop()
          if (!last || pairs[last] !== char) {
            throw new Error(`Unmatched bracket: ${char}`)
          }
        }
      }

      if (stack.length > 0) {
        throw new Error(`Unclosed bracket: ${stack.at(-1)}`)
      }

      return { isValid: true, error: null }
    } catch (syntaxError) {
      return {
        isValid: false,
        error: {
          message: syntaxError.message,
          line: getErrorLine(syntaxError.message),
          column: getErrorColumn(syntaxError.message),
        },
      }
    }
  }
}

// Extract line number from JSON parse error message
const getErrorLine = (errorMessage) => {
  const lineMatch = errorMessage.match(/line (\d+)/i)
  return lineMatch ? Number.parseInt(lineMatch[1]) : 1
}

// Extract column number from JSON parse error message
const getErrorColumn = (errorMessage) => {
  const columnMatch = errorMessage.match(/column (\d+)/i)
  return columnMatch ? Number.parseInt(columnMatch[1]) : 1
}

// Validation state
const validationError = ref(null)

watch(
  () => props.value,
  (newVal) => {
    if (newVal !== editorValue.value) {
      editorValue.value = newVal
    }
  },
)

const handleChange = (val) => {
  // Validate JSON format
  const validation = validateJSON(val)
  validationError.value = validation.error

  emit('change', val)
  emit('validationChange', {
    isValid: validation.isValid,
    error: validation.error,
    value: val,
  })
}

// 格式化代码
const formatCode = async () => {
  if (monacoEditorRef.value) {
    await monacoEditorRef.value.format()
  }
}

// 清理资源
onBeforeUnmount(() => {
  if (completionDisposable) {
    completionDisposable.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  format: formatCode,
  getEditor: () => monacoEditorRef.value?.getEditor(),
})
</script>

<template>
  <div class="mql-editor" :class="{ 'has-error': validationError }">
    <div class="editor-header">
      <div class="editor-actions">
        <button
          type="button"
          class="format-btn"
          :disabled="disabled"
          title="格式化代码 (Shift+Alt+F)"
          @click="formatCode"
        >
          <i class="el-icon-magic-stick" />
          格式化
        </button>
      </div>
    </div>
    <div class="editor-container" :style="{ height: `${height}px` }">
      <MonacoEditor
        ref="monacoEditorRef"
        v-model="editorValue"
        :options="{
          language: 'javascript',
          theme: 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: disabled,
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          wordBasedSuggestions: 'allDocuments',
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showColors: false,
            showFiles: false,
            showReferences: false,
            showFolders: false,
            showTypeParameters: false,
            showIssues: false,
            showUsers: false,
            showWords: true,
          },
          formatOnPaste: false,
          formatOnType: false,
          ...options,
        }"
        @change="handleChange"
      />
    </div>
    <div v-if="validationError" class="validation-error">
      <i class="el-icon-warning-outline" />
      <span>格式错误: {{ validationError.message }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mql-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

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
</style>
