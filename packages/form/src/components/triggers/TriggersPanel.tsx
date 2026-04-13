import { SchemaExpressionScopeSymbol, useForm } from '@formily/vue'
import { useI18n } from '@tap/i18n'
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import { resolveSourceInfo } from '../aggregate/resolveSourceInfo'
import './style.scss'

export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE' | 'REPLACE'
export type EventType = 'tapdata_js' | 'mongo_function'

export interface TriggersPanelValue {
  operationType: OperationType
  eventType: EventType
  code: string
  // 源节点信息（自动加载）
  connectionName: string
  databaseName: string
  tableName: string
  connectionId: string
  databaseType: string
}

const getTapdataJsTemplate = (t: (key: string) => string) =>
  `// ${t('packages_form_triggers_tpl_tapdata_title')}
// record: ${t('packages_form_triggers_tpl_tapdata_record')}
// context: ${t('packages_form_triggers_tpl_tapdata_context')}

function process(record, context) {
  // ${t('packages_form_triggers_tpl_write_logic')}

  // ${t('packages_form_triggers_tpl_tapdata_return')}
  return record;
}
`

const getMongoFunctionTemplate = (t: (key: string) => string) =>
  `// ${t('packages_form_triggers_tpl_mongo_title')}
// changeEvent: ${t('packages_form_triggers_tpl_mongo_change_event')}

exports = async function(changeEvent) {
  const docId = changeEvent.documentKey._id;
  const { updateDescription, fullDocument } = changeEvent;

  // ${t('packages_form_triggers_tpl_write_logic')}

  return;
};
`

const OP_OPTIONS: { value: OperationType; icon: string }[] = [
  { value: 'INSERT', icon: 'i-lucide-plus-circle' },
  { value: 'UPDATE', icon: 'i-lucide-pencil' },
  { value: 'DELETE', icon: 'i-lucide-trash-2' },
  { value: 'REPLACE', icon: 'i-lucide-replace' },
]

