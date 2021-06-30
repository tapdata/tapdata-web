import { model } from '@formily/reactive'
import {
  useField,
  observer,
  useFieldSchema,
  RecursionField,
  h
} from '@formily/vue'
import { defineComponent, ref, toRefs } from 'vue-demi'

const useTabs = () => {
  const tabsFieldRef = useField()
  const tabsField = tabsFieldRef.value
  const schema = useFieldSchema()
  const tabs = []
  console.log('tabsField', tabsField)
  schema.value.mapProperties((schema, name) => {
    const field = tabsField.query(tabsField.address.concat(name)).take()
    if (field?.display === 'none' || field?.display === 'hidden') return
    if (schema['x-component']?.indexOf('TabPane') > -1) {
      tabs.push({
        name,
        props: {
          key: schema?.['x-component-props']?.key || name,
          ...schema?.['x-component-props']
        },
        schema
      })
    }
  })
  return tabs
}

export const createFormTab = defaultActiveKey => {
  const activeKey = ref(defaultActiveKey)
  return {
    activeKey,
    setActiveKey(key) {
      activeKey.value = key
    }
  }
}

export const FormTab = observer(
  defineComponent({
    props: ['formTab', 'activeKey'],
    setup(props) {
      const { formTab } = toRefs(props)
      const tabs = useTabs()
      const _formTab = formTab.value || createFormTab()
      const activeKey = props.activeKey || _formTab.activeKey.value
      const renderPanes = () =>
        tabs.map(({ props, schema, name }, key) => {
          return h(
            'el-tab-pane',
            {
              key,
              props: {
                label: props.tab,
                ...props
              }
            },
            {
              default: () =>
                h(
                  RecursionField,
                  {
                    props: {
                      name,
                      schema
                    }
                  },
                  {}
                )
            }
          )
        })

      return () =>
        h(
          'el-tabs',
          {
            class: 'form-tabs',
            props: {
              value: activeKey,
              ...props
            }
          },
          {
            default: renderPanes
          }
        )
    }
  })
)

export const FormTabPane = {
  render() {
    return this.$slots.default
  }
}
