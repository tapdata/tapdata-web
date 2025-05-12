import { autorun } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { defineComponent, onBeforeUnmount, ref, unref } from 'vue'
import { CursorStatus } from '../../../core'
import { useCursor, useDesigner, usePrefix } from '../../../hooks'
import { NodeTitleWidget } from '../NodeTitleWidget'
import './styles.scss'

export const GhostWidget = observer(
  defineComponent({
    setup: () => {
      const designer = useDesigner()
      const cursorRef = useCursor()
      const root = ref(null)
      const prefix = usePrefix('ghost')
      const dispose = autorun(() => {
        const cursor = unref(cursorRef)
        const transform = `perspective(1px) translate3d(${cursor.position?.topClientX - 18}px,${
          cursor.position?.topClientY - 12
        }px,0) scale(0.8)`
        if (!root.value) return
        root.value.style.transform = transform
      })

      onBeforeUnmount(() => {
        dispose?.()
      })

      return { root, prefix, designer, cursor: cursorRef }
    },

    render() {
      const draggingNodes = this.designer.findDraggingNodes()
      const firstNode = draggingNodes[0]
      const renderNodes = () => {
        return (
          <span
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <NodeTitleWidget node={firstNode} />
            {draggingNodes.length > 1 ? '...' : ''}
          </span>
        )
      }
      if (!firstNode || this.cursor.status !== CursorStatus.Dragging)
        return null
      return (
        <div id="Ghost" ref="root" class={this.prefix}>
          {renderNodes()}
        </div>
      )
    },
  }),
)
