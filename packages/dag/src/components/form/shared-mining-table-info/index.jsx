import { observer } from '@formily/reactive-vue'
import i18n from '@tap/i18n'
import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export const SharedMiningTableInfo = observer(
  defineComponent({
    props: ['value', 'height'],
    setup(props, { attrs, slots }) {
      const store = useStore()
      const { taskId, activeNodeId } = store.state?.dataflow || {}

      return () => {
        const con = (
          <SharedMiningTable
            task-id={taskId}
            params={{
              nodeId: activeNodeId,
            }}
            height={props.height}
            show-title={false}
          ></SharedMiningTable>
        )

        return (
          <FormItem.BaseItem
            label={i18n.t(
              'packages_dag_shared_mining_table_info_index_wajuebiaoxinxi',
            )}
            attrs={attrs}
          >
            {con}
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    },
  }),
)
