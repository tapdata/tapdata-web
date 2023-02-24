import { useHover, usePrefix, useSelection, useViewport } from '../../../hooks'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

// 组件hover的虚线框
const DashedBoxComponent = observer(
  defineComponent({
    setup() {
      const viewportRef = useViewport()
      const viewport = viewportRef.value
      const hoverRef = useHover()
      const prefix = usePrefix('aux-dashed-box')
      const selectionRef = useSelection()

      return () => {
        const selection = selectionRef.value
        const createTipsStyle = () => {
          const baseStyle = {
            top: 0,
            left: 0,
            pointerEvents: 'none',
            boxSizing: 'border-box',
            visibility: 'hidden',
            zIndex: 2,
          }
          if (rect) {
            baseStyle.transform = `perspective(1px) translate3d(${rect.x}px,${rect.y}px,0)`
            baseStyle.height = rect.height + 'px'
            baseStyle.width = rect.width + 'px'
            baseStyle.visibility = 'visible'
          }
          return baseStyle
        }

        if (!hoverRef.value.node) return null
        if (hoverRef.value.node.hidden) return null
        if (selection.selected.includes(hoverRef.value.node.id)) return null

        const rect = viewport.getValidNodeOffsetRect(hoverRef.value.node)

        return (
          <div
            data-id={hoverRef.value.node.id}
            class={prefix}
            style={createTipsStyle()}
          >
            <span
              class={prefix + '-title'}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                fontSize: '12px',
                userSelect: 'none',
                fontWeight: 'lighter',
                whiteSpace: 'nowrap',
              }}
            >
              {hoverRef.value?.node.getMessage('title')}
            </span>
          </div>
        )
      }
    },
  })
)

export const DashedBox = observer(
  defineComponent({
    setup() {
      return () => {
        return <DashedBoxComponent></DashedBoxComponent>
      }
    },
  })
)
