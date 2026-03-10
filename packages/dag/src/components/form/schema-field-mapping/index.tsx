import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'
import { defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import FiledMapping from '../field-mapping'

export const SchemaFiledMapping = observer(
  defineComponent({
    setup() {
      const dataflowStore = useDataflowStore()
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
          () => dataflowStore.editVersion,
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
