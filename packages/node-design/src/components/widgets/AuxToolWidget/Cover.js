import { useViewport, useDragon, useCursor, useValidNodeOffsetRect, usePrefix } from '../../../hooks'
import { FragmentComponent } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { CursorStatus, ClosestPosition } from '../../../core'
import { defineComponent } from 'vue'

// 组件拖拽中或者其他组件准备拖进来的Cover背景提示

const CoverRect = defineComponent({
  props: ['node', 'dragging', 'dropping'],
  setup: props => {
    const prefix = usePrefix('aux-cover-rect')
    const rectRef = useValidNodeOffsetRect(props.node)
    const createCoverStyle = () => {
      const rect = rectRef.value
      const baseStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }
      if (rect) {
        baseStyle.transform = `perspective(1px) translate3d(${rect.x}px,${rect.y}px,0)`
        baseStyle.height = rect.height + 'px'
        baseStyle.width = rect.width + 'px'
      }
      return baseStyle
    }

    return () => (
      <div
        class={[
          prefix,
          {
            dragging: props.dragging,
            dropping: props.dropping
          }
        ]}
        style={createCoverStyle()}
      ></div>
    )
  }
})

export const Cover = observer(
  defineComponent({
    setup: () => {
      const viewportDragonRef = useDragon()
      const viewportRef = useViewport()
      const cursorRef = useCursor()
      const renderDropCover = () => {
        if (
          !viewportDragonRef.value.closestNode ||
          !viewportDragonRef.value.closestNode?.allowAppend(viewportDragonRef.value.dragNodes) ||
          viewportDragonRef.value.closestDirection !== ClosestPosition.Inner
        )
          return null
        return <CoverRect node={viewportDragonRef.value.closestNode} dropping />
      }

      return () => {
        const cursor = cursorRef.value
        const viewport = viewportRef.value
        if (cursor.status !== CursorStatus.Dragging) return null
        return (
          <FragmentComponent>
            {viewportDragonRef.value.dragNodes.map(node => {
              if (!node) return
              if (!viewport.findElementById(node.id)) return
              return <CoverRect key={node.id} node={node} dragging />
            })}
            {renderDropCover()}
          </FragmentComponent>
        )
      }
    }
  })
)
