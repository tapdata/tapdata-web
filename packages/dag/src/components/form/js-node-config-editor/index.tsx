import { connect, mapProps } from '@formily/vue'
import VIcon from '@tap/component/src/base/VIcon.vue'
import { FormItem, useField } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref, watch } from 'vue'
import {
  createDefaultScriptParam,
  duplicateScriptParamKeys,
  normalizeScriptParams,
  SCRIPT_PARAM_TYPES,
  type ScriptParam,
} from './script-params.js'
import './style.scss'

export const JsNodeConfigEditor = defineComponent({
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    disabled: Boolean,
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const rows = ref<ScriptParam[]>(normalizeScriptParams(props.value))
    const duplicateKeys = computed(() => duplicateScriptParamKeys(rows.value))

    watch(
      () => props.value,
      (value) => {
        rows.value = normalizeScriptParams(value)
      },
      { deep: true },
    )

    const emitRows = () => {
      emit(
        'change',
        rows.value.map((row) => ({ ...row })),
      )
    }

    const updateRow = (index: number, patch: Record<string, unknown>) => {
      rows.value = rows.value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      )
      emitRows()
    }

    const addRow = () => {
      rows.value = [...rows.value, createDefaultScriptParam()]
      emitRows()
    }

    const removeRow = (index: number) => {
      rows.value = rows.value.filter((_, rowIndex) => rowIndex !== index)
      emitRows()
    }

    return () => (
      <div class="js-node-config-editor">
        {rows.value.map((row, index) => (
          <div
            class={[
              'js-node-config-editor__row',
              duplicateKeys.value.has(row.key.trim()) && 'has-error',
            ]}
            key={`${index}-${row.key}`}
          >
            <ElInput
              class="js-node-config-editor__key"
              modelValue={row.key}
              disabled={props.disabled}
              placeholder={t('packages_form_js_node_config_key')}
              onUpdate:modelValue={(value: string) =>
                updateRow(index, { key: value })
              }
            />
            {duplicateKeys.value.has(row.key.trim()) && (
              <div class="js-node-config-editor__error">
                {t('packages_form_js_node_config_duplicate')}
              </div>
            )}
            <ElSelectV2
              class="js-node-config-editor__type"
              modelValue={row.type}
              disabled={props.disabled}
              options={SCRIPT_PARAM_TYPES}
              onUpdate:modelValue={(value: string) =>
                updateRow(index, { type: value })
              }
            />
            <ElInput
              class="js-node-config-editor__value"
              modelValue={row.value}
              disabled={props.disabled}
              type={
                row.encrypted
                  ? 'password'
                  : row.type === 'json'
                    ? 'textarea'
                    : 'text'
              }
              showPassword={row.encrypted}
              autosize={
                row.type === 'json' ? { minRows: 1, maxRows: 4 } : undefined
              }
              placeholder={t('packages_form_js_node_config_value')}
              onUpdate:modelValue={(value: string) =>
                updateRow(index, { value })
              }
            />
            <span class="js-node-config-editor__encrypted-label">
              {t('packages_form_js_node_config_encrypted')}
            </span>
            <ElSwitch
              class="js-node-config-editor__encrypted"
              modelValue={row.encrypted}
              disabled={props.disabled}
              onUpdate:modelValue={(value: string | number | boolean) =>
                updateRow(index, { encrypted: Boolean(value) })
              }
            />
            <ElInput
              class="js-node-config-editor__description"
              modelValue={row.description}
              disabled={props.disabled}
              placeholder={t('packages_form_js_node_config_description')}
              onUpdate:modelValue={(value: string) =>
                updateRow(index, { description: value })
              }
            />
            <ElButton
              class="js-node-config-editor__remove"
              text
              type="danger"
              disabled={props.disabled}
              onClick={() => removeRow(index)}
            >
              ×
            </ElButton>
          </div>
        ))}
        <ElButton
          text
          type="primary"
          disabled={props.disabled}
          onClick={addRow}
        >
          + {t('packages_form_js_node_config_add')}
        </ElButton>
      </div>
    )
  },
})

export const JsNodeConfigFormItem = connect(
  defineComponent({
    setup(_, { attrs, slots }) {
      const field = useField()
      const itemProps: Record<string, any> = { ...attrs }
      const tooltip = itemProps.tooltip
      delete itemProps.title
      delete itemProps.label
      delete itemProps.tooltip
      delete itemProps.tooltipLayout

      return () => {
        const label = (
          <div class="position-absolute flex justify-content-between w-100">
            <div class="flex align-center">
              <span>{field.value.title}</span>
              <ElTooltip content={tooltip} placement="top">
                <VIcon size="14" class="color-primary">
                  info
                </VIcon>
              </ElTooltip>
            </div>
          </div>
        )

        return (
          <FormItem.BaseItem {...itemProps} label={label}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    },
  }),
  mapProps({ disabled: true }),
)

export default JsNodeConfigEditor
