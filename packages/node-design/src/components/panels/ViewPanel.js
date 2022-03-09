import { observer } from '@formily/reactive-vue'
import { useTree, useWorkbench } from '../../hooks'
import { Viewport } from '../containers'
import { defineComponent, ref } from 'vue-demi'

export const ViewPanel = observer(
  defineComponent({
    props: {
      type: String,
      scrollable: { type: Boolean, default: true },
      dragTipsDirection: { type: String }
    },
    setup: (props, { slots }) => {
      const workbench = useWorkbench()
      const tree = useTree()
      // useEffect(() => {
      //   if (workbench.type === props.type) {
      //     requestIdle(() => {
      //       requestAnimationFrame(() => {
      //         setVisible(true)
      //       })
      //     })
      //   } else {
      //     setVisible(false)
      //   }
      // }, [workbench.type])

      return () => {
        if (workbench.type !== props.type) return null
        const render = () => {
          return slots.default(tree, payload => {
            tree.from(payload)
            tree.takeSnapshot()
          })
        }
        if (workbench.type === 'DESIGNABLE')
          return <Viewport dragTipsDirection={props.dragTipsDirection}>{render()}</Viewport>

        return (
          <div
            style={{
              overflow: props.scrollable ? 'overlay' : 'hidden',
              height: '100%',
              cursor: 'auto',
              userSelect: 'text'
            }}
          >
            {render()}
          </div>
        )
      }
    }
  })
)
