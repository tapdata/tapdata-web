import { getMetadataInstancesCompareResult, useRequest } from '@tap/api'
import { FormItem, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { computed, defineComponent, ref } from 'vue'
import { connect, mapProps } from '../../../../../form'
import CompareResultDialog from './CompareResultDialog.vue'
import SchemaFieldList from './List.vue'
import Main from './Main.vue'

export const fieldInference = connect(
  defineComponent({
    props: ['disabled'],
    setup(props, { attrs }) {
      const formRef = useForm()
      const form = formRef.value
      const nodeId = form.values.id

      const batchRuleCounts = computed(() => {
        return (
          form.values.fieldChangeRules?.filter((t) => t.scope === 'Node')
            .length || 0
        )
      })

      const fieldMapping = ref(null)

      const rollbackAll = () => {
        fieldMapping.value.rollbackAll()
      }

      const open = () => {
        fieldMapping.value.handleOpen()
      }

      const dialogOpen = ref(false)

      const openCompareResult = () => {
        dialogOpen.value = true
      }

      return () => {
        const label = (
          <div class="inline-flex align-center position-absolute w-100 gap-2">
            <span>{i18n.t('packages_dag_nodes_database_tuiyanjieguo')}</span>

            {batchRuleCounts.value > 0 && (
              <div
                class="flex align-items-center cursor-pointer color-primary"
                onClick={open}
              >
                <VIcon>info</VIcon>
                <span
                  v-html={i18n.t('packages_form_batch_rule_active', {
                    val: batchRuleCounts.value,
                  })}
                ></span>
              </div>
            )}

            <div class="flex-1"></div>

            <ElButton
              type="primary"
              text
              tag="a"
              onClick={openCompareResult}
              disabled={props.disabled}
            >
              {i18n.t('packages_dag_view_compare_result')}
            </ElButton>

            <ElButton
              class="ml-auto"
              disabled={props.disabled}
              type="primary"
              text
              tag="a"
              onClick={rollbackAll}
            >
              <div class="flex align-center px-1">
                <VIcon class="mr-1">reset</VIcon>
                {i18n.t('packages_form_field_inference_main_quanbuhuifumo')}
              </div>
            </ElButton>
          </div>
        )

        return (
          <div>
            <FormItem.BaseItem label={label}>
              <Main
                ref={fieldMapping}
                form={form}
                attrs={attrs}
                uniqueIndexEnable={form.values.uniqueIndexEnable}
              />
            </FormItem.BaseItem>

            <CompareResultDialog v-model={dialogOpen.value} nodeId={nodeId} />
          </div>
        )
      }
    },
  }),
  mapProps({ disabled: true }),
)

export default fieldInference

export { SchemaFieldList }
