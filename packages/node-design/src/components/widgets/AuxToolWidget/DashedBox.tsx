import { observer } from '@formily/reactive-vue'
import { composeExport } from '@tap/form/src/shared'
import { isNum } from '@tap/shared'
import { computed, defineComponent } from 'vue'
import {
  useHover,
  usePrefix,
  useSelection,
  useValidNodeOffsetRect,
} from '../../../hooks'

const DashBox = observer(
  defineComponent({
    name: 'DashBox',
    setup() {
      const hoverRef = useHover()
      const prefixRef = usePrefix('aux-dashed-box')
      const selectionRef = useSelection()

      const rectRef = useValidNodeOffsetRect(
        computed(() => hoverRef.value?.node),
      )

      return () => {
        const rect = rectRef.value
        const createTipsStyle = () => {
          const baseStyle: any = {
            top: 0,
            left: 0,
            pointerEvents: 'none',
            boxSizing: 'border-box',
            visibility: 'hidden',
            zIndex: 2,
          }
          if (rect) {
            baseStyle.transform = `perspective(1px) translate3d(${rect.x}px,${rect.y}px,0)`
            baseStyle.height = isNum(rect.height)
              ? `${rect.height}px`
              : rect.height
            baseStyle.width = isNum(rect.width) ? `${rect.width}px` : rect.width
            baseStyle.visibility = 'visible'
          }
          return baseStyle
        }
        if (!hoverRef.value.node) return null
        if (hoverRef.value.node.hidden) return null
        if (selectionRef.value.selected.includes(hoverRef.value.node.id))
          return null
        return (
          <div class={prefixRef.value} style={createTipsStyle()}>
            <span
              class={`${prefixRef.value}-title`}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                fontSize: 12,
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
  }),
)

export const DashedBox = composeExport(
  observer(
    defineComponent({
      name: 'DashedBox',
      setup() {
        const hoverRef = useHover()
        return () => {
          return (
            <>
              <DashBox key={hoverRef.value?.node?.id}></DashBox>
            </>
          )
        }
      },
    }),
  ),
  { displayName: 'DashedBox' },
)
