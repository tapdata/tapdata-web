import { observer } from '@formily/reactive-vue'
import { connect, mapProps } from '@formily/vue'
import { refreshTaskSchema } from '@tap/api/src/core/task'
import { FormItem, useField, useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { computed, defineComponent, ref } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

export const SchemaFormItem = connect(
  observer(
    defineComponent({
      props: {
        disabled: Boolean,
        type: String, // connection | table
      },
      setup(props, { attrs, slots }) {
        const dataflowStore = useDataflowStore()
        const taskId = dataflowStore.dataflow.taskId
        const activeNodeId = dataflowStore.selectedNode?.id

        const formRef = useForm()
        const form = formRef.value
        const field = useField()
        const loading = ref(false)
        const isLoading = computed(() => {
          return loading.value || dataflowStore?.transformLoading
        })

        const loadSchema = async () => {
          loading.value = true
          dataflowStore.schemaRefreshing = true
          await refreshTaskSchema(taskId, {
            nodeIds: activeNodeId,
            keys: props.type === 'table' ? form.values.tableName : undefined,
          }).finally(() => {
            loading.value = false
            dataflowStore.schemaRefreshing = false
          })
        }

        const showBtn = computed(() => {
          return (
            !props.disabled && (props.type !== 'table' || form.values.tableName)
          )
        })

        const renderLabel = () => (
          <div class="inline-flex align-center">
            <span class="mr-2">{field.value.title}</span>
            {showBtn.value && (
              <>
                <el-button
                  onClick={loadSchema}
                  text
                  type="primary"
                  loading={isLoading.value}
                  tag="a"
                >
                  {i18n.t('public_button_reload')}
                </el-button>
              </>
            )}
          </div>
        )

        return () => {
          return (
            <FormItem.BaseItem label={renderLabel()} attrs={attrs}>
              {slots.default?.()}
            </FormItem.BaseItem>
          )
        }
      },
    }),
  ),
  mapProps({ disabled: true }),
)
