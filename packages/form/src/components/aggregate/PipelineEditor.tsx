import { useI18n } from '@tap/i18n'
import { useFullscreen } from '@vueuse/core'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import { AiAggregateDialog } from './AiAggregateDialog'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController'
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution'
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching'
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding'
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController'
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions'
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter'

// Monaco worker setup (idempotent)
if (!(self as any).__pipelineEditorWorkerSetup) {
  ;(self as any).__pipelineEditorWorkerSetup = true
  ;(self as any).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'json') return new jsonWorker()
      return new editorWorker()
    },
  }
}

/** MongoDB aggregation stage operators — detail keys for i18n */
const MONGO_AGG_OPERATORS = [
  { label: '$match', detailKey: 'packages_form_aggregate_op_match' },
  { label: '$group', detailKey: 'packages_form_aggregate_op_group' },
  { label: '$project', detailKey: 'packages_form_aggregate_op_project' },
  { label: '$sort', detailKey: 'packages_form_aggregate_op_sort' },
  { label: '$limit', detailKey: 'packages_form_aggregate_op_limit' },
  { label: '$skip', detailKey: 'packages_form_aggregate_op_skip' },
  { label: '$unwind', detailKey: 'packages_form_aggregate_op_unwind' },
  { label: '$lookup', detailKey: 'packages_form_aggregate_op_lookup' },
  { label: '$addFields', detailKey: 'packages_form_aggregate_op_addFields' },
  { label: '$set', detailKey: 'packages_form_aggregate_op_set' },
  { label: '$unset', detailKey: 'packages_form_aggregate_op_unset' },
  {
    label: '$replaceRoot',
    detailKey: 'packages_form_aggregate_op_replaceRoot',
  },
  { label: '$count', detailKey: 'packages_form_aggregate_op_count' },
  { label: '$out', detailKey: 'packages_form_aggregate_op_out' },
  { label: '$merge', detailKey: 'packages_form_aggregate_op_merge' },
  // Accumulator / expression operators
  { label: '$sum', detailKey: 'packages_form_aggregate_op_sum' },
  { label: '$avg', detailKey: 'packages_form_aggregate_op_avg' },
  { label: '$min', detailKey: 'packages_form_aggregate_op_min' },
  { label: '$max', detailKey: 'packages_form_aggregate_op_max' },
  { label: '$first', detailKey: 'packages_form_aggregate_op_first' },
  { label: '$last', detailKey: 'packages_form_aggregate_op_last' },
  { label: '$push', detailKey: 'packages_form_aggregate_op_push' },
  { label: '$addToSet', detailKey: 'packages_form_aggregate_op_addToSet' },
  // Comparison / logical
  { label: '$eq', detailKey: 'packages_form_aggregate_op_eq' },
  { label: '$ne', detailKey: 'packages_form_aggregate_op_ne' },
  { label: '$gt', detailKey: 'packages_form_aggregate_op_gt' },
  { label: '$gte', detailKey: 'packages_form_aggregate_op_gte' },
  { label: '$lt', detailKey: 'packages_form_aggregate_op_lt' },
  { label: '$lte', detailKey: 'packages_form_aggregate_op_lte' },
  { label: '$in', detailKey: 'packages_form_aggregate_op_in' },
  { label: '$nin', detailKey: 'packages_form_aggregate_op_nin' },
  { label: '$and', detailKey: 'packages_form_aggregate_op_and' },
  { label: '$or', detailKey: 'packages_form_aggregate_op_or' },
  { label: '$not', detailKey: 'packages_form_aggregate_op_not' },
  { label: '$nor', detailKey: 'packages_form_aggregate_op_nor' },
  { label: '$exists', detailKey: 'packages_form_aggregate_op_exists' },
  { label: '$type', detailKey: 'packages_form_aggregate_op_type' },
  { label: '$regex', detailKey: 'packages_form_aggregate_op_regex' },
  { label: '$all', detailKey: 'packages_form_aggregate_op_all' },
  { label: '$elemMatch', detailKey: 'packages_form_aggregate_op_elemMatch' },
  { label: '$size', detailKey: 'packages_form_aggregate_op_size' },
]

export interface FieldItem {
  field_name: string
  data_type?: string
}

