import { observer } from '@formily/reactive-vue'
import { useTree, useWorkbench } from '../../hooks'
import { Viewport } from '../containers'
import { defineComponent } from 'vue-demi'

export const ViewPanel = observer(
  defineComponent({
    props: {
      type: String,
      scrollable: { type: Boolean, default: true },
      dragTipsDirection: { type: String },
    },
    setup: (props, { slots }) => {
      const workbenchRef = useWorkbench()
      const treeRef = useTree()

      return () => {
        const workbench = workbenchRef.value
        const tree = treeRef.value
        if (workbench.type !== props.type) return null
        const render = () => {
          return slots.default({
            tree,
            customNode: workbench.engine.props.customNode,
            onChange: (payload) => {
              tree.from(payload)
            },
          })
        }
        if (workbench.type === 'DESIGNABLE')
          return (
            <Viewport dragTipsDirection={props.dragTipsDirection}>
              {render()}
            </Viewport>
          )

        return (
          <div
            style={{
              overflow: props.scrollable ? 'overlay' : 'hidden',
              height: '100%',
              cursor: 'auto',
              userSelect: 'text',
            }}
          >
            {render()}
          </div>
        )
      }
    },
  })
)
