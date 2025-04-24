import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { ref, computed, defineComponent } from 'vue'
import { useForm, FormItem } from '@tap/form'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import SchemaFieldList from './List.vue'
import { connect, mapProps } from '../../../../../form'

export const fieldInference = connect(
  defineComponent({
    props: ['disabled'],
    setup(props, { attrs }) {
      const formRef = useForm()
      const form = formRef.value

      const batchRuleCounts = computed(() => {
        return form.values.fieldChangeRules?.filter((t) => t.scope === 'Node').length || 0
      })

      const fieldMapping = ref(null)

      const rollbackAll = () => {
        fieldMapping.value.rollbackAll()
      }

      const open = () => {
        fieldMapping.value.handleOpen()
      }

      return () => {
        const label = (
          <div class="inline-flex align-center position-absolute w-100 gap-2">
            <span>{i18n.t('packages_dag_nodes_database_tuiyanjieguo')}</span>

            {batchRuleCounts.value > 0 && (
              <div class="flex align-items-center cursor-pointer color-primary" onClick={open}>
                <VIcon>info</VIcon>
                <span v-html={i18n.t('packages_form_batch_rule_active', { val: batchRuleCounts.value })}></span>
              </div>
            )}

            <ElButton class="ml-auto" disabled={props.disabled} type="primary" text tag="a" onClick={rollbackAll}>
              <div class="flex align-center px-1">
                <VIcon class="mr-1">reset</VIcon>
                {i18n.t('packages_form_field_inference_main_quanbuhuifumo')}
              </div>
            </ElButton>
          </div>
        )

        console.log('form.values.uniqueIndexEnable', form.values.uniqueIndexEnable)
        return (
          <div>
            <FormItem.BaseItem label={label}>
              <Main ref="fieldMapping" form={form} attrs={attrs} uniqueIndexEnable={form.values.uniqueIndexEnable} />
            </FormItem.BaseItem>
          </div>
        )
      }
    },
  }),
  mapProps({ disabled: true }),
)

export default fieldInference

export { SchemaFieldList }
