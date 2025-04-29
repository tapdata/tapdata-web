import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { defineComponent, ref } from 'vue'
import { useForm } from '@tap/form'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import SchemaFieldList from './List.vue'

export const fieldList = observer(
  defineComponent({
    setup() {
      const formRef = useForm()
      const form = formRef.value
      const fieldList = ref(null)

      useAfterTaskSaved(formRef.value.values.$inputs, () => {
        fieldList.value?.loadData(true)
      })

      return () => {
        return <Main ref={fieldList} form={form} />
      }
    },
  }),
)

export default fieldList

export { SchemaFieldList }
