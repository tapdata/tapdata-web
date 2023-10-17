import { defineComponent, ref, nextTick } from 'vue-demi'

import i18n from '@tap/i18n'

export const ClipboardButton = defineComponent({
  props: {
    content: String,
    title: String,
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
    icon: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, refs }) {
    const contentRef = ref(props.tooltip)
    const onMouseleave = () => {
      // 加快关闭tooltip
      refs.tooltip.setExpectedState(false)
      refs.tooltip.handleClosePopper()
      setTimeout(() => {
        contentRef.value = props.tooltip
      }, 200)
    }
    const onCopy = () => {
      const input = document.createElement('textarea')
      input.style.fontSize = '12pt'
      input.style.border = '0'
      input.style.padding = '0'
      input.style.margin = '0'
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      input.style.top = document.documentElement.scrollTop + 'px'
      input.setAttribute('readonly', '')
      input.value = props.content

      document.body.appendChild(input)
      input.select() // 这里会触发ElTooltip -> Button 的blur，下面要主动focus
      document.execCommand?.('copy')
      document.body.removeChild(input)
      props.icon ? refs.icon.focus() : refs.btn.$el.focus()
      contentRef.value = props.finishTooltip

      // 提示内容改变，更新popper位置
      nextTick(() => {
        refs.tooltip.updatePopper()
      })
    }

    return () => {
      return (
        <ElTooltip
          ref="tooltip"
          transition="tooltip-fade-in"
          placement="top"
          content={contentRef.value}
        >
          {props.icon ? (
            <i
              ref="icon"
              class="p-2 cursor-pointer iconfont icon-fuzhi1"
              style="min-width: unset;"
              attrs={attrs}
              onClick={onCopy}
              on={onMouseleave}
            ></i>
          ) : (
            <ElButton
              ref="btn"
              class="p-2"
              style="min-width: unset;"
              icon="el-icon-document-copy"
              attrs={attrs}
              onClick={onCopy}
              vOn:mouseleave_native={onMouseleave}
            >
              {props.title}
            </ElButton>
          )}
        </ElTooltip>
      )
    }
  },
})
export default ClipboardButton
