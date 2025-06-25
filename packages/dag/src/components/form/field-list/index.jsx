import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'
import { defineComponent, ref } from 'vue'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import SchemaFieldList from './List.vue'
import Main from './Main.vue'

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
