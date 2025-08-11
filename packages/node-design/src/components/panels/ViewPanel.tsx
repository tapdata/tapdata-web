import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue'
import { useTree, useWorkbench } from '../../hooks'
import { Viewport } from '../containers'
import type { ITreeNode } from '../../types'

const ViewPanelComponent = defineComponent({
  name: 'DnViewPanel',
  props: {
    type: String,
    scrollable: { type: Boolean, default: true },
    dragTipsDirection: { type: String },
  },
  setup(props, { slots }) {
    // const visible = ref(true)
    const workbenchRef = useWorkbench()
    const treeRef = useTree()

    // onMounted(() => {
    //   if (workbenchRef.value.type === props.type) {
    //     requestIdle(() => {
    //       requestAnimationFrame(() => {
    //         visible.value = true
    //       })
    //     })
    //   } else {
    //     visible.value = false
    //   }
    // })

    return () => {
      if (workbenchRef.value.type !== props.type) return null

      const render = () => {
        return slots.default?.(
          {
            tree: treeRef.value,
            customNode: workbenchRef.value.engine.props.customNode,
            onChange: (payload: ITreeNode) => {
              treeRef.value.from(payload)
            },
          },
          (payload: ITreeNode) => {
            treeRef.value.from(payload)
            // treeRef.value.takeSnapshot()
          },
        )
      }

      if (workbenchRef.value.type === 'DESIGNABLE') {
        return (
          <Viewport {...{ dragTipsDirection: props.dragTipsDirection }}>
            {render()}
          </Viewport>
        )
      }

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
export const ViewPanel = observer(ViewPanelComponent)
