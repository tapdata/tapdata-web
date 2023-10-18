import { observer } from '@formily/reactive-vue'
import { useTreeNode, useNodeIdProps } from '../../../hooks'
import { NodeTitleWidget } from '../NodeTitleWidget'
import { NodeActionsWidget } from '../NodeActionsWidget'
import './styles.scss'
import { defineComponent, toRefs } from 'vue'

export const DroppableWidget = observer(
  defineComponent({
    props: {
      node: Object,
      actions: Array,
      height: Number,
      showPlaceholder: {
        type: Boolean,
        default: true
      }
    },
    setup: (props, { slots }) => {
      const { node, actions, height, showPlaceholder } = toRefs(props)
      const currentNode = useTreeNode()
      const nodeId = useNodeIdProps(node)
      const target = node ?? currentNode
      const hasChildren = target.children?.length > 0
      return () => (
        <div {...nodeId}>
          {hasChildren ? (
            slots.default?.()
          ) : showPlaceholder ? (
            <div style={{ height: height + 'px' }} class="dn-droppable-placeholder">
              <NodeTitleWidget node={target} />
            </div>
          ) : (
            slots.default?.()
          )}
          {actions?.length ? (
            <NodeActionsWidget>
              {actions.map((action, key) => (
                <NodeActionsWidget.Action {...action} key={key} />
              ))}
            </NodeActionsWidget>
          ) : null}
        </div>
      )
    }
  })
)
