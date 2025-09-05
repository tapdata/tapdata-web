import { observer } from '@formily/reactive-vue'
import { connect, mapProps } from '@formily/vue'
import { taskApi } from '@tap/api'
import {
  FormItem,
  computed as reactiveComputed,
  useField,
  useForm,
} from '@tap/form'
import i18n from '@tap/i18n'
import { computed, defineComponent, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

export const SchemaFormItem = connect(
  observer(
    defineComponent({
      props: {
        disabled: Boolean,
        type: String, // connection | table
      },
      setup(props, { attrs, slots }) {
        const store = useStore()
        const { taskId, activeNodeId } = store.state?.dataflow || {}
        const formRef = useForm()
        const form = formRef.value
        const field = useField()
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
