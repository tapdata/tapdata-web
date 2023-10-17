import { defineComponent } from 'vue'
import { observer } from '@formily/reactive-vue'

import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'

import { FormItem, useForm } from '@tap/form'

export const SharedMiningTableInfo = observer(
  defineComponent({
    props: ['value', 'height'],
    setup(props, { emit, root, attrs, refs, slots }) {
      const { taskId, activeNodeId } = root.$store.state?.dataflow || {}

      return () => {
        const con = (
          <SharedMiningTable
            task-id={taskId}
            params={{
              nodeId: activeNodeId
            }}
            height={props.height}
            show-title={false}
          ></SharedMiningTable>
        )

        return (
          <FormItem.BaseItem
            label={root.$t('packages_dag_shared_mining_table_info_index_wajuebiaoxinxi')}
            attrs={attrs}
          >
            {con}
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
