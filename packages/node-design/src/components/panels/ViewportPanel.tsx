import { defineComponent } from 'vue'
import { Simulator } from '../containers'
import { WorkspacePanel } from './WorkspacePanel'

export const ViewportPanel = defineComponent({
  name: 'DnViewportPanel',
  setup(props, { attrs, slots }) {
    return () => {
      return (
        <WorkspacePanel.Item {...attrs} flexable={true}>
          <Simulator>{slots.default?.()}</Simulator>
        </WorkspacePanel.Item>
      )
    }
  },
})
