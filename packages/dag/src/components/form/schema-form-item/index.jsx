import { observer } from '@formily/reactive-vue'
import { computed, defineComponent, ref } from 'vue'
import { FormItem, useForm } from '@tap/form'
import { taskApi } from '@tap/api'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { connect, mapProps } from '@formily/vue'
import { useStore } from 'vuex'

export const SchemaFormItem = connect(
  observer(
    defineComponent({
      props: {
        disabled: Boolean,
        type: String, // connection | table
      },
      setup(props, { emit, root, attrs, refs, slots }) {
        const store = useStore()
        const { taskId, activeNodeId } = store.state?.dataflow || {}
        const formRef = useForm()
        const form = formRef.value
        const loading = ref(false)
        const isLoading = computed(() => {
          return loading.value || store.state?.dataflow?.transformLoading
        })

        const loadSchema = async () => {
          loading.value = true
          store.commit('dataflow/setSchemaRefreshing', true)
          await taskApi
            .refreshSchema(taskId, {
              nodeIds: activeNodeId,
              keys: props.type === 'table' ? form.values.tableName : undefined,
            })
            .finally(() => {
              loading.value = false
              store.commit('dataflow/setSchemaRefreshing', false)
            })
        }

        const showBtn = computed(() => {
          return !props.disabled && (props.type !== 'table' || form.values.tableName)
        })

        return () => {
          const label = (
            <div class="inline-flex align-center">
              <span class="mr-2">{attrs.title}</span>
              {showBtn.value && (
                <el-button onClick={loadSchema} type="text" loading={isLoading.value}>
                  {i18n.t('public_button_reload')}
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
      },
    }),
  ),
  mapProps({ disabled: true }),
)
