import { defineComponent, provide, inject, toRefs, ref } from 'vue-demi'
import { FragmentComponent, useField, useFieldSchema, h } from '@formily/vue'
import { isValid, uid } from '@formily/shared'
import { stylePrefix } from './configs'

const ArrayBaseSymbol = Symbol('ArrayBaseContext')
const ItemSymbol = Symbol('ItemContext')

export const useArray = () => {
  return inject(ArrayBaseSymbol, null)
}

const useIndex = index => {
  const ctx = inject(ItemSymbol, null)
  return ctx ? ctx.index : ref(index)
}

const getDefaultValue = (defaultValue, schema) => {
  if (isValid(defaultValue)) return defaultValue
  if (Array.isArray(schema?.items))
    return getDefaultValue(defaultValue, schema.items[0])
  if (schema?.items?.type === 'array') return []
  if (schema?.items?.type === 'boolean') return true
  if (schema?.items?.type === 'date') return ''
  if (schema?.items?.type === 'datetime') return ''
  if (schema?.items?.type === 'number') return 0
  if (schema?.items?.type === 'object') return {}
  if (schema?.items?.type === 'string') return ''
  return null
}

export const ArrayBase = defineComponent({
  setup(props, { slots }) {
    const field = useField()
    const schema = useFieldSchema()
    const keyMap = new WeakMap()
    provide(ArrayBaseSymbol, { field, schema, keyMap })
    return () => {
      return h(FragmentComponent, {}, slots)
    }
  }
})

export const ArrayBaseItem = defineComponent({
  props: ['index'],
  setup(props, { slots }) {
    provide(ItemSymbol, toRefs(props))
    return () => {
      return h(FragmentComponent, {}, slots)
    }
  }
})

export const ArrayAddition = defineComponent({
  props: ['title', 'method'],
  setup(props, { attrs, listeners }) {
    const self = useField()
    const array = useArray()
    const prefixCls = `${stylePrefix}-form-array-base`
    return () => {
      if (array?.field.value.pattern !== 'editable') return null
      return h(
        'ElButton',
        {
          class: `${prefixCls}-addition`,
          attrs: {
            type: 'ghost',
            icon: 'el-icon-plus',
            ...attrs
          },
          on: {
            ...listeners,
            click: () => {
              const defaultValue = getDefaultValue(
                attrs.defaultValue,
                array?.schema.value
              )
              if (props.method === 'unshift') {
                array?.field?.value.unshift(defaultValue)
              } else {
                array?.field?.value.push(defaultValue)
              }
              array.keyMap.set(defaultValue, uid())
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

export const ArrayRemove = defineComponent({
  props: ['title', 'index'],
  setup(props, { attrs, listeners }) {
    const indexRef = useIndex(props.index)
    const base = useArray()
    const prefixCls = `${stylePrefix}-form-array-base`
    return () => {
      if (base?.field.value.pattern !== 'editable') return null
      return h(
        'el-button',
        {
          class: `${prefixCls}-remove`,
          attrs: {
            type: 'text',
            icon: props.title ? undefined : 'el-icon-delete',
            ...attrs
          },
          props: {
            disabled: attrs.disabled
          },
          on: {
            ...listeners,
            click: () => {
              base?.field.value.remove(indexRef.value)
            }
          }
        },
        {
          default: () => [props.title]
        }
      )
    }
  }
})

export const ArrayMoveDown = defineComponent({
  props: ['title', 'index'],
  setup(props, { attrs, listeners }) {
    const indexRef = useIndex(props.index)
    const base = useArray()
    const prefixCls = `${stylePrefix}-form-array-base`
    return () => {
      if (base?.field.value.pattern !== 'editable') return null
      return h(
        'ElButton',
        {
          class: `${prefixCls}-move-down`,
          attrs: {
            type: 'text',
            icon: props.title ? undefined : 'el-icon-arrow-down',
            ...attrs
          },
          on: {
            ...listeners,
            click: () => {
              base?.field.value.moveDown(indexRef.value)
            }
          }
        },
        {
          default: () => [props.title]
        }
      )
    }
  }
})

export const ArrayMoveUp = defineComponent({
  props: ['title', 'index'],
  setup(props, { attrs, listeners }) {
    const indexRef = useIndex(props.index)
    const base = useArray()
    const prefixCls = `${stylePrefix}-form-array-base`
    return () => {
      if (base?.field.value.pattern !== 'editable') return null
      return h(
        'ElButton',
        {
          class: `${prefixCls}-move-up`,
          attrs: {
            type: 'text',
            icon: props.title ? undefined : 'el-icon-arrow-up',
            ...attrs
          },
          on: {
            ...listeners,
            click: () => {
              base?.field.value.moveUp(indexRef.value)
            }
          }
        },
        {
          default: () => [props.title]
        }
      )
    }
  }
})
