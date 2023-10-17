import { WorkspacePanel } from './WorkspacePanel'
import { Simulator } from '../containers'
import { defineComponent } from 'vue-demi'
export const ViewportPanel = defineComponent({
  setup: (props, { slots }) => {
    return () => (
      <WorkspacePanel.Item props={props} flexable>
        <Simulator>{slots.default?.()}</Simulator>
      </WorkspacePanel.Item>
    )
  },
})
