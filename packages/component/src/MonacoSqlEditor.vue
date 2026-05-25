<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution'
import 'monaco-editor/esm/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution'

// Ensure MonacoEnvironment is set only once
if (!(self as any).MonacoEnvironment) {
  ;(self as any).MonacoEnvironment = {
    getWorker() {
      return new editorWorker()
    },
  }
}

interface Props {
  modelValue?: string
  placeholder?: string
  theme?: string
  height?: string
  options?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  theme: 'vs',
  height: '100%',
  options: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorContainer = useTemplateRef<HTMLElement>('editorContainer')
let editor: monaco.editor.IStandaloneCodeEditor | null = null
const isEmpty = ref(!props.modelValue)

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: 'sql',
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  glyphMargin: false,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  scrollbar: { vertical: 'auto', horizontal: 'auto' },
  renderLineHighlight: 'line',
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  stickyScroll: { enabled: true },
}

function createEditor() {
  if (!editorContainer.value) return

  editor = monaco.editor.create(editorContainer.value, {
    ...defaultOptions,
    ...props.options,
    value: props.modelValue,
    theme: props.theme,
  })

  isEmpty.value = !editor.getValue()

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue()
    isEmpty.value = !value
    emit('update:modelValue', value)
  })
}

function disposeEditor() {
  if (editor) {
    editor.dispose()
    editor = null
  }
}

/** Set editor value programmatically (e.g. insert sample) */
function setValue(value: string) {
  if (editor) {
    editor.setValue(value)
  }
}

/** Get the raw monaco editor instance */
function getEditor() {
  return editor
}

watch(
  () => props.modelValue,
  (val) => {
    if (editor && val !== editor.getValue()) {
      editor.setValue(val)
    }
  },
)

watch(
  () => props.theme,
  (newTheme) => {
    if (editor) {
      monaco.editor.setTheme(newTheme)
    }
  },
)

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  disposeEditor()
})

defineExpose({
  setValue,
  getEditor,
})
</script>

<template>
  <div class="monaco-sql-editor position-relative w-100" :style="{ height }">
    <div ref="editorContainer" class="w-100 h-100" />
    <div
      v-if="isEmpty && placeholder"
      class="position-absolute"
      style="
        top: 0;
        left: 50px;
        pointer-events: none;
        color: var(--el-text-color-placeholder);
        font-size: 13px;
        font-family: Menlo, Monaco, 'Courier New', monospace;
        line-height: 19px;
        padding-top: 1px;
      "
    >
      {{ placeholder }}
    </div>
  </div>
</template>
