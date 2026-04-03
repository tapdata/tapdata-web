import { useI18n } from '@tap/i18n'
import { defineComponent, type PropType } from 'vue'
import { BaseFieldSelect } from '../field-select'

export interface MatchCondition {
  id: string
  logic: 'AND' | 'OR'
  field: string
  operator: string
  value: string
}

const OPERATORS = [
  { label: '=', value: '=' },
  { label: '≠', value: '≠' },
  { label: '>', value: '>' },
  { label: '≥', value: '≥' },
  { label: '<', value: '<' },
  { label: '≤', value: '≤' },
  { label: 'IN', value: 'IN' },
  { label: 'NOT IN', value: 'NOT IN' },
  { label: 'REGEX', value: 'REGEX' },
]

let matchIdCounter = 0
function genId() {
  return `match_${++matchIdCounter}_${Date.now()}`
}

export const MatchFilter = defineComponent({
  name: 'MatchFilter',
  props: {
    disabled: Boolean,
    conditions: {
      type: Array as PropType<MatchCondition[]>,
      default: () => [],
    },
    fieldOptions: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    loading: Boolean,
  },
  emits: ['update:conditions'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const addCondition = () => {
      const newCondition: MatchCondition = {
        id: genId(),
        logic: 'AND',
        field: '',
        operator: '=',
        value: '',
      }
      emit('update:conditions', [...props.conditions, newCondition])
    }

    const removeCondition = (index: number) => {
      const next = [...props.conditions]
      next.splice(index, 1)
      emit('update:conditions', next)
    }

    const updateCondition = (index: number, patch: Partial<MatchCondition>) => {
      const next = props.conditions.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      )
      emit('update:conditions', next)
    }

    const onDragStart = (e: DragEvent, index: number) => {
      e.dataTransfer?.setData('text/plain', String(index))
    }

    const onDrop = (e: DragEvent, toIndex: number) => {
      e.preventDefault()
      const fromIndex = Number(e.dataTransfer?.getData('text/plain'))
      if (isNaN(fromIndex) || fromIndex === toIndex) return
      const next = [...props.conditions]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved!)
      emit('update:conditions', next)
    }

    return () => (
      <div class="match-filter">
        {props.conditions.map((cond, index) => (
          <div
            key={cond.id}
            class="match-filter__item"
            draggable
            onDragstart={(e: DragEvent) => onDragStart(e, index)}
            onDragover={(e: DragEvent) => e.preventDefault()}
            onDrop={(e: DragEvent) => onDrop(e, index)}
          >
            <div class="match-filter__drag-handle">
              <el-icon size={14}>
                <i-lucide-grip-vertical />
              </el-icon>
            </div>

            {index > 0 ? (
              <ElSelect
                disabled={props.disabled}
                class="match-filter__logic"
                modelValue={cond.logic}
                onUpdate:modelValue={(val: string) =>
                  updateCondition(index, { logic: val as 'AND' | 'OR' })
                }
                style={{ width: '80px' }}
              >
                <ElOption label="AND" value="AND" />
                <ElOption label="OR" value="OR" />
              </ElSelect>
            ) : (
              <span class="match-filter__logic-placeholder">WHERE</span>
            )}

            <BaseFieldSelect
              disabled={props.disabled}
              class="match-filter__field"
              modelValue={cond.field}
              options={props.fieldOptions}
              loading={props.loading}
              {...({
                filterable: true,
                placeholder: t('packages_form_aggregate_select_field'),
                onChange: (val: string) =>
                  updateCondition(index, { field: val }),
              } as any)}
            />

            <ElSelect
              disabled={props.disabled}
              class="match-filter__operator"
              modelValue={cond.operator}
              onUpdate:modelValue={(val: string) =>
                updateCondition(index, { operator: val })
              }
              style={{ width: '100px' }}
            >
              {OPERATORS.map((op) => (
                <ElOption key={op.value} label={op.label} value={op.value} />
              ))}
            </ElSelect>

            <ElInput
              disabled={props.disabled}
              class="match-filter__value"
              modelValue={cond.value}
              onUpdate:modelValue={(val: string) =>
                updateCondition(index, { value: val })
              }
              placeholder={t('packages_form_aggregate_input_value')}
            />

            <el-button
              disabled={props.disabled}
              class="match-filter__delete"
              text
              type="danger"
              onClick={() => removeCondition(index)}
              icon={IconLucideTrash2}
              size="small"
            />
          </div>
        ))}

        <ElButton
          disabled={props.disabled}
          type="primary"
          text
          size="small"
          onClick={addCondition}
        >
          <el-icon class="mr-1">
            <i-lucide-plus />
          </el-icon>
          {t('packages_form_aggregate_add_condition')}
        </ElButton>
      </div>
    )
  },
})
