import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'

import i18n from '@tap/i18n'
import type { CheckboxGroupValueType } from 'element-plus'
import { computed, defineComponent, ref, type PropType } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

const EVENT_MAP: Partial<Record<string, string>> = {
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
    props: {
      value: Array as PropType<string[]>,
      disabled: { type: Boolean, default: undefined },
      formValues: Object,
    },
    emits: ['change'],
    setup(props, { emit }) {
      const dataflowStore = useDataflowStore()
      const formRef = useForm()
      const values = props.formValues ?? formRef.value.values
      const events: string[] = dataflowStore
        .getCapabilitiesByType(values, 10)
        .filter((item) => item.id !== 'clear_table_event')
        .map((item) => item.id)

      const selected = computed(() =>
        events.filter((event) => !props.value?.includes(event)),
      )

      function updateSelection(nextSelected: CheckboxGroupValueType) {
        // Preserve exclusions for events this connector does not offer.
        const disabledEvents = new Set(props.value)
        for (const event of events) {
          if (nextSelected.includes(event)) {
            disabledEvents.delete(event)
          } else {
            disabledEvents.add(event)
          }
        }
        emit('change', [...disabledEvents])
      }

      return () => (
        <ElCheckboxGroup
          disabled={props.disabled}
          modelValue={selected.value}
          onUpdate:modelValue={updateSelection}
        >
          {events.map((name) => (
            <ElCheckbox key={name} value={name}>
              {EVENT_MAP[name]}
            </ElCheckbox>
          ))}
        </ElCheckboxGroup>
      )
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
    const dataflowStore = useDataflowStore()
    const formRef = useForm()
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

    if (parents.length) {
      const functions = dataflowStore
        .getCapabilitiesByType(values, 11)
        .map((item) => item.id)
      parents.forEach((parent) => {
        const disabledEvents = parent.disabledEvents || []
        const events = Object.values(dataflowStore.getCapabilitiesMap(parent))
          .filter((item) => {
            if (item.type !== 10 || disabledEvents.includes(item.id))
              return false
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
