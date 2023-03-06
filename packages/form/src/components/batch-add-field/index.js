import { defineComponent, reactive, ref } from 'vue'
import i18n from '@tap/i18n'
import { useField } from '../../index'
export const BatchAddField = defineComponent({
  props: {
    targetField: String
  },
  setup(props) {
    const fieldRef = useField()
    const options = [
      {
        label: 'string',
        value: 'string'
      },
      {
        label: 'number',
        value: 'number'
      },
      {
        label: 'boolean',
        value: 'boolean'
      },
      {
        label: 'date',
        value: 'date'
      },
      {
        label: 'array',
        value: 'array'
      },
      {
        label: 'binary',
        value: 'binary'
      },
      {
        label: 'map',
        value: 'map'
      },
      {
        label: 'time',
        value: 'time'
      },
      {
        label: 'datetime',
        value: 'datetime'
      },
      {
        label: 'now',
        value: 'now'
      },
      {
        label: 'uuid',
        value: 'uuid'
      },
      {
        label: 'serial',
        value: 'serial'
      },
      {
        label: 'rnumber',
        value: 'rnumber'
      },
      {
        label: 'rstring',
        value: 'rstring'
      }
    ]
    const def = {
      count: 10,
      start: 1,
      prefix: '',
      type: 'string'
    }
    const form = reactive({
      ...def
    })
    const visible = ref(false)
    const loading = ref(false)

    const handleOpenDialog = () => {
      visible.value = true
      Object.assign(form, {
        ...def
      })
    }

    const handleSubmit = async () => {
      visible.value = false

      let { prefix, type, count, start } = form

      if (!prefix) return

      count = count || 0
      start = start || 1
      type = type || 'string'

      const targetField = fieldRef.value.query(`.${props.targetField}`).take()
      const nameMap = targetField.value.reduce((curr, next) => {
        curr[next.name] = true
        return curr
      }, {})

      const newFields = []

      for (let i = 0; i < count; i++) {
        let name = `${prefix}${start + i}`
        if (nameMap[name]) continue
        newFields.push({
          name,
          pri: false,
          type: type
        })
      }

      if (newFields.length) {
        targetField.value.push(...newFields)
      }
    }

    return () => {
      return (
        <div class="DummyBatchAddField mt-n3">
          <div class="formily-element-array-items">
            <ElButton class="w-100 formily-element-array-base-addition" onClick={handleOpenDialog} plain>
              {i18n.global.t('packages_form_batch_add_field_title')}
            </ElButton>
          </div>
          <ElDialog
            title={i18n.global.t('packages_form_batch_add_field_title')}
            visible={visible.value}
            on={{
              'update:visible': v => {
                visible.value = v
              }
            }}
          >
            <ElForm ref="form" label-position="right" label-width="80px" props={{ mode: form }}>
              <div class="flex gap-1">
                <ElFormItem prop="prefix" label={i18n.global.t('packages_form_batch_add_field_prefix')} class="flex-1">
                  <ElInput value={form.prefix} onInput={v => (form.prefix = v)}></ElInput>
                </ElFormItem>
                <ElFormItem prop="type" label={i18n.global.t('packages_form_batch_add_field_type')} class="flex-1">
                  <ElSelect allowCreate filterable value={form.type} onInput={v => (form.type = v)}>
                    {options.map(item => (
                      <ElOption props={{ ...item }} />
                    ))}
                  </ElSelect>
                </ElFormItem>
              </div>

              <div class="flex gap-2">
                <ElFormItem prop="count" label={i18n.global.t('packages_form_batch_add_field_count')} class="flex-1">
                  <ElInputNumber
                    value={form.count}
                    onInput={v => (form.count = v)}
                    min={1}
                    max={1000}
                    controls-position="right"
                  ></ElInputNumber>
                </ElFormItem>
                <ElFormItem prop="start" label={i18n.global.t('packages_form_batch_add_field_start')} class="flex-1">
                  <ElInputNumber
                    value={form.start}
                    onInput={v => (form.start = v)}
                    min={0}
                    controls-position="right"
                  ></ElInputNumber>
                </ElFormItem>
              </div>
            </ElForm>
            <div slot="footer" class="dialog-footer">
              <ElButton
                onClick={() => {
                  visible.value = false
                }}
              >
                {i18n.global.t('packages_component_button_cancel')}
              </ElButton>
              <ElButton loading={loading.value} type="primary" onClick={handleSubmit}>
                {i18n.global.t('packages_component_button_confirm')}
              </ElButton>
            </div>
          </ElDialog>
        </div>
      )
    }
  }
})
