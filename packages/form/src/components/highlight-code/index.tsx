import Highlight from '@tap/component/src/base/Highlight'
import { IconButton } from '@tap/component/src/icon-button'
import i18n from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { defineComponent, nextTick, ref } from 'vue'
import 'highlight.js/styles/atom-one-light.min.css'
import './style.scss'

export const HighlightCode = defineComponent({
  props: {
    code: String,
    theme: {
      type: String,
      default: 'atom-one-light',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    copy: Boolean,
    tooltip: {
      type: String,
      default: () => {
        return i18n.t('public_button_copy')
      },
    },
    finishTooltip: {
      type: String,
      default: () => {
        return i18n.t('public_message_copied')
      },
    },
  },
  setup(props) {
    const tooltipRef = ref(null)
    const copy = async () => {
      await copyToClipboard(props.code)
      contentRef.value = props.finishTooltip

      // 提示内容改变，更新popper位置
      nextTick(() => {
        tooltipRef.value.updatePopper()
      })
    }

    const contentRef = ref(props.tooltip)
    const onMouseleave = () => {
      setTimeout(() => {
        contentRef.value = props.tooltip
      }, 200)
    }

    return () => {
      return (
        <Highlight
          class={`hljs-pre position-relative theme-${props.theme}`}
          language={props.language}
          code={props.code}
        >
          {props.copy && (
            <ElTooltip
              ref={tooltipRef}
              transition="tooltip-fade-in"
              placement="top"
              content={contentRef.value}
            >
              <IconButton
                onClick={copy}
                onMouseleave={onMouseleave}
                class="hljs-copy-btn position-absolute border bg-white"
              >
                copy
              </IconButton>
            </ElTooltip>
          )}
        </Highlight>
      )
    }
  },
})

export default HighlightCode
