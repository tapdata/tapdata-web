import { observer } from '@formily/reactive-vue'
import { IconWidget } from '../IconWidget'
import { useDesigner, usePrefix } from '../../../hooks'
import { ElButton as Button } from 'element-plus'
import { defineComponent } from 'vue'

export const DragHandler = observer(
  defineComponent({
    props: ['node'],
    setup: props => {
      const designer = useDesigner()
      const prefix = usePrefix('aux-drag-handler')

      return () => {
        if (props.node === props.node.root || !props.node.allowDrag()) return null
        const handlerProps = {
          [designer.value.props.nodeDragHandlerAttrName]: 'true'
        }
        return (
          <Button attrs={handlerProps} class={prefix} type="primary">
            <IconWidget infer="Move" />
          </Button>
        )
      }
    }
  })
)
