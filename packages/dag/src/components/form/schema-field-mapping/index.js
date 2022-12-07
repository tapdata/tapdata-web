import FiledMapping from '../field-mapping'
import { observer } from '@formily/reactive-vue'
import { defineComponent, onBeforeUnmount } from '@vue/composition-api'
import { observe } from '@formily/reactive'
import { useForm } from '@formily/vue'

export const SchemaFiledMapping = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      const formRef = useForm()
      let unwatch
      let timer
      const clearWatch = () => {
        clearTimeout(timer)
        unwatch?.()
      }
      observe(formRef.value.values.$inputs, () => {
        clearWatch()
        unwatch = root.$watch(
          () => root.$store.state.dataflow.editVersion,
          () => {
            clearWatch()
            // setTimeout 只是兜底，目前没有准确的机制告诉前端可以加载
            timer = setTimeout(() => {
              refs.fieldMapping.$refs.list.getMetadataTransformer()
            }, 500)
          }
        )
      })
      onBeforeUnmount(() => {
        clearWatch()
      })

      return () => {
        return (
          <FiledMapping ref="fieldMapping" attrs={attrs} on={listeners} itemType="string" itemQuery="original_name" />
        )
      }
    }
  })
)

export default SchemaFiledMapping
