import { createContext, useContext } from '@tap/shared'
import { defineComponent } from 'vue'
import { usePrefix } from '../../../hooks'
import { IconWidget } from '../../widgets'
import './styles.scss'

const InputItemsContext = createContext(null)

export const InputItems = defineComponent({
  props: {
    vertical: Boolean,
    width: {
      type: String,
      default: '100%',
    },
  },
  setup: (props, { attrs, slots }) => {
    const prefixRef = usePrefix('input-items')
    return () => {
      const prefix = prefixRef.value
      return (
        <InputItemsContext.Provider value={props}>
          <div class={[prefix, attrs.class]} style={attrs.style}>
            {slots.default?.()}
          </div>
        </InputItemsContext.Provider>
      )
    }
  },
})

InputItems.Item = defineComponent({
  props: {
    vertical: Boolean,
    title: String,
    icon: String,
    width: {
      type: String,
    },
  },
  setup: (props, { slots }) => {
    const prefixRef = usePrefix('input-items-item')
    const ctxRef = useContext(InputItemsContext)
    return () => {
      const prefix = prefixRef.value
      const ctx = ctxRef.value
      return (
        <div
          class={[
            prefix,
            {
              vertical: props.vertical || ctx.vertical,
            },
          ]}
          style={{ width: props.width || ctx.width }}
        >
          {props.icon && (
            <div class={`${prefix}-icon`}>
              <IconWidget infer={props.icon} size={16} />
            </div>
          )}
          {props.title && <div class={`${prefix}-title`}>{props.title}</div>}
          <div class={`${prefix}-controller`}>{slots.default?.()}</div>
        </div>
      )
    }
  },
})
