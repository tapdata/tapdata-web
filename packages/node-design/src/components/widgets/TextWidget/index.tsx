import { observer } from '@formily/reactive-vue'
import { isPlainObj, isStr } from '@formily/shared'
import { isText } from 'element-plus/es/utils/index'
import { defineComponent, isVNode } from 'vue'
import { GlobalRegistry } from '../../../core'
import type { IDesignerMiniLocales } from '../../../types'

export interface ITextWidgetProps {
  componentName?: string
  sourceName?: string
  token?: string | IDesignerMiniLocales
  defaultMessage?: string | IDesignerMiniLocales
}

const TextWidgetComponent = defineComponent({
  props: {
    componentName: String,
    sourceName: String,
    token: String,
    defaultMessage: String,
  },
  setup(props, { slots }) {
    const takeLocale = (message: string | IDesignerMiniLocales) => {
      if (isStr(message)) return message
      if (isPlainObj(message)) {
        const lang = GlobalRegistry.getDesignerLanguage()
        for (const key in message) {
          if (key.toLocaleLowerCase() === lang) return message[key]
        }
        return
      }
      return message
    }

    const takeMessage = (token: any) => {
      if (!token) return
      token = isVNode(token) ? (isText(token) ? token.children : token) : token
      const message = isStr(token)
        ? GlobalRegistry.getDesignerMessage(token)
        : token
      if (message) return takeLocale(message)
      return token
    }
    /**
     * 子节点为TextNode的vnode
     * 子节点为i18n对象
     */
    return () => (
      <>
        {takeMessage(slots.default?.()?.[0]) ||
          takeMessage(props.token) ||
          takeMessage(props.defaultMessage)}
      </>
    )
  },
})

export const TextWidget = observer(TextWidgetComponent)
