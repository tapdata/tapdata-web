import { observer } from '@formily/reactive-vue'
import { SchemaExpressionScopeSymbol } from '@formily/vue'
import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'
import { FormItem } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent, inject } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

export const SharedMiningTableInfo = observer(
  defineComponent({
    props: ['value', 'height'],
    setup(props, { attrs, slots }) {
      const store = useDataflowStore()
      const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
      const taskId = SchemaExpressionScopeContext.value.$settings.id

      return () => {
        const con = (
          <SharedMiningTable
            task-id={taskId}
            params={{
              nodeId: store.selectedNode?.id,
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
