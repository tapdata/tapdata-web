import { defineComponent, ref, onMounted } from 'vue-demi'
import { observer } from '@formily/reactive-vue'
import { useForm, useField } from '@formily/vue'

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
    props: ['value', 'disabled'],
    setup(props, { emit }) {
      const formRef = useForm()
      const form = formRef.value
      const events = ref([])
      const selected = ref([])
      const capabilities = form.values.attrs.capabilities || []
      const unselected = ref(props.value || [])

      events.value = capabilities.filter(item => item.type === 10).map(item => item.id)
      selected.value = unselected.value.length
        ? events.value.filter(name => !unselected.value.includes(name))
        : [...events.value]

      return () => {
        return (
          <ElCheckboxGroup
            disabled={props.disabled}
            value={selected.value}
            onInput={value => {
              selected.value = value
            }}
          >
            {events.value.map(name => (
              <ElCheckbox
                label={name}
                onChange={value => {
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
    setup(props) {
      const formRef = useForm()
      const fieldRef = useField()
      const form = formRef.value
      const list = ref([])
      const parents = props
        .findParentNodes(form.values.id)
        .filter(parent => (parent.type === 'database' || parent.type === 'table') && parent.enableDDL)

      const parentEnable = ref(!!parents.length)

      console.log('parents', parents) // eslint-disable-line

      if (parents.length) {
        const functions = form.values.attrs.capabilities.filter(item => item.type === 11).map(item => item.id)
        parents.forEach(parent => {
          const disabledEvents = parent.disabledEvents || []
          let events = parent.attrs.capabilities
            .filter(item => {
              if (item.type !== 10 || disabledEvents.includes(item.id)) return
              const functionName = item.id.replace(/_event$/, '_function')
              return functions.includes(functionName)
            })
            .map(item => item.id)
          if (events.length) {
            list.value.push({
              source: parent.attrs.connectionName,
              events
            })
          }
        })
      }

      onMounted(() => {
        if (!parentEnable.value) {
          fieldRef.value.setDisplay('hidden')
        }
      })

      return () => {
        return (
          <div class="lh-1 font-color-light">
            {list.value.length
              ? list.value.map((item, i) => {
                  return [
                    <div class={['font-color-light mb-2 lh-1', { 'mt-2': i > 0 }]}>来自源连接：{item.source}</div>,
                    <div class="flex flex-wrap gap-1">
                      {item.events.map(name => (
                        <ElTag type="info" effect="light">
                          {EVENT_MAP[name]}
                        </ElTag>
                      ))}
                    </div>
                  ]
                })
              : '目标暂不支持DDL'}
          </div>
        )
      }
    }
  })
)
