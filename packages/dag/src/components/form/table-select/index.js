import { AsyncSelect } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { defineComponent, computed } from '@vue/composition-api'

export const TableSelect = observer(
  defineComponent({
    props: ['reloadTime', 'connectionId'],
    setup(props, { attrs, listeners, root, refs }) {
      const params = computed(() => {
        return {
          reloadTime: props.reloadTime,
          where: {
            'source.id': props.connectionId,
            taskId: root.$store.state.dataflow.taskId
          }
        }
      })

      return () => {
        return (
          <AsyncSelect
            ref="list"
            attrs={attrs}
            on={listeners}
            itemType="string"
            itemQuery="original_name"
            params={params.value}
          ></AsyncSelect>
        )
      }
    }
  })
)

export default TableSelect
