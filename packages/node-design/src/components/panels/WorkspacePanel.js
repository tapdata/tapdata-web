import { usePrefix } from '../../hooks'
import { defineComponent } from 'vue-demi'
import { composeExport } from '@tap/form'

const WorkspacePanelComponent = defineComponent({
  setup(props, { slots }) {
    const prefix = usePrefix('workspace-panel')
    return () => <div class={prefix}>{slots.default?.()}</div>
  }
})

const WorkspacePanelItem = defineComponent({
  props: ['flexable'],
  setup(props, { slots }) {
    const prefix = usePrefix('workspace-panel-item')
    return () => {
      // const style = useStyle()
      return (
        <div
          class={prefix}
          style={{
            // ...style,
            flexGrow: props.flexable ? 1 : 0,
            flexShrink: props.flexable ? 1 : 0
          }}
        >
          {slots.default?.()}
        </div>
      )
    }
  }
})

export const WorkspacePanel = composeExport(WorkspacePanelComponent, {
  Item: WorkspacePanelItem
})
