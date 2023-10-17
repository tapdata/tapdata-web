import { isStr, isPlainObj } from '@tap/shared'
import { GlobalRegistry } from '../../../core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, computed, ref } from 'vue-demi'

export const TextWidget = observer(
  defineComponent({
    props: {
      token: [String, Object]
    },
    setup(props, ctx) {
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

      let txt = ref()

      if (ctx.slots.default) {
        // console.log('ctx.slots.default', ctx.slots.default)
        txt = computed(() => {
          const slot = ctx.slots.default?.()
          // console.log('TextWidget', slot[0]?.text)
          return slot[0]?.text
        })
      }

      return () => (
        <span>{takeMessage(txt?.value) || takeMessage(props.token) || takeMessage(props.defaultMessage)}</span>
      )
    }
  })
)