export const PipelineEditor = defineComponent({
  name: 'PipelineEditor',
  props: {
    modelValue: { type: String, default: '[\n  \n]' },
    fields: { type: Array as PropType<FieldItem[]>, default: () => [] },
    height: { type: [Number, String], default: 260 },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const containerRef = ref<HTMLDivElement>()
    let editor: monaco.editor.IStandaloneCodeEditor | null = null
    let completionDisposable: monaco.IDisposable | null = null

    const registerCompletion = () => {
      completionDisposable?.dispose()
      completionDisposable = monaco.languages.registerCompletionItemProvider(
        'json',
        {
          triggerCharacters: ['$', '"', '{'],
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const lineContent = model.getLineContent(position.lineNumber)
            const textBefore = lineContent.slice(
              0,
              Math.max(0, position.column - 1),
            )
            const lastQuote = Math.max(
              textBefore.lastIndexOf('"'),
              textBefore.lastIndexOf("'"),
            )
            const inQuotes =
              lastQuote > -1 && !textBefore.slice(lastQuote + 1).includes('"')

            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            }

            const suggestions: monaco.languages.CompletionItem[] = []

            // Operator suggestions
            MONGO_AGG_OPERATORS.filter((op) =>
              op.label.toLowerCase().startsWith(word.word.toLowerCase()),
            ).forEach((op) => {
              suggestions.push({
                label: op.label,
                kind: monaco.languages.CompletionItemKind.Operator,
                detail: t(op.detailKey),
                insertText: inQuotes ? op.label : `"${op.label}"`,
                range,
                sortText: `2${op.label}`,
              })
            })

            // Field suggestions
            if (props.fields.length) {
              props.fields
                .filter((f) =>
                  f.field_name
                    ?.toLowerCase()
                    .startsWith(word.word.toLowerCase()),
                )
                .forEach((f) => {
                  suggestions.push({
                    label: f.field_name,
                    kind: monaco.languages.CompletionItemKind.Field,
                    detail: f.data_type || 'field',
                    insertText: inQuotes ? f.field_name : `"${f.field_name}"`,
                    range,
                    sortText: `1${f.field_name}`,
                  })
                })
            }

            return { suggestions }
          },
        },
      )
    }

    onMounted(async () => {
      await nextTick()
      if (!containerRef.value) return

      editor = monaco.editor.create(containerRef.value, {
        value: props.modelValue,
        language: 'json',
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        readOnly: props.disabled,
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: false,
        fontSize: 12,
        tabSize: 2,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        wordBasedSuggestions: 'off',
        formatOnPaste: true,
      })

      editor.onDidChangeModelContent(() => {
        const val = editor!.getValue()
        emit('update:modelValue', val)
        emit('change', val)
      })

      registerCompletion()
    })

    watch(
      () => props.modelValue,
      (val) => {
        if (editor && editor.getValue() !== val) {
          editor.setValue(val || '')
        }
      },
    )

    watch(() => props.fields, registerCompletion)

    watch(
      () => props.disabled,
      (val) => editor?.updateOptions({ readOnly: val }),
    )

    onBeforeUnmount(() => {
      completionDisposable?.dispose()
      editor?.dispose()
      editor = null
    })

    const wrapRef = ref<HTMLElement>()
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(wrapRef)

    // 全屏切换后重新布局编辑器
    watch(isFullscreen, () => nextTick(() => editor?.layout()))

    const formatCode = async () => {
      if (!editor) return
      const formatAction = editor.getAction('editor.action.formatDocument')
      if (formatAction) {
        await formatAction.run()
      }
    }

    const showAiDialog = ref(false)

    const onAiApply = (code: string) => {
      if (editor) {
        editor.setValue(code)
      }
      emit('update:modelValue', code)
      emit('change', code)
    }

    const heightPx =
      typeof props.height === 'number' ? `${props.height}px` : props.height

    return () => (
      <div
        ref={wrapRef}
        class={[
          'pipeline-editor-wrap',
          { 'is-fullscreen': isFullscreen.value },
        ]}
      >
        <div class="pipeline-editor-toolbar">
          {/* <ElTooltip
            content={t('packages_form_aggregate_ai_btn')}
            placement="top"
            enterable={false}
          >
            <el-button
              text
              size="small"
              onClick={() => (showAiDialog.value = true)}
              icon={IconLucideSparkles}
            />
          </ElTooltip> */}
          <ElTooltip
            content={t('packages_form_aggregate_format')}
            placement="top"
            enterable={false}
          >
            <el-button
              text
              size="small"
              onClick={formatCode}
              icon={IconLucideAlignLeft}
            />
          </ElTooltip>
          <ElTooltip
            content={
              isFullscreen.value
                ? t('packages_form_aggregate_exit_fullscreen')
                : t('packages_form_aggregate_fullscreen')
            }
            placement="top"
            enterable={false}
          >
            <el-button
              text
              size="small"
              onClick={toggleFullscreen}
              icon={
                isFullscreen.value ? IconLucideMinimize2 : IconLucideMaximize2
              }
            />
          </ElTooltip>
        </div>
        <div
          ref={containerRef}
          class="pipeline-editor"
          style={{ height: isFullscreen.value ? undefined : heightPx }}
        />
        <AiAggregateDialog
          visible={showAiDialog.value}
          onUpdate:visible={(val: boolean) => (showAiDialog.value = val)}
          fields={props.fields}
          existingCode={props.modelValue}
          onApply={onAiApply}
        />
      </div>
    )
  },
})
