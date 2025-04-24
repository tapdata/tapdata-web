import { defineComponent, ref, nextTick } from 'vue'

import i18n from '@tap/i18n'

export const ClipboardButton = defineComponent({
  name: 'ClipboardButton',
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
  setup(props, { attrs }) {
    // 声明一个 ref 来存放该元素的引用
    // 必须和模板里的 ref 同名
    const btnRef = ref(null)
    const iconRef = ref(null)
    const tooltipRef = ref(null)
    const contentRef = ref(props.tooltip)
    const onMouseleave = () => {
      btnRef.value.$el.blur()
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
      props.icon ? iconRef.value.focus() : btnRef.value.$el.focus()
      contentRef.value = props.finishTooltip

      // 提示内容改变，更新popper位置
      nextTick(() => {
        tooltipRef.value.updatePopper()
      })
    }

    return () => {
      return (
        <ElTooltip
          ref={tooltipRef}
          transition="tooltip-fade-in"
          placement="top"
          content={contentRef.value}
          hide-after={0}
        >
          {props.icon ? (
            <i
              ref={iconRef}
              class="p-2 cursor-pointer iconfont icon-fuzhi1"
              style="min-width: unset;"
              attrs={attrs}
              onClick={onCopy}
              on={onMouseleave}
            ></i>
          ) : (
            <ElButton
              ref={btnRef}
              class="p-2"
              style="min-width: unset;"
              attrs={attrs}
              onClick={onCopy}
              onMouseleave={onMouseleave}
            >
              <VIcon>copy</VIcon>
              {props.title}
            </ElButton>
          )}
        </ElTooltip>
      )
    }
  },
})
export default ClipboardButton
