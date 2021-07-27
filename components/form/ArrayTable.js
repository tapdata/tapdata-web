import { defineComponent } from 'vue-demi'
import { useField, useFieldSchema, RecursionField, h } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { isArr, uid, shallowClone } from '@formily/shared'
import { ArrayBase, ArrayBaseItem, useArray } from './ArrayBase'
import { getComponentByTag } from './utils/util'
import { stylePrefix } from './configs'

const ElTable = getComponentByTag('el-table')
const ElTableColumn = getComponentByTag('el-table-column')

const isColumnComponent = schema => {
  return schema['x-component']?.indexOf('Column') > -1
}

const isOperationsComponent = schema => {
  return schema['x-component']?.indexOf('Operations') > -1
}

const isAdditionComponent = schema => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const getArrayTableSources = (arrayFieldRef, schemaRef) => {
  const arrayField = arrayFieldRef.value
  const parseSources = schema => {
    if (isColumnComponent(schema) || isOperationsComponent(schema) || isAdditionComponent(schema)) {
      if (!schema['x-component-props']?.['prop'] && !schema['name']) return []
      const name = schema['x-component-props']?.['prop'] || schema['name']
      const field = arrayField.query(arrayField.address.concat(name)).take()
      const fieldProps = field?.props || schema.toFieldProps()
      const columnProps = field?.component?.[1] || schema['x-component-props'] || {}
      const display = field?.display || schema['x-display']
      const required = schema.reduceProperties((required, property) => {
        if (required) {
          return required
        }
        return !!property.required
      }, false)

      return [
        {
          name,
          display,
          required,
          field,
          fieldProps,
          schema,
          columnProps
        }
      ]
    } else if (schema.properties) {
      return schema.reduceProperties((buf, schema) => {
        return buf.concat(parseSources(schema))
      }, [])
    } else {
      return []
    }
  }

  const parseArrayItems = schema => {
    const sources = []
    const items = isArr(schema) ? schema : [schema]
    return items.reduce((columns, schema) => {
      const item = parseSources(schema)
      if (item) {
        return columns.concat(item)
      }
      return columns
    }, sources)
  }

  if (!schemaRef) throw new Error('can not found schema object')

  return parseArrayItems(schemaRef.value.items)
}

const getArrayTableColumns = (dataSource, sources) => {
  return sources.reduce((buf, { name, columnProps, schema, display, required }, key) => {
    const { title, asterisk, ...props } = columnProps
    if (display !== 'visible') return buf
    if (!isColumnComponent(schema)) return buf
    const render =
      columnProps?.type && columnProps?.type !== 'default'
        ? undefined
        : props => {
            const index = props.$index
            const children = h(
              ArrayBaseItem,
              { props: { index } },
              {
                default: () =>
                  h(
                    RecursionField,
                    {
                      props: {
                        schema,
                        name: index,
                        onlyRenderProperties: true
                      }
                    },
                    {}
                  )
              }
            )
            return children
          }
    return buf.concat({
      ...props,
      key,
      prop: name,
      label: title,
      asterisk: asterisk ?? required,
      render
    })
  }, [])
}

const renderAddition = () => {
  const schema = useFieldSchema()
  return schema.value.reduceProperties((addition, schema) => {
    if (isAdditionComponent(schema)) {
      return h(
        RecursionField,
        {
          props: {
            schema,
            name: 'addition'
          }
        },
        {}
      )
    }
    return addition
  }, null)
}

const ArrayTableInner = observer(
  defineComponent({
    setup(props, { attrs }) {
      const fieldRef = useField()
      const schemaRef = useFieldSchema()
      const array = useArray()
      const prefixCls = `${stylePrefix}-form-array-table-inner`
      return () => {
        const field = fieldRef.value
        console.log('ArrayTableInner:field', field)
        const sources = getArrayTableSources(fieldRef, schemaRef)
        // Item Maybe is Proxy
        const dataSource = Array.isArray(field.value) ? field.value.slice().map(item => shallowClone(item)) : []
        const columns = getArrayTableColumns(dataSource, sources)
        const defaultRowKey = record => {
          if (!array?.keyMap.has(record)) {
            array?.keyMap.set(record, uid())
          }
          return array?.keyMap.get(record)
        }
        const renderColumns = () =>
          columns.map(({ key, render, asterisk, ...props }) => {
            const children = {}
            if (render) {
              children.default = render
            }
            if (asterisk) {
              children.header = ({ column }) =>
                h(
                  'span',
                  {},
                  {
                    default: () => [
                      h('span', { class: `${prefixCls}-asterisk` }, { default: () => ['*'] }),
                      column.label
                    ]
                  }
                )
            }
            return h(
              ElTableColumn,
              {
                key,
                props
              },
              children
            )
          })
        return h(
          ElTable,
          {
            class: attrs.autoWidth ? 'auto-width' : null,
            attrs: {
              rowKey: defaultRowKey,
              ...attrs,
              data: dataSource
            },
            props: {
              size: attrs.size
            }
          },
          {
            default: renderColumns
          }
        )
      }
    }
  })
)

export const ArrayTable = observer(
  defineComponent({
    setup(props, { attrs }) {
      const fieldRef = useField()
      const schemaRef = useFieldSchema()
      const prefixCls = `${stylePrefix}-form-array-table`
      return () => {
        const sources = getArrayTableSources(fieldRef, schemaRef)
        const renderStateManager = () =>
          sources.map((column, key) => {
            //专门用来承接对Column的状态管理
            if (!isColumnComponent(column.schema)) return
            return h(
              RecursionField,
              {
                props: {
                  name: column.name,
                  schema: column.schema,
                  onlyRenderSelf: true
                },
                key
              },
              {}
            )
          })
        return h(
          'div',
          { class: prefixCls },
          {
            default: () =>
              h(
                ArrayBase,
                {},
                {
                  default: () => [h(ArrayTableInner, { attrs }, {}), renderStateManager(), renderAddition()]
                }
              )
          }
        )
      }
    }
  })
)

export const ArrayTableColumn = {
  render(h) {
    return h()
  }
}