export const TriggersPanel = defineComponent({
  name: 'TriggersPanel',
  props: {
    disabled: { type: Boolean, default: false },
    value: {
      type: Object as PropType<TriggersPanelValue>,
      default: (): TriggersPanelValue => ({
        operationType: 'INSERT',
        eventType: 'tapdata_js',
        code: '',
        connectionName: '',
        databaseName: '',
        tableName: '',
        connectionId: '',
        databaseType: '',
      }),
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const sourceLoading = ref(false)
    const copied = ref(false)
    const textareaRef = ref<HTMLTextAreaElement>()

    // Formily context
    let nodeId: string | undefined
    let findNodeById: ((id: string) => any) | undefined
    try {
      const formRef = useForm()
      nodeId = formRef.value?.values?.id
      const scopeRef = inject<any>(SchemaExpressionScopeSymbol, null)
      findNodeById = scopeRef?.value?.findNodeById
    } catch {
      // not inside formily
    }

    const emitChange = (val: TriggersPanelValue) => emit('change', val)

    const config = computed({
      get: () => props.value,
      set: (val) => emitChange(val),
    })

    // Load source info from DAG
    const loadSourceInfo = async () => {
      if (!nodeId || !findNodeById) return
      sourceLoading.value = true
      try {
        const info = await resolveSourceInfo(nodeId, findNodeById)
        if (info) {
          emitChange({
            ...props.value,
            connectionName: info.connectionName,
            databaseName: info.databaseName,
            tableName: info.tableName,
            connectionId: info.connectionId,
            databaseType: info.databaseType,
          })
        }
      } catch (error) {
        console.error('TriggersPanel loadSourceInfo error', error)
      } finally {
        sourceLoading.value = false
      }
    }

    onMounted(() => {
      loadSourceInfo()
      // 初始化时若 code 为空，填充对应语言的模板
      if (!props.value.code) {
        const template =
          props.value.eventType === 'tapdata_js'
            ? getTapdataJsTemplate(t)
            : getMongoFunctionTemplate(t)
        emitChange({ ...props.value, code: template })
      }
    })

    // Operation type
    const operationType = computed({
      get: () => config.value.operationType,
      set: (val) => emitChange({ ...config.value, operationType: val }),
    })

    // Event type
    const eventType = computed({
      get: () => config.value.eventType,
      set: (val) => {
        const template =
          val === 'tapdata_js'
            ? getTapdataJsTemplate(t)
            : getMongoFunctionTemplate(t)
        emitChange({ ...config.value, eventType: val, code: template })
      },
    })

    // Code
    const code = computed({
      get: () => config.value.code,
      set: (val) => emitChange({ ...config.value, code: val }),
    })

    // Line numbers
    const lineCount = computed(() => (code.value || '').split('\n').length)

    // Textarea Tab support
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = e.target as HTMLTextAreaElement
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const val = ta.value
        const newVal = `${val.slice(0, Math.max(0, start))}  ${val.slice(Math.max(0, end))}`
        code.value = newVal
        nextTick(() => {
          ta.selectionStart = ta.selectionEnd = start + 2
        })
      }
    }

    // Auto-resize textarea
    const autoResize = () => {
      const ta = textareaRef.value
      if (!ta) return
      ta.style.height = 'auto'
      ta.style.height = `${Math.max(300, ta.scrollHeight)}px`
    }
    watch(code, () => nextTick(autoResize))
    onMounted(() => nextTick(autoResize))

    // Copy to clipboard
    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(code.value)
        copied.value = true
        setTimeout(() => (copied.value = false), 2000)
      } catch {
        /* noop */
      }
    }

    return () => (
      <div class="triggers-panel">
        {/* 1. Source Info */}
        <div class="triggers-panel__source rounded-xl mt-3 py-2">
          <span class="triggers-panel__source-dot" />
          <span class="triggers-panel__source-name">
            {sourceLoading.value
              ? t('packages_form_triggers_loading')
              : config.value.tableName || t('packages_form_triggers_no_source')}
          </span>
        </div>

        {/* 2. Operation Type */}
        <div class="triggers-panel__section">
          <label class="triggers-panel__label">
            <span class="triggers-panel__required">*</span>
            {t('packages_form_triggers_operation_type')}
          </label>
          <ElSelect
            modelValue={operationType.value}
            onUpdate:modelValue={(val: OperationType) =>
              (operationType.value = val)
            }
            disabled={props.disabled}
            class="w-full"
            multiple
            clearable
          >
            {OP_OPTIONS.map((op) => (
              <ElOption
                key={op.value}
                value={op.value}
                label={t(`packages_form_triggers_op_${op.value.toLowerCase()}`)}
              >
                <div class="flex align-center gap-2">
                  <el-icon>
                    <component is={op.icon} />
                  </el-icon>
                  <span>
                    {t(`packages_form_triggers_op_${op.value.toLowerCase()}`)}
                  </span>
                </div>
              </ElOption>
            ))}
          </ElSelect>
        </div>

        {/* 3. Event Type Tabs */}
        <div class="triggers-panel__section">
          <label class="triggers-panel__label">
            {t('packages_form_triggers_event_type')}
          </label>
          <div class="triggers-panel__tabs">
            <button
              class={[
                'triggers-panel__tab',
                { 'is-active': eventType.value === 'tapdata_js' },
              ]}
              disabled={props.disabled}
              onClick={() => (eventType.value = 'tapdata_js')}
            >
              TapData JS
            </button>
            <button
              class={[
                'triggers-panel__tab',
                { 'is-active': eventType.value === 'mongo_function' },
              ]}
              disabled={props.disabled}
              onClick={() => (eventType.value = 'mongo_function')}
            >
              Mongo Function
            </button>
          </div>
        </div>

        {/* 4. Code Editor */}
        <div class="triggers-panel__editor-wrap">
          <div class="triggers-panel__editor-toolbar">
            <span class="triggers-panel__editor-type">
              {eventType.value === 'tapdata_js'
                ? 'TapData JS'
                : 'Mongo Function'}
            </span>
            <div class="triggers-panel__editor-actions">
              <ElTooltip
                content={
                  copied.value
                    ? t('packages_form_triggers_copied')
                    : t('packages_form_triggers_copy')
                }
                placement="top"
                enterable={false}
              >
                <el-button text size="small" onClick={copyCode}>
                  {copied.value ? <i-lucide-check /> : <i-lucide-copy />}
                </el-button>
              </ElTooltip>
              <ElTooltip
                content={t('packages_form_triggers_test_run')}
                placement="top"
                enterable={false}
              >
                <el-button text size="small">
                  <i-lucide-play />
                </el-button>
              </ElTooltip>
            </div>
          </div>
          <div class="triggers-panel__editor">
            <div class="triggers-panel__line-numbers">
              {Array.from({ length: lineCount.value }, (_, i) => (
                <div key={i} class="triggers-panel__line-number">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              class="triggers-panel__textarea"
              value={code.value}
              onInput={(e: Event) =>
                (code.value = (e.target as HTMLTextAreaElement).value)
              }
              onKeydown={onKeydown}
              disabled={props.disabled}
              spellcheck={false}
            />
          </div>
        </div>

        {/* 5. Help Area */}
        <div class="triggers-panel__help">
          <el-icon class="triggers-panel__help-icon">
            <i-lucide-info />
          </el-icon>
          <div class="triggers-panel__help-content">
            {eventType.value === 'tapdata_js' ? (
              <div>
                <p class="triggers-panel__help-title">
                  {t('packages_form_triggers_help_tapdata_title')}
                </p>
                <p>{t('packages_form_triggers_help_tapdata_desc')}</p>
              </div>
            ) : (
              <div>
                <p class="triggers-panel__help-title">
                  {t('packages_form_triggers_help_mongo_title')}
                </p>
                <p>{t('packages_form_triggers_help_mongo_desc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
})
