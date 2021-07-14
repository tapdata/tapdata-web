import { defineComponent } from 'vue-demi'
import { useField, useFieldSchema, RecursionField, h } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { ArrayBase, ArrayBaseItem } from '@/components/form/ArrayBase'
import { Space } from '@/components/form/Space'

const isAdditionComponent = schema => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const isHeaderComponent = schema => {
  return schema['x-component']?.indexOf('Header') > -1
}

const useComponent = (isComponent, name) => {
  const schemaRef = useFieldSchema()
  return schemaRef.value.reduceProperties((com, schema) => {
    if (isComponent(schema)) {
      return h(
        RecursionField,
        {
          props: {
            schema,
            name
          }
        },
        {}
      )
    }
    return com
  }, null)
}

export const ArrayItems = observer(
  defineComponent({
    setup(props) {
      const fieldRef = useField()
      const schemaRef = useFieldSchema()
      const addition = useComponent(isAdditionComponent, 'addition')
      const header = useComponent(isHeaderComponent, 'header')
      if (!schemaRef) throw new Error('can not found schema object')
      return () => {
        const field = fieldRef.value
        const dataSource = Array.isArray(field.value) ? field.value : []
        console.log('schemaRef', schemaRef, field.value)
        return h(
          ArrayBase,
          {},
          {
            default: () =>
              h(
                'div',
                {
                  props: { ...props }
                },
                {
                  default: () => [
                    header,
                    dataSource?.map((item, index) => {
                      const items = Array.isArray(schemaRef.value.items)
                        ? schemaRef.value.items[index] || schemaRef.value.items[0]
                        : schemaRef.value.items

                      return h(
                        ArrayBaseItem,
                        { key: index, props: { index } },
                        {
                          default: () =>
                            h(
                              'div',
                              {},
                              {
                                default: () =>
                                  h(
                                    RecursionField,
                                    {
                                      props: { schema: items, name: index }
                                    },
                                    {}
                                  )
                              }
                            )
                        }
                      )
                    }),
                    addition
                  ]
                }
              )
          }
        )
      }
    }
  })
)

export const ArrayHeader = defineComponent({
  setup(props, { slots }) {
    return () => {
      return h(
        Space,
        {
          props
        },
        slots
      )
    }
  }
})
