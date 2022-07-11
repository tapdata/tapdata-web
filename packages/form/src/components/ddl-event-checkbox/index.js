import { defineComponent, ref } from 'vue-demi'
import { observer } from '@formily/reactive-vue'
import { useForm } from '@formily/vue'

const EVENT_MAP = {
  alter_field_name_event: '修改字段名',
  alter_field_attributes_event: '修改字段属性',
  create_table_event: '创建表',
  drop_table_event: '删除表',
  clear_table_event: '清空表',
  alter_primary_key_event: '修改主键',
  drop_field_event: '删除字段',
  new_field_event: '新增字段',
  alter_table_charset_event: '修改表字符集',
  alter_database_timezone_event: '修改数据库时区',
  rename_table_event: '修改表名'
}

export const DdlEventCheckbox = observer(
  defineComponent({
    props: ['value'],
    setup(props, { emit }) {
      // attrs.capabilities
      const formRef = useForm()
      const form = formRef.value

      const events = ref([])
      const selected = ref([])
      const capabilities = form.values.attrs.capabilities || []
      events.value = capabilities.filter(item => item.type === 20).map(item => item.id)

      const unselected = ref(props.value || [])

      selected.value = unselected.value.length
        ? events.value.filter(name => !unselected.value.includes(name))
        : [...events.value]

      return () => {
        return (
          <ElCheckboxGroup
            value={selected.value}
            onInput={value => {
              console.log('ElCheckboxGroup.value', value) // eslint-disable-line
              selected.value = value
            }}
          >
            {events.value.map(name => (
              <ElCheckbox
                label={name}
                onChange={value => {
                  console.log('ElCheckbox.chagne', value) // eslint-disable-line
                  const i = unselected.value.indexOf(name)
                  if (value) {
                    ~i && unselected.value.splice(i, 1)
                  } else {
                    !~i && unselected.value.push(name)
                  }
                  emit('change', unselected.value)
                }}
              >
                {EVENT_MAP[name]}
              </ElCheckbox>
            ))}
          </ElCheckboxGroup>
        )
      }
    }
  })
)

export const DdlEventList = observer(
  defineComponent({
    props: ['value', 'findParentNode', 'findParentNodes'],
    setup(props, { emit }) {
      const formRef = useForm()
      const form = formRef.value
      const list = ref([])
      const parent = props.findParentNode(form.values.id)
      const parents = props.findParentNodes(form.values.id)

      console.log('parents', parents) // eslint-disable-line

      if ((parent.type === 'database' || parent.type === 'table') && parent.enableDDL) {
        const disabledEvents = parent.disabledEvents || []
        const functions = form.values.attrs.capabilities.filter(item => item.type === 11).map(item => item.id)
        let events = parent.attrs.capabilities
          .filter(item => {
            if (item.type !== 20 || disabledEvents.includes(item.id)) return
            const functionName = item.id.replace(/_event$/, '_function')
            return functions.includes(functionName)
          })
          .map(item => item.id)
        list.value.push({
          source: parent.attrs.connectionName,
          events
        })
      }

      return () => {
        return (
          <div>
            {list.value.map(item => {
              return (
                <ElCheckboxGroup disabled value={item.events}>
                  {item.events.map(name => (
                    <ElCheckbox label={name}>{EVENT_MAP[name]}</ElCheckbox>
                  ))}
                </ElCheckboxGroup>
              )
            })}
          </div>
        )
      }
    }
  })
)
