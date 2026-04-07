import Highlight from '@tap/component/src/base/Highlight'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { useDark } from '@vueuse/core'
import { defineComponent, nextTick, ref } from 'vue'

export const PipelinePreview = defineComponent({
  name: 'PipelinePreview',
  props: {
    code: {
      type: String,
      default: '[]',
    },
  },
  setup(props) {
    const isDark = useDark()
    const { t } = useI18n()
    const tooltipRef = ref<any>(null)
    const tooltipContent = ref(t('public_button_copy'))

    const onCopy = async () => {
      await copyToClipboard(props.code)
      tooltipContent.value = t('public_message_copied')
      nextTick(() => {
        tooltipRef.value?.updatePopper?.()
      })
    }

    const onMouseleave = () => {
      setTimeout(() => {
        tooltipContent.value = t('public_button_copy')
      }, 200)
    }

    return () => (
      <div class="pipeline-preview mt-4">
        <div class="pipeline-preview__header flex align-center justify-between mb-2">
          <span class="text-sm font-medium">
            {t('packages_form_aggregate_pipeline_preview')}
          </span>
          <ElTooltip
            ref={tooltipRef}
            content={tooltipContent.value}
            placement="top"
            transition="tooltip-fade-in"
          >
            <el-button
              icon={IconLucideCopy}
              text
              size="small"
              onClick={onCopy}
              onMouseleave={onMouseleave}
            />
          </ElTooltip>
        </div>
        <div
          class={`pipeline-preview__code position-relative theme-${isDark.value ? 'atom-one-dark' : 'atom-one-light'}`}
        >
          {/* @ts-expect-error Highlight lacks proper type declarations */}
          <Highlight language="json" code={props.code} />
        </div>
      </div>
    )
  },
})
