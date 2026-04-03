import { useI18n } from '@tap/i18n'
import { defineComponent, type PropType } from 'vue'
import { BaseFieldSelect } from '../field-select'

export interface AggregateField {
  id: string
  outputField: string
  operator: string
  sourceField: string
}

const AGG_OPERATORS = [
  { label: '$sum', value: '$sum' },
  { label: '$avg', value: '$avg' },
  { label: '$min', value: '$min' },
  { label: '$max', value: '$max' },
  { label: '$count', value: '$count' },
  { label: '$first', value: '$first' },
  { label: '$last', value: '$last' },
  { label: '$push', value: '$push' },
  { label: '$addToSet', value: '$addToSet' },
]

let aggIdCounter = 0
function genId() {
  return `agg_${++aggIdCounter}_${Date.now()}`
}

export const AggregateFields = defineComponent({
  name: 'AggregateFields',
  props: {
    fields: {
      type: Array as PropType<AggregateField[]>,
      default: () => [],
    },
    fieldOptions: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    loading: Boolean,
  },
  emits: ['update:fields'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const addField = () => {
      const newField: AggregateField = {
        id: genId(),
        outputField: '',
        operator: '$sum',
        sourceField: '',
      }
      emit('update:fields', [...props.fields, newField])
    }

    const removeField = (index: number) => {
      const next = [...props.fields]
      next.splice(index, 1)
      emit('update:fields', next)
    }

    const updateField = (index: number, patch: Partial<AggregateField>) => {
      const next = props.fields.map((f, i) =>
        i === index ? { ...f, ...patch } : f,
      )
      emit('update:fields', next)
    }

    const onDragStart = (e: DragEvent, index: number) => {
      e.dataTransfer?.setData('text/plain', String(index))
    }

    const onDrop = (e: DragEvent, toIndex: number) => {
      e.preventDefault()
      const fromIndex = Number(e.dataTransfer?.getData('text/plain'))
      if (isNaN(fromIndex) || fromIndex === toIndex) return
      const next = [...props.fields]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved!)
      emit('update:fields', next)
    }

    return () => (
      <div class="aggregate-fields">
        {props.fields.map((af, index) => (
          <div
            key={af.id}
            class="aggregate-fields__item"
            draggable
            onDragstart={(e: DragEvent) => onDragStart(e, index)}
            onDragover={(e: DragEvent) => e.preventDefault()}
            onDrop={(e: DragEvent) => onDrop(e, index)}
          >
            <div class="aggregate-fields__drag-handle">
              <el-icon size={14}>
                <i-lucide-grip-vertical />
              </el-icon>
            </div>

            <ElInput
              class="aggregate-fields__output"
              modelValue={af.outputField}
              onUpdate:modelValue={(val: string) =>
                updateField(index, { outputField: val })
              }
              placeholder={t('packages_form_aggregate_output_field')}
            />

            <ElSelect
              class="aggregate-fields__operator"
              modelValue={af.operator}
              onUpdate:modelValue={(val: string) =>
                updateField(index, { operator: val })
              }
              style={{ width: '120px' }}
            >
              {AGG_OPERATORS.map((op) => (
                <ElOption key={op.value} label={op.label} value={op.value} />
              ))}
            </ElSelect>

            <BaseFieldSelect
              class="aggregate-fields__source"
              modelValue={af.sourceField}
              options={props.fieldOptions}
              loading={props.loading}
              {...({
                filterable: true,
                placeholder: t('packages_form_aggregate_select_source_field'),
                disabled: af.operator === '$count',
                onChange: (val: string) =>
                  updateField(index, { sourceField: val }),
              } as any)}
            />

            <el-button
              class="aggregate-fields__delete"
              text
              type="danger"
              onClick={() => removeField(index)}
              icon={IconLucideTrash2}
              size="small"
            />
          </div>
        ))}

        <ElButton type="primary" text size="small" onClick={addField}>
          <el-icon class="mr-1">
            <i-lucide-plus />
          </el-icon>
          {t('packages_form_aggregate_add_agg_field')}
        </ElButton>
      </div>
    )
  },
})
