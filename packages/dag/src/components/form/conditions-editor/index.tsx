import { observer } from '@formily/reactive-vue'
import { BaseFieldSelect as FieldSelect } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent } from 'vue'
import { RelativeTimePicker } from '../relative-time-picker'
import './style.scss'

const OPERATOR_OPTIONS = [
  { label: '>', value: 1 },
  { label: '>=', value: 2 },
  { label: '<', value: 3 },
  { label: '<=', value: 4 },
  { label: '=', value: 5 },
]

const DATE_VIEW_OPTIONS = [
  { label: i18n.t('public_date_specific'), value: false },
  { label: i18n.t('public_date_relative'), value: true },
]

const DATE_TYPE_REG = /timestamp|date/i

const isDateField = (field: any) => DATE_TYPE_REG.test(field?.type || '')

const createItem = () => ({
  key: '',
  value: '',
  operator: 5,
  fastQuery: false,
  number: 1,
  unit: 'DAY',
  form: 'BEFORE',
})

export const ConditionsEditor = observer(
  defineComponent({
    name: 'ConditionsEditor',
    inheritAttrs: false,
    props: {
      value: { type: Array, default: () => [] },
      disabled: Boolean,
      fields: { type: Array, default: () => [] },
      fieldsLoading: Boolean,
      offsetHours: { type: Number, default: 0 },
    },
    setup(props) {
      const getField = (key: string) =>
        (props.fields as any[])?.find((item) => item.value === key)

      const handleAdd = () => {
        ;(props.value as any[]).push(createItem())
      }

      const handleRemove = (index: number) => {
        ;(props.value as any[]).splice(index, 1)
      }

      const handleFieldChange = (item: any, val: string) => {
        item.key = val
        item.value = ''
      }

      return () => {
        const items = (props.value || []) as any[]

        return (
          <div class="conditions-editor">
            {items.map((item, index) => {
              const field = getField(item.key)
              const dateField = isDateField(field)

              return (
                <div class="conditions-editor__row" key={index}>
                  <div class="conditions-editor__main">
                    <FieldSelect
                      class="conditions-editor__field"
                      modelValue={item.key}
                      options={props.fields}
                      loading={props.fieldsLoading}
                      filterable
                      disabled={props.disabled}
                      onUpdate:modelValue={(val: string) =>
                        handleFieldChange(item, val)
                      }
                    />
                    <ElSelect
                      class="conditions-editor__operator"
                      v-model={item.operator}
                      disabled={props.disabled || item.fastQuery}
                    >
                      {OPERATOR_OPTIONS.map((option) => (
                        <ElOption
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        ></ElOption>
                      ))}
                    </ElSelect>
                    <div class="conditions-editor__value">
                      {dateField ? (
                        <>
                          <ElSegmented
                            class="w-100"
                            v-model={item.fastQuery}
                            options={DATE_VIEW_OPTIONS}
                            disabled={props.disabled}
                            onChange={(val: boolean) => {
                              if (val) {
                                item.operator = 5
                              }
                            }}
                          />

                          <div class="conditions-editor__date flex justify-content-end">
                            {item.fastQuery ? (
                              <RelativeTimePicker
                                disabled={props.disabled}
                                offsetHours={props.offsetHours}
                                number={item.number}
                                unit={item.unit}
                                form={item.form}
                                onChange={(val: any) =>
                                  Object.assign(item, val)
                                }
                              />
                            ) : (
                              <ElDatePicker
                                class="w-100"
                                modelValue={item.value}
                                type="datetime"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                disabled={props.disabled}
                                onUpdate:modelValue={(val: string) =>
                                  (item.value = val)
                                }
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <ElInput
                          modelValue={item.value}
                          disabled={props.disabled}
                          onUpdate:modelValue={(val: string) =>
                            (item.value = val)
                          }
                        />
                      )}
                    </div>
                    <ElButton
                      class="conditions-editor__remove"
                      text
                      disabled={props.disabled || items.length < 2}
                      onClick={() => handleRemove(index)}
                      icon={IconLucideTrash2}
                    ></ElButton>
                  </div>
                </div>
              )
            })}
            <ElButton
              class="w-100 border-dashed"
              disabled={props.disabled}
              onClick={handleAdd}
              icon={IconLucidePlus}
            ></ElButton>
          </div>
        )
      }
    },
  }),
)

export default ConditionsEditor
