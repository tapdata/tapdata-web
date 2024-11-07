import { Schema, SchemaKey } from '@formily/json-schema'
import { h as createElementN } from '@vue/composition-api'
import { model } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { Fragment, h as createElement, RecursionField, useField, useFieldSchema } from '@formily/vue'
import { Badge, TabPane, Tabs } from 'element-ui'
import { computed, defineComponent, reactive, inject } from 'vue-demi'
import { stylePrefix, composeExport } from '@formily/element/lib/__builtins__'
import { VIcon } from '@tap/component'

const createFormTab = defaultActiveKey => {
  const formTab = model({
    activeKey: defaultActiveKey,
    setActiveKey(key) {
      formTab.activeKey = key
    }
  })
  return formTab
}

const FormTabInner = observer(
  defineComponent({
    name: 'FFormTab',
    props: ['formTab'],
    setup(props, { attrs, listeners }) {
      const useTabs = () => {
        const tabsField = useField().value
        const schema = useFieldSchema().value
        const tabs = reactive([])
        schema.mapProperties((schema, name) => {
          const field = tabsField.query(tabsField.address.concat(name)).take()
          if (field?.display === 'none' || field?.display === 'hidden') return
          if (schema['x-component']?.indexOf('TabPane') > -1) {
            tabs.push({
              name,
              props: {
                name: schema?.['x-component-props']?.name || name,
                ...schema?.['x-component-props']
              },
              schema
            })
          }
        })
        return tabs
      }
      const field = useField().value
      const formTabRef = computed(() => props.formTab ?? createFormTab())
      const openLocked = inject('openLocked')

      const prefixCls = `${stylePrefix}-form-tab`

      return () => {
        const formTab = formTabRef.value
        const tabs = useTabs()
        const activeKey = props.value || formTab?.activeKey || tabs?.[0]?.name
        const badgedTab = (key, props) => {
          const errors = field.form.queryFeedbacks({
            type: 'error',
            address: `${field.address.concat(key)}.*`
          })

          if (props.locked) {
            return () => (
              <div
                class="flex align-center"
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  openLocked()
                }}
              >
                <span>{props.label}</span>
                <VIcon size={18}>lock-circle</VIcon>
              </div>
            )
          }

          if (errors.length) {
            return () =>
              createElement(
                Badge,
                {
                  class: [`${prefixCls}-errors-badge`],
                  props: {
                    value: errors.length
                  }
                },
                { default: () => props.label }
              )
          }
          return () => props.label
        }

        const getTabs = tabs => {
          return tabs.map(({ props, schema, name }, key) => {
            return (
              <TabPane
                class="root-tab"
                props={props}
                key={key}
                scopedSlots={{
                  label: () => [createElement('div', {}, { default: badgedTab(name, props) })]
                }}
              >
                <RecursionField schema={schema.toJSON()}></RecursionField>
              </TabPane>
            )
          })
        }

        return createElement(
          Tabs,
          {
            class: [prefixCls],
            style: attrs.style,
            props: {
              ...attrs,
              value: activeKey
            },
            on: {
              ...listeners,
              input: key => {
                listeners.input?.(key)
                formTab.setActiveKey?.(key)
              }
            }
          },
          {
            default: () => getTabs(tabs)
          }
        )
      }
    }
  })
)

const FormTabPane = defineComponent({
  name: 'FFormTabPane',
  setup(_props, { slots }) {
    // return () => createElement(Fragment, {}, slots)
    return () => <div>{slots.default?.()}</div>
  }
})

export const FormTab = composeExport(FormTabInner, {
  TabPane: FormTabPane,
  createFormTab
})

export default FormTab
