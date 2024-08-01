import { defineComponent, reactive, watch, ref, computed } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'
import { useForm, useField } from '@tap/form'
import { VIcon } from '@tap/component'
import { taskApi } from '@tap/api'
import { dayjs } from '@tap/business/src/shared/dayjs'
import i18n from '@tap/i18n'
import { connect, mapProps } from '@formily/vue'

export const RelativeTimePicker = connect(
  observer(
    defineComponent({
      props: {
        disabled: Boolean,
        offsetHours: {
          type: Number,
          default: 0
        }
      },
      setup(props) {
        const formRef = useForm()
        const fieldRef = useField()
        const recordField = formRef.value.query(`conditions.${fieldRef.value.index}`).take()
        const record = recordField.value

        if (!('number' in record)) {
          record.number = 1
        }
        if (!('unit' in record)) {
          record.unit = 'DAY'
        }
        if (!('form' in record)) {
          record.form = 'BEFORE'
        }

        const state = reactive({
          number: record.number || 1,
          form: record.form || 'BEFORE',
          unit: record.unit || 'DAY'
        })
        const engineDate = ref(dayjs())
        const loadCurrentEngineTime = async () => {
          try {
            const date = await taskApi.getCurrentEngineTime()
            engineDate.value = dayjs(date)
          } catch (e) {
            engineDate.value = dayjs()
          }
        }

        const currentDate = computed(() => {
          return engineDate.value.add(props.offsetHours, 'h').toDate()
        })

        loadCurrentEngineTime()

        const preview = computed(() => {
          if (state.form !== 'BEFORE') return ''
          let start = dayjs(currentDate.value)
          let end = dayjs(currentDate.value)
          let year = currentDate.value.getFullYear()
          switch (state.unit) {
            case 'HOUR':
              start = end.subtract(state.number, 'hour') // 昨天
              break
            case 'DAY':
              end = end.subtract(1, 'day') // 昨天
              start = end.subtract(state.number - 1, 'day')
              break
            case 'WEEK':
              end = end.subtract(end.day() || 7, 'd') // 上周
              start = end.subtract(6, 'day').subtract(state.number - 1, 'week') // 上周一
              break
            case 'MONTH':
              end = end.subtract(1, 'month').endOf('month') // 上个月
              start = end.startOf('month').subtract(state.number - 1, 'month')
              break
            case 'YEAR':
              end = dayjs().subtract(1, 'year').endOf('year')
              start = end.startOf('year').subtract(state.number - 1, 'year')
              break
          }

          const formatStr = start.year() !== year ? 'MMM D, YYYY' : 'MMM D'

          return `${start.format(formatStr)} - ${end.format(formatStr)}`
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

        const getCurrentTip = unit => {
          let current = dayjs(currentDate.value)
          let year = current.year()
          let str, s, e, formatStr
          switch (unit) {
            case 'HOUR':
              str = current.format('ddd, MMM D H')
              break
            case 'DAY':
              str = current.format('ddd, MMM D')
              break
            case 'WEEK':
              s = current.subtract((current.day() || 7) - 1, 'd') // 上周
              e = s.add(6, 'd')
              formatStr = s.year() !== year ? 'ddd, MMM D, YYYY' : 'ddd, MMM D'
              str = `${s.format(formatStr)} - ${e.format(formatStr)}`
              break
            case 'MONTH':
              str = `${current.startOf('month').format('ddd, MMM D')} - ${current.endOf('month').format('ddd, MMM D')}`
              break
            case 'YEAR':
              str = `${current.startOf('month').format('ddd, MMM D, YYYY')} - ${current
                .endOf('month')
                .format('ddd, MMM D, YYYY')}`
              break
          }
          return i18n.t('public_date_current_prefix') + str
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
              disabled={props.disabled}
              class="align-self-start"
              placement="bottom"
              trigger="click"
              width="240"
              popper-class="pt-0"
              scopedSlots={{
                reference: () => (
                  <ElButton class="py-2" disabled={props.disabled}>
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
                    <div class="flex gap-2 align-center font-color-sslight mt-2">
                      <VIcon size={16}>calendar</VIcon>
                      <span class="lh-base">{preview.value}</span>
                    </div>
                  </ElTabPane>
                  <ElTabPane label={i18n.t('public_date_current')} name="CURRENT">
                    <div class="flex flex-wrap gap-3">
                      {unitOptions.slice(1).map(option => (
                        <ElTooltip open-delay={500} placement="bottom" content={getCurrentTip(option.value)}>
                          <ElButton
                            class="rounded-pill m-0 min-w-0"
                            type={state.unit === option.value ? 'primary' : ''}
                            onClick={() => {
                              state.unit = option.value
                            }}
                          >
                            {option.label}
                          </ElButton>
                        </ElTooltip>
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
  ),
  mapProps({ disabled: true })
)
