import { Helpers } from './Helpers'
import { ResizeHandler } from './ResizeHandler'
import {
  useSelection,
  useValidNodeOffsetRect,
  useTree,
  useCursor,
  useDragon,
  usePrefix,
  useDesigner
} from '../../../hooks'
import { observer } from '@formily/reactive-vue'
import { FragmentComponent } from '@formily/vue'
import { TranslateHandler } from './TranslateHandler'
import { defineComponent } from 'vue'

export const SelectionBox = defineComponent({
  props: ['node', 'showHelpers'],
  setup(props) {
    const designer = useDesigner()
    const prefix = usePrefix('aux-selection-box')
    const innerPrefix = usePrefix('aux-selection-box-inner')
    const nodeRectRef = useValidNodeOffsetRect(props.node)
    return () => {
      const nodeRect = nodeRectRef.value
      const createSelectionStyle = () => {
        const baseStyle = {
          position: 'absolute',
          top: 0,
          left: 0,
          boxSizing: 'border-box'
        }
        if (nodeRect) {
          baseStyle.transform = `perspective(1px) translate3d(${nodeRect.x}px,${nodeRect.y}px,0)`
          baseStyle.height = nodeRect.height + 'px'
          baseStyle.width = nodeRect.width + 'px'
        }
        return baseStyle
      }

      if (!nodeRect) return null

      if (!nodeRect.width || !nodeRect.height) return null

      const selectionId = {
        [designer.value.props?.nodeSelectionIdAttrName]: props.node.id
      }

      return (
        <div attrs={selectionId} class={prefix} style={createSelectionStyle()}>
          <div class={innerPrefix}></div>
          <ResizeHandler node={props.node} />
          <TranslateHandler node={props.node} />
          {props.showHelpers && <Helpers props={props} node={props.node} nodeRect={nodeRect} />}
        </div>
      )
    }
  }
})

export const Selection = observer(
  defineComponent({
    setup() {
      const selectionRef = useSelection()
      const treeRef = useTree()
      const cursor = useCursor()
      const viewportDragonRef = useDragon()
      return () => {
        if (cursor.value.status !== 'NORMAL' && viewportDragonRef.value.touchNode) return null
        const selection = selectionRef.value
        return (
          <FragmentComponent>
            {selection.selected.map(id => {
              const node = treeRef.value.findById(id)
              if (!node) return
              if (node.hidden) return
              return <SelectionBox key={id} node={node} showHelpers={selection.selected.length === 1} />
            })}
          </FragmentComponent>
        )
      }
    }
  })
)
