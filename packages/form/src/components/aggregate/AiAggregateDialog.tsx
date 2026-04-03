import {
  generateAiAggregateStream,
  type AiAggregateRequest,
} from '@tap/api/src/core/ai'
import { useI18n } from '@tap/i18n'
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  type PropType,
} from 'vue'
import type { FieldItem } from './PipelineEditor'

export const AiAggregateDialog = defineComponent({
  name: 'AiAggregateDialog',
  props: {
    visible: Boolean,
    fields: { type: Array as PropType<FieldItem[]>, default: () => [] },
    existingCode: { type: String, default: '' },
  },
  emits: ['update:visible', 'apply'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const prompt = ref('')
    const generatedCode = ref('')
    const isGenerating = ref(false)
    const errorMsg = ref('')
    const resultRef = ref<HTMLPreElement>()
    let abortController: AbortController | null = null

    const doGenerate = () => {
      if (!prompt.value.trim()) return
      isGenerating.value = true
      errorMsg.value = ''
      generatedCode.value = ''
      const data: AiAggregateRequest = {
        prompt: prompt.value,
        fields: props.fields.map((f) => ({
          name: f.field_name,
          type: f.data_type || 'String',
        })),
      }
      if (props.existingCode?.trim()) data.existingCode = props.existingCode
      abortController = generateAiAggregateStream(data, {
        onChunk(content) {
          generatedCode.value += content
          nextTick(() => {
            if (resultRef.value)
              resultRef.value.scrollTop = resultRef.value.scrollHeight
          })
        },
        onDone(code) {
          generatedCode.value = code
          isGenerating.value = false
        },
        onError(err) {
          errorMsg.value = err || t('packages_form_aggregate_ai_error')
          isGenerating.value = false
        },
      })
    }
    const stopGenerate = () => {
      abortController?.abort()
      abortController = null
      isGenerating.value = false
    }
    const applyCode = () => {
      emit('apply', generatedCode.value)
      closeDialog()
    }
    const closeDialog = () => {
      stopGenerate()
      emit('update:visible', false)
    }
    onBeforeUnmount(stopGenerate)

    return () => (
      <ElDialog
        modelValue={props.visible}
        onUpdate:modelValue={(val: boolean) => emit('update:visible', val)}
        title={t('packages_form_aggregate_ai_title')}
        width="640px"
        destroyOnClose
        onClose={closeDialog}
        v-slots={{
          footer: () => (
            <div class="flex align-center gap-2">
              {isGenerating.value ? (
                <ElButton onClick={stopGenerate}>
                  {t('packages_form_aggregate_ai_stop')}
                </ElButton>
              ) : (
                <>
                  <ElButton
                    type="primary"
                    onClick={doGenerate}
                    disabled={!prompt.value.trim()}
                  >
                    {generatedCode.value
                      ? t('packages_form_aggregate_ai_retry')
                      : t('packages_form_aggregate_ai_btn')}
                  </ElButton>
                  {generatedCode.value && (
                    <ElButton type="success" onClick={applyCode}>
                      {t('packages_form_aggregate_ai_apply')}
                    </ElButton>
                  )}
                </>
              )}
            </div>
          ),
        }}
      >
        <div class="ai-aggregate-dialog">
          <ElInput
            type="textarea"
            modelValue={prompt.value}
            onUpdate:modelValue={(val: string) => (prompt.value = val)}
            placeholder={t('packages_form_aggregate_ai_placeholder')}
            autosize={{ minRows: 3, maxRows: 6 }}
            disabled={isGenerating.value}
            onKeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                doGenerate()
              }
            }}
          />
          {(generatedCode.value || isGenerating.value) && (
            <pre ref={resultRef} class="ai-aggregate-dialog__result">
              <code>{generatedCode.value}</code>
              {isGenerating.value && (
                <span class="ai-aggregate-dialog__cursor">▊</span>
              )}
            </pre>
          )}
          {errorMsg.value && (
            <ElAlert
              type="error"
              title={errorMsg.value}
              closable={false}
              class="mt-2"
            />
          )}
        </div>
      </ElDialog>
    )
  },
})
