import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue'
import { useForm } from '@tap/form'
import SchemaFieldList from './List.vue'

export const fieldInference = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      const formRef = useForm()
      const form = formRef.value

      return () => {
        return <Main ref="fieldMapping" form={form} attrs={attrs} on={listeners} />
      }
    }
  })
)

export default fieldInference

export { SchemaFieldList }
