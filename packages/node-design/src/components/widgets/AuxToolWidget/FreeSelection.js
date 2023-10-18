import { useCursor, usePrefix, useViewport } from '../../../hooks'
import { observer } from '@formily/reactive-vue'
import { CursorStatus, CursorType } from '../../../core'
import { calcRectByStartEndPoint } from '@tap/shared'
import { defineComponent } from 'vue'

export const FreeSelection = observer(
  defineComponent({
    setup: () => {
      const cursor = useCursor()
      const viewportRef = useViewport()
      const prefix = usePrefix('aux-free-selection')
      const createSelectionStyle = () => {
        const startDragPoint = viewportRef.value.getOffsetPoint({
          x: cursor.dragStartPosition.topClientX,
          y: cursor.dragStartPosition.topClientY
        })
        const currentPoint = viewportRef.value.getOffsetPoint({
          x: cursor.position.topClientX,
          y: cursor.position.topClientY
        })
        const rect = calcRectByStartEndPoint(
          startDragPoint,
          currentPoint,
          viewportRef.value.scrollX - cursor.dragStartScrollOffset.scrollX,
          viewportRef.value.scrollY - cursor.dragStartScrollOffset.scrollY
        )
        const baseStyle = {
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.2,
          borderWidth: 1,
          borderStyle: 'solid',
          transform: `perspective(1px) translate3d(${rect.x}px,${rect.y}px,0)`,
          height: rect.height,
          width: rect.width,
          pointerEvents: 'none',
          boxSizing: 'border-box',
          zIndex: 1
        }
        return baseStyle
      }

      return () => {
        if (cursor.status !== CursorStatus.Dragging || cursor.type !== CursorType.Selection) return null
        return <div class={prefix} style={createSelectionStyle()}></div>
      }
    }
  })
)
