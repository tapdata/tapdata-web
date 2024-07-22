import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { computed, defineComponent } from '@vue/composition-api'
import { useForm, FormItem } from '@tap/form'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import SchemaFieldList from './List.vue'
import { connect, mapProps } from '../../../../../form'

export const fieldInference = connect(
  observer(
    defineComponent({
      props: ['disabled'],
      setup(props, { attrs, listeners, refs, root }) {
        const formRef = useForm()
        const form = formRef.value

        const batchRuleCounts = computed(() => {
          return form.values.fieldChangeRules?.filter(t => t.scope === 'Node').length || 0
        })

        const rollbackAll = () => {
          refs.fieldMapping.rollbackAll()
        }

        const open = () => {
          refs.fieldMapping.handleOpen()
        }

        return () => {
          const label = (
            <div class="inline-flex align-center position-absolute w-100 gap-2">
              <span>{i18n.t('packages_dag_nodes_database_tuiyanjieguo')}</span>

              {batchRuleCounts.value > 0 && (
                <div className="flex align-items-center cursor-pointer color-primary" onClick={open}>
                  <VIcon>info</VIcon>
                  <span
                    domPropsInnerHTML={i18n.t('packages_form_batch_rule_active', { val: batchRuleCounts.value })}
                  ></span>
                </div>
              )}

              <ElLink class="ml-auto" disabled={props.disabled} size="mini" type="primary" onClick={rollbackAll}>
                <div class="flex align-center px-1">
                  <VIcon class="mr-1">reset</VIcon>
                  {i18n.t('packages_form_field_inference_main_quanbuhuifumo')}
                </div>
              </ElLink>
            </div>
          )

          return (
            <div>
              <FormItem.BaseItem label={label}>
                <Main
                  ref="fieldMapping"
                  form={form}
                  attrs={attrs}
                  on={listeners}
                  uniqueIndexEnable={form.values.uniqueIndexEnable}
                />
              </FormItem.BaseItem>
            </div>
          )
        }
      }
    })
  ),
  mapProps({ disabled: true })
)

export default fieldInference

export { SchemaFieldList }
