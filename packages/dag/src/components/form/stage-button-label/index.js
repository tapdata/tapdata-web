import { defineComponent } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'

import StageButton from '@tap/component/src/StageButton'
import { FormItem } from '@tap/form'

export const StageButtonLabel = observer(
  defineComponent({
    props: ['value', 'disabled', 'connectionId', 'title'],
    setup(props, { emit, root, attrs, refs, slots }) {
      const { taskId, activeNodeId } = root.$store.state?.dataflow || {}
      return () => {
        const label = (
          <div class="inline-flex align-center">
            <span class="mr-2">{props.title}</span>
            <StageButton connection-id={props.connectionId} task-id={taskId} node-id={activeNodeId}></StageButton>
          </div>
        )

        return (
          <FormItem.BaseItem class="js-editor-form-item" label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
