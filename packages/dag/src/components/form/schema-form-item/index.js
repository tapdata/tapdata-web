import { observer } from '@formily/reactive-vue'
import { computed, defineComponent, ref } from '@vue/composition-api'
import { FormItem, useForm } from '@tap/form'
import { taskApi } from '@tap/api'
import i18n from '@tap/i18n'

export const SchemaFormItem = observer(
  defineComponent({
    props: {
      title: String,
      type: String // connection | table
    },
    setup(props, { emit, root, attrs, refs, slots }) {
      const { taskId, activeNodeId } = root.$store.state?.dataflow || {}
      const formRef = useForm()
      const form = formRef.value
      const loading = ref(false)
      const isLoading = computed(() => {
        return loading.value || root.$store.state?.dataflow?.transformLoading
      })

      const loadSchema = async () => {
        loading.value = true
        await taskApi
          .refreshSchema(taskId, {
            nodeIds: activeNodeId,
            keys: props.type === 'connection' ? undefined : form.values.tableName
          })
          .finally(() => {
            loading.value = false
          })
      }

      const showBtn = computed(() => {
        return props.type === 'connection' || form.values.tableName
      })

      return () => {
        const label = (
          <div class="inline-flex align-center">
            <span class="mr-2">{props.title}</span>
            {showBtn.value && (
              <el-button onClick={loadSchema} type="text" loading={isLoading.value}>
                {i18n.t('public_connection_button_load_schema')}
              </el-button>
            )}
          </div>
        )

        return (
          <FormItem.BaseItem label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
