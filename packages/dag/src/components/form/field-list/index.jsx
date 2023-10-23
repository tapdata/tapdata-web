import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue'
import { useForm } from '@tap/form'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import SchemaFieldList from './List.vue'

export const fieldList = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      const formRef = useForm()
      const form = formRef.value

      useAfterTaskSaved(root, formRef.value.values.$inputs, () => {
        refs.fieldList?.loadData(true)
      })

      return () => {
        return <Main ref="fieldList" form={form} attrs={attrs} on={listeners} />
      }
    }
  })
)

export default fieldList

export { SchemaFieldList }
