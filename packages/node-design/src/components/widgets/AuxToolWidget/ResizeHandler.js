import { FragmentComponent } from '@formily/vue'
import { useDesigner, usePrefix } from '../../../hooks'
import { defineComponent } from 'vue'

export const ResizeHandler = defineComponent({
  props: ['node'],
  setup: props => {
    const designerRef = useDesigner()
    const designer = designerRef.value
    const prefix = usePrefix('aux-node-resize-handler')
    const createHandler = value => {
      return {
        attrs: { [designer.props.nodeResizeHandlerAttrName]: value },
        class: [prefix, value]
      }
    }
    const allowResize = props.node.allowResize()
    return () => {
      if (!allowResize) return null
      const allowX = allowResize.includes('x')
      const allowY = allowResize.includes('y')
      return (
        <FragmentComponent>
          {allowX && <div {...createHandler('x-start')}></div>}
          {allowX && <div {...createHandler('x-end')}></div>}
          {allowY && <div {...createHandler('y-start')}></div>}
          {allowY && <div {...createHandler('y-end')}></div>}
        </FragmentComponent>
      )
    }
  }
})
