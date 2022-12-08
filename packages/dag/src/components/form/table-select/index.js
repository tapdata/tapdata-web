import { AsyncSelect } from '@tap/form'
import { useField } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from '@vue/composition-api'

export const TableSelect = observer(
  defineComponent({
    setup(props, { attrs, listeners, root }) {
      const fieldRef = useField()
      return () => {
        const connectionId = fieldRef.value.query('connectionId').value()
        const params = { where: { 'source.id': connectionId, taskId: root.$store.state.dataflow.taskId } }
        return <AsyncSelect attrs={attrs} on={listeners} itemType="string" itemQuery="original_name" params={params} />
      }
    }
  })
)

export default TableSelect
