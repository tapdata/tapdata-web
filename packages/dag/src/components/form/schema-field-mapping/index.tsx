import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'
import { defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'
import FiledMapping from '../field-mapping'

export const SchemaFiledMapping = observer(
  defineComponent({
    setup() {
      const store = useStore()
      const formRef = useForm()
      const fieldMappingRef = ref()
      let unwatch
      let timer
      const clearWatch = () => {
        clearTimeout(timer)
        unwatch?.()
      }
      observe(formRef.value.values.$inputs, () => {
        clearWatch()
        unwatch = watch(
          () => store.state.dataflow.editVersion,
          () => {
            clearWatch()
            // setTimeout 只是兜底，目前没有准确的机制告诉前端可以加载
            timer = setTimeout(() => {
              fieldMappingRef.value.$refs.list.getMetadataTransformer()
            }, 500)
          },
        )
      })
      onBeforeUnmount(() => {
        clearWatch()
      })

      return () => {
        return (
          <FiledMapping
            ref={fieldMappingRef}
            itemType="string"
            itemQuery="original_name"
          />
        )
      }
    },
  }),
)

export default SchemaFiledMapping
