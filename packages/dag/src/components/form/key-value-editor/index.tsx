import { observer } from '@formily/reactive-vue'
import { useField } from '@formily/vue'
import { FormItem } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { ElMessage, ElSegmented } from 'element-plus'
import { computed, defineComponent, ref } from 'vue'
import './style.scss'

interface KVItem {
  [key: string]: string
}

const VIEW_FORM = 'form'
const VIEW_TEXT = 'text'

export const KeyValueEditor = observer(
  defineComponent({
    name: 'KeyValueEditor',
    inheritAttrs: false,
    props: {
      value: {
        type: Array,
        default: () => [],
      },
      disabled: Boolean,
      keyField: {
        type: String,
        default: 'propKey',
      },
      valueField: {
        type: String,
        default: 'propValue',
      },
      keyPlaceholder: {
        type: String,
        default: 'Key',
      },
      valuePlaceholder: {
        type: String,
        default: 'Value',
      },
    },
    emits: ['change'],
    setup(props, { emit, attrs }) {
      const { t } = useI18n()
      const fieldRef = useField()
      const viewMode = ref(VIEW_FORM)
      const textContent = ref('')

      const viewOptions = computed(() => [
        { label: t('public_form_view'), value: VIEW_FORM },
        { label: t('public_text_view'), value: VIEW_TEXT },
      ])

      const items = computed(
        () => (Array.isArray(props.value) ? props.value : []) as KVItem[],
      )

      function emitChange(list: KVItem[]) {
        emit('change', list)
      }

      function handleAdd() {
        emitChange([
          ...items.value,
          { [props.keyField]: '', [props.valueField]: '' },
        ])
      }

      function handleRemove(index: number) {
        const list = [...items.value]
        list.splice(index, 1)
        emitChange(list)
      }

      function handleItemChange(index: number, field: string, val: string) {
        const list = items.value.map((item: KVItem, i: number) =>
          i === index ? { ...item, [field]: val } : item,
        )
        emitChange(list)
      }

      // 序列化 value 为文本格式
      function serializeToText(list: KVItem[]): string {
        if (!list?.length) return ''
        return list
          .map(
            (item) => `'${item[props.keyField]}' = '${item[props.valueField]}'`,
          )
          .join(',\n')
      }

      // 解析文本为 KVItem[]
      function parseText(text: string): KVItem[] {
        return text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => {
            line = line.replace(/[,;]+$/, '').trim()
            const match = line.match(
              /^['"]?([^'"=]+?)['"]?\s*=\s*['"]?([^'"]*)['"]?$/,
            )
            if (!match) return null
            return {
              [props.keyField]: match[1].trim(),
              [props.valueField]: match[2].trim(),
            }
          })
          .filter(Boolean) as KVItem[]
      }

      function handleViewChange(mode: string) {
        if (mode === VIEW_TEXT) {
          textContent.value = serializeToText(items.value)
        }
        viewMode.value = mode
      }

      function handleApply() {
        const parsed = parseText(textContent.value)
        if (!parsed.length && textContent.value.trim()) {
          ElMessage.warning(t('public_parse_failed'))
          return
        }
        emitChange(parsed)
        ElMessage.success(t('public_import_count', [parsed.length]))
        viewMode.value = VIEW_FORM
      }

      function handleCopy() {
        navigator.clipboard.writeText(serializeToText(items.value)).then(() => {
          ElMessage.success(t('public_message_copy_success'))
        })
      }

      const renderLabel = () => (
        <div class="inline-flex align-center w-100 justify-content-between">
          <span>{fieldRef.value.title}</span>
          <ElSegmented
            modelValue={viewMode.value}
            options={viewOptions.value}
            onChange={handleViewChange}
          />
        </div>
      )

      return () => (
        <FormItem.BaseItem
          class="key-value-editor-form-item"
          label={renderLabel()}
          labelStyle={{ width: '100%' }}
          colon={false}
          {...attrs}
        >
          <div class="mt-1">
            {viewMode.value === VIEW_FORM ? (
              <div>
                {items.value.map((item: KVItem, index: number) => (
                  <div class="flex align-center gap-2 mb-2" key={index}>
                    <span class="color-disable">{index + 1}</span>
                    <ElInput
                      modelValue={item[props.keyField]}
                      placeholder={props.keyPlaceholder}
                      disabled={props.disabled}
                      onUpdate:modelValue={(val: string) =>
                        handleItemChange(index, props.keyField, val)
                      }
                    />
                    <ElInput
                      modelValue={item[props.valueField]}
                      placeholder={props.valuePlaceholder}
                      disabled={props.disabled}
                      onUpdate:modelValue={(val: string) =>
                        handleItemChange(index, props.valueField, val)
                      }
                    />
                    <ElButton
                      size="small"
                      text
                      disabled={props.disabled}
                      onClick={() => handleRemove(index)}
                      icon={IconLucideTrash2}
                    ></ElButton>
                  </div>
                ))}
                <ElButton
                  class="w-100 border-dashed"
                  disabled={props.disabled}
                  onClick={handleAdd}
                  icon={IconLucidePlus}
                ></ElButton>
              </div>
            ) : (
              <div class="key-value-editor__text-box">
                <ElInput
                  type="textarea"
                  modelValue={textContent.value}
                  onUpdate:modelValue={(val: string) =>
                    (textContent.value = val)
                  }
                  placeholder={`'bucket' = '8'\n"file.format" = "parquet"\ncompression=snappy`}
                  disabled={props.disabled}
                  autosize
                />
                <div class="key-value-editor__text-actions">
                  <ElButton onClick={handleCopy}>
                    {t('public_button_copy')}
                  </ElButton>
                  <ElButton
                    type="primary"
                    disabled={props.disabled}
                    onClick={handleApply}
                  >
                    {t('public_apply_to_form')}
                  </ElButton>
                </div>
              </div>
            )}
          </div>
        </FormItem.BaseItem>
      )
    },
  }),
)

export default KeyValueEditor
