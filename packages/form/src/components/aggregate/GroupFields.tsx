import { useI18n } from '@tap/i18n'
import { defineComponent, type PropType } from 'vue'
import { BaseFieldSelect } from '../field-select'

export interface GroupField {
  id: string
  field: string
  alias: string
}

let groupIdCounter = 0
function genId() {
  return `group_${++groupIdCounter}_${Date.now()}`
}

export const GroupFields = defineComponent({
  name: 'GroupFields',
  props: {
    fields: {
      type: Array as PropType<GroupField[]>,
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
      const newField: GroupField = {
        id: genId(),
        field: '',
        alias: '',
      }
      emit('update:fields', [...props.fields, newField])
    }

    const removeField = (index: number) => {
      const next = [...props.fields]
      next.splice(index, 1)
      emit('update:fields', next)
    }

    const updateField = (index: number, patch: Partial<GroupField>) => {
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
      <div class="group-fields">
        {props.fields.map((gf, index) => (
          <div
            key={gf.id}
            class="group-fields__item"
            draggable
            onDragstart={(e: DragEvent) => onDragStart(e, index)}
            onDragover={(e: DragEvent) => e.preventDefault()}
            onDrop={(e: DragEvent) => onDrop(e, index)}
          >
            <div class="group-fields__drag-handle">
              <el-icon size={14}>
                <i-lucide-grip-vertical />
              </el-icon>
            </div>

            <BaseFieldSelect
              class="group-fields__field"
              modelValue={gf.field}
              options={props.fieldOptions}
              loading={props.loading}
              {...({
                filterable: true,
                placeholder: t('packages_form_aggregate_select_group_field'),
                onChange: (val: string) => updateField(index, { field: val }),
              } as any)}
            />

            <ElInput
              class="group-fields__alias"
              modelValue={gf.alias}
              onUpdate:modelValue={(val: string) =>
                updateField(index, { alias: val })
              }
              placeholder={t('packages_form_aggregate_alias_optional')}
            />

            <el-button
              class="group-fields__delete"
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
          {t('packages_form_aggregate_add_group_field')}
        </ElButton>
      </div>
    )
  },
})
