import { NodeActionsWidget } from '../../widgets/NodeActionsWidget'
import { defineComponent } from 'vue-demi'

export const LoadTemplate = defineComponent({
  props: ['actions'],
  setup: props => {
    return () => (
      <NodeActionsWidget>
        {props.actions?.map((action, key) => {
          return <NodeActionsWidget.Action {...action} key={key} />
        })}
      </NodeActionsWidget>
    )
  }
})
