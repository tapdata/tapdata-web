import { defineComponent, reactive, watch } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'
import { useForm, useField } from '@tap/form'
import i18n from '@tap/i18n'

export const RelativeTimePicker = observer(
  defineComponent({
    setup(props) {
      const formRef = useForm()
      const fieldRef = useField()
      const recordField = formRef.value.query(`conditions.${fieldRef.value.index}`).take()
      const record = recordField.value
      const state = reactive({
        number: record.number || 1,
        form: record.form || 'BEFORE',
        unit: record.unit || 'DAY'
      })

      watch(state, val => {
        Object.assign(record, state)
      })

      const unitOptions = [
        { value: 'HOUR', label: i18n.t('public_unit_hour') },
        { value: 'DAY', label: i18n.t('public_unit_day') },
        { value: 'WEEK', label: i18n.t('public_unit_week') },
        { value: 'MONTH', label: i18n.t('public_unit_month') },
        { value: 'YEAR', label: i18n.t('public_unit_year') }
      ]

      const unitMap = unitOptions.reduce((result, item) => {
        result[item.value] = item.label
        return result
      }, {})

      const MAP = {
        HOUR: { l: i18n.t('public_last_hour'), c: i18n.t('public_this_hour') },
        DAY: { l: i18n.t('public_yesterday'), c: i18n.t('public_today') },
        WEEK: { l: i18n.t('public_last_week'), c: i18n.t('public_this_week') },
        MONTH: { l: i18n.t('public_last_month'), c: i18n.t('public_this_month') },
        YEAR: { l: i18n.t('public_last_year'), c: i18n.t('public_this_year') }
      }

      const BEFORE_MAP = {
        DAY: i18n.t('public_today'),
        WEEK: i18n.t('public_this_week'),
        MONTH: i18n.t('public_this_month'),
        YEAR: i18n.t('public_this_year')
      }
      // FIXME 升级到vue3后， 这里要用children的方式传递具名slot
      return () => {
        const genLabel = () => {
          let label
          if (state.form === 'CURRENT') {
            label = MAP[state.unit]?.c
          }
          if (state.form === 'BEFORE') {
            if (state.number === 1) {
              label = MAP[state.unit]?.l
            }
            label = `${i18n.t('public_date_past_val')} ${state.number} ${unitMap[state.unit]}`
          }
          return label || i18n.t('public_select_placeholder')
        }
        return (
          <el-popover
            class="align-self-start"
            placement="bottom"
            trigger="click"
            width="240"
            popper-class="pt-0"
            scopedSlots={{
              reference: () => (
                <ElButton class="py-2">
                  {genLabel()} <i class="el-icon-arrow-down el-icon--right"></i>
                </ElButton>
              )
            }}
          >
            <div>
              <ElTabs
                value={state.form}
                onInput={val => {
                  state.form = val
                }}
              >
                <ElTabPane label={i18n.t('public_date_past')} name="BEFORE">
                  <div class="flex gap-3">
                    <ElInputNumber
                      min={1}
                      class="flex-1"
                      controls-position="right"
                      value={state.number}
                      onInput={val => {
                        state.number = val
                      }}
                    ></ElInputNumber>
                    <ElSelect
                      class="flex-1"
                      value={state.unit}
                      onInput={val => {
                        state.unit = val
                      }}
                    >
                      {unitOptions.map(option => (
                        <ElOption label={option.label} value={option.value}></ElOption>
                      ))}
                    </ElSelect>
                  </div>
                </ElTabPane>
                <ElTabPane label={i18n.t('public_date_current')} name="CURRENT">
                  <div class="flex flex-wrap gap-3">
                    {unitOptions.slice(1).map(option => (
                      <ElTag
                        class="clickable rounded-pill"
                        type={state.unit === option.value ? '' : 'info'}
                        size="medium"
                        onClick={() => {
                          state.unit = option.value
                        }}
                      >
                        {option.label}
                      </ElTag>
                    ))}
                  </div>
                </ElTabPane>
              </ElTabs>
            </div>
          </el-popover>
        )
      }
    }
  })
)
