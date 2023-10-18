import { useDesigner, usePrefix } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { defineComponent } from 'vue'

export const TranslateHandler = defineComponent({
  props: ['node'],
  setup: props => {
    const designerRef = useDesigner()
    const designer = designerRef.value
    const prefix = usePrefix('aux-node-translate-handler')
    const createHandler = value => {
      return {
        attrs: { [designer.props.nodeTranslateAttrName]: value },
        class: [prefix, value]
      }
    }
    return () => {
      const allowTranslate = props.node.allowTranslate()
      if (!allowTranslate) return null
      return (
        <div {...createHandler('translate')}>
          <IconWidget infer="FreeMove" />
        </div>
      )
    }
  }
})
