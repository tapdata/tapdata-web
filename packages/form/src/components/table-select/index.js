import AsyncSelect from '../async-select'
import { useField } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

export const TableSelect = observer(
  defineComponent({
    setup(props, { attrs, listeners, root }) {
      const fieldRef = useField()
      // const createValidate = v => /^[a-zA-Z][0-9a-zA-Z_.-]*$/.test(v)
      // const handleCreate = v => {
      //   if (!createValidate(v)) {
      //     fieldRef.value.setFeedback({
      //       triggerType: 'onFocus',
      //       type: 'warning',
      //       code: 'ValidateWarning',
      //       messages: '输入的表名不合法'
      //     })
      //     console.log('表名格式错误') // eslint-disable-line
      //   }
      // }
      return () => {
        const connectionId = fieldRef.value.query('connectionId').value()
        const params = { where: { 'source.id': connectionId, taskId: root.$store.state.dataflow.taskId } }
        // console.log('TableSelect', params, attrs) // eslint-disable-line
        return (
          <AsyncSelect
            attrs={attrs}
            on={listeners}
            // vOn:create={handleCreate}
            itemType="string"
            itemQuery="original_name"
            // createValidate={createValidate}
            params={params}
          />
        )
      }
    }
  })
)

export default TableSelect
