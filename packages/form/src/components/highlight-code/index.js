import { defineComponent, nextTick, ref } from 'vue-demi'
import { Highlight, IconButton } from '@tap/component'
import i18n from '@tap/i18n'
import 'highlight.js/styles/atom-one-light.css'
import './style.scss'

export const HighlightCode = defineComponent({
  props: {
    code: String,
    theme: {
      type: String,
      default: 'atom-one-light'
    },
    language: {
      type: String,
      default: 'javascript'
    },
    copy: Boolean,
    tooltip: {
      type: String,
      default: () => {
        return i18n.t('public_button_copy')
      }
    },
    finishTooltip: {
      type: String,
      default: () => {
        return i18n.t('public_message_copied')
      }
    }
  },
  setup(props, { refs }) {
    const copy = async () => {
      await navigator.clipboard.writeText(props.code)
      contentRef.value = props.finishTooltip

      // 提示内容改变，更新popper位置
      nextTick(() => {
        refs.tooltip.updatePopper()
      })
    }

    const contentRef = ref(props.tooltip)
    const onMouseleave = () => {
      // 加快关闭tooltip
      refs.tooltip.setExpectedState(false)
      refs.tooltip.handleClosePopper()
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
            <ElTooltip ref="tooltip" transition="tooltip-fade-in" placement="top" content={contentRef.value}>
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
  }
})

export default HighlightCode
