import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import { useForm } from '@formily/vue'
import { useAfterTaskSaved } from '../../hooks/useAfterTaskSaved'

export const fieldInference = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      const formRef = useForm()
      const form = formRef.value

      useAfterTaskSaved(root, formRef.value.values.$inputs, () => {
        refs.fieldMapping?.loadData()
      })

      return () => {
        return <Main ref="fieldMapping" form={form} attrs={attrs} on={listeners} />
      }
    }
  })
)

export default fieldInference
