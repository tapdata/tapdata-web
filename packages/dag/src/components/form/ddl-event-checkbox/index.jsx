import { observer } from '@formily/reactive-vue'
import { useField, useForm } from '@tap/form'

import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue'

const EVENT_MAP = {
  alter_field_name_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaiziduanming',
  ),
  alter_field_attributes_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaiziduanshu',
  ),
  create_table_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_chuangjianbiao',
  ),
  drop_table_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_shanchubiao',
  ),
  clear_table_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_qingkongbiao',
  ),
  alter_primary_key_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaizhujian',
  ),
  drop_field_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_shanchuziduan',
  ),
  new_field_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xinzengziduan',
  ),
  alter_table_charset_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaibiaozifu',
  ),
  alter_database_timezone_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaishujuku',
  ),
  rename_table_event: i18n.t(
    'packages_form_ddl_event_checkbox_index_xiugaibiaoming',
  ),
}

export const DdlEventCheckbox = observer(
  defineComponent({
    props: ['value', 'disabled', 'formValues'],
    setup(props, { emit }) {
      const formRef = useForm()
      const form = formRef.value
      const events = ref([])
      const selected = ref([])
      const values = props.formValues || form.values
      const capabilities = values.attrs.capabilities || []
      const unselected = ref(props.value || [])

      events.value = capabilities
        .filter((item) => item.type === 10)
        .map((item) => item.id)
      selected.value = unselected.value.length
        ? events.value.filter((name) => !unselected.value.includes(name))
        : [...events.value]

      return () => {
        return (
          <ElCheckboxGroup
            disabled={props.disabled}
            modelValue={selected.value}
            onInput={(value) => {
              selected.value = value
            }}
          >
            {events.value.map((name) => (
              <ElCheckbox
                label={name}
                onChange={(value) => {
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
    },
  }),
)

export const DdlEventList = defineComponent({
  props: [
    'value',
    'findParentNode',
    'findParentNodes',
    'hideParent',
    'formValues',
  ],
  setup(props) {
    const formRef = useForm()
    const fieldRef = useField()
    const form = formRef.value
    const list = ref([])
    const values = props.formValues ?? form.values
    // 开启DDL的源节点
    const parents = props
      .findParentNodes(values.id)
      .filter(
        (parent) =>
          (parent.type === 'database' || parent.type === 'table') &&
          parent.ddlConfiguration === 'SYNCHRONIZATION',
      )

    const parentEnable = ref(!!parents.length)

    if (parents.length) {
      const functions = values.attrs.capabilities
        .filter((item) => item.type === 11)
        .map((item) => item.id)
      parents.forEach((parent) => {
        const disabledEvents = parent.disabledEvents || []
        const events = parent.attrs.capabilities
          .filter((item) => {
            if (item.type !== 10 || disabledEvents.includes(item.id)) return
            const functionName = item.id.replace(/_event$/, '_function')
            return functions.includes(functionName)
          })
          .map((item) => item.id)
        if (events.length) {
          list.value.push({
            source: parent.attrs.connectionName,
            events,
          })
        }
      })
    }
    // FIXME 内存溢出
    // onMounted(() => {
    //   if (!parentEnable.value) {
    //     props.hideParent ? fieldRef.value.parent.setDisplay('hidden') : fieldRef.value.setDisplay('hidden')
    //   }
    // })

    return () => {
      return (
        <div class="lh-1 font-color-light">
          {list.value.length
            ? list.value.map((item, i) => {
                return [
                  <div
                    class={['font-color-light mb-2 lh-1', { 'mt-2': i > 0 }]}
                  >
                    {i18n.t(
                      'packages_form_ddl_event_checkbox_index_laiziyuanlianjie',
                    )}
                    {item.source}
                  </div>,
                  <div class="flex flex-wrap gap-1">
                    {item.events.map((name) => (
                      <ElTag type="info" effect="light">
                        {EVENT_MAP[name]}
                      </ElTag>
                    ))}
                  </div>,
                ]
              })
            : i18n.t('packages_form_ddl_event_checkbox_index_mubiaozanbuzhi')}
        </div>
      )
    }
  },
})
