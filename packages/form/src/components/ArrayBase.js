import { defineComponent } from 'vue-demi'
import { useField, h } from '@formily/vue'
import { clone, isValid } from '@formily/shared'
import { ArrayItems, ArrayBase } from '@formily/element'
import { Button } from 'element-ui'
import { stylePrefix } from './configs'

const getDefaultValue = (defaultValue, schema) => {
  if (isValid(defaultValue)) return clone(defaultValue)
  if (Array.isArray(schema?.items)) return getDefaultValue(defaultValue, schema.items[0])
  if (schema?.items?.type === 'array') return []
  if (schema?.items?.type === 'boolean') return true
  if (schema?.items?.type === 'date') return ''
  if (schema?.items?.type === 'datetime') return ''
  if (schema?.items?.type === 'number') return 0
  if (schema?.items?.type === 'object') return {}
  if (schema?.items?.type === 'string') return ''
  return null
}

const ArrayBaseAddition = defineComponent({
  name: 'ArrayBaseAddition',
  props: ['title', 'method', 'defaultValue'],
  setup(props, { attrs, listeners }) {
    const self = useField()
    const array = ArrayBase.useArray()
    const prefixCls = `${stylePrefix}-array-base`
    return () => {
      if (!array) return null
      if (array?.field.value.pattern !== 'editable') return null
      return h(
        Button,
        {
          class: `${prefixCls}-addition`,
          attrs: {
            type: 'ghost',
            icon: 'qax-icon-Alone-Plus',
            ...attrs
          },
          on: {
            ...listeners,
            click: e => {
              if (array.props?.disabled) return
              const defaultValue = getDefaultValue(props.defaultValue, array?.schema.value)
              if (props.method === 'unshift') {
                array?.field?.value.unshift(defaultValue)
                array.listeners?.add?.(0)
              } else {
                array?.field?.value.push(defaultValue)
                array.listeners?.add?.(array?.field?.value?.value?.length - 1)
              }
              if (listeners.click) {
                listeners.click(e)
              }
            }
          }
        },
        {
          default: () => [self.value.title || props.title]
        }
      )
    }
  }
})

ArrayItems.Addition = ArrayBaseAddition
ArrayBase.Addition = ArrayBaseAddition
