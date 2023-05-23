import { AsyncSelect } from '@tap/form'
import { useField } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { watch, defineComponent } from '@vue/composition-api'

export const TableSelect = observer(
  defineComponent({
    props: ['reloadTime', 'connectionId'],
    setup(props, { attrs, listeners, root, refs }) {
      const fieldRef = useField()

      watch(
        () => props.reloadTime,
        () => {
          refs.list?.loadData()
        }
      )

      return () => {
        const params = { where: { 'source.id': props.connectionId, taskId: root.$store.state.dataflow.taskId } }
        return (
          <AsyncSelect
            ref="list"
            attrs={attrs}
            on={listeners}
            itemType="string"
            itemQuery="original_name"
            params={params}
          />
        )
      }
    }
  })
)

export default TableSelect
