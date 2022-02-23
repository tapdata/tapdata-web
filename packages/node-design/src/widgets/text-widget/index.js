import { isStr, isPlainObj } from '@daas/shared'
import { GlobalRegistry } from '../../core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, computed } from 'vue-demi'

export const TextWidget = observer(
  defineComponent({
    setup(props, { slots }) {
      const takeLocale = message => {
        if (isStr(message)) return message
        if (isPlainObj(message)) {
          const lang = GlobalRegistry.getDesignerLanguage()
          for (let key in message) {
            if (key.toLocaleLowerCase() === lang) return message[key]
          }
          return
        }
        return message
      }
      const takeMessage = token => {
        if (!token) return
        const message = isStr(token) ? GlobalRegistry.getDesignerMessage(token) : token
        if (message) return takeLocale(message)
        return token
      }

      let txt

      if (slots.default) {
        txt = computed(() => {
          const slot = slots.default?.()
          console.log('txt：computed', slot)
          return slot[0]?.text
        })
      }

      return () => (
        <span>{takeMessage(txt?.value) || takeMessage(props.token) || takeMessage(props.defaultMessage)}</span>
      )
    }
  })
)
