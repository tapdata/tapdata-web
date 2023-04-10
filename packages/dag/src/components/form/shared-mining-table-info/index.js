import { defineComponent } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'

import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'

import { FormItem, useForm } from '@tap/form'

export const SharedMiningTableInfo = observer(
  defineComponent({
    props: ['value', 'height'],
    setup(props, { emit, root, attrs, refs, slots }) {
      const { taskId, activeNodeId } = root.$store.state?.dataflow || {}
      console.log('props', props, attrs)
      const formRef = useForm()

      return () => {
        const label = (
          <SharedMiningTable
            task-id={taskId}
            params={{
              nodeId: activeNodeId
            }}
            height={props.height}
          ></SharedMiningTable>
        )

        return (
          <FormItem.BaseItem label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
