import { observer } from '@formily/reactive-vue'
import { FragmentComponent } from '@formily/vue'
import { defineComponent } from 'vue-demi'

export const NodeTitleWidget = observer(
  defineComponent({
    props: ['node'],
    setup: props => {
      const takeNode = () => {
        const node = props.node
        if (node.componentName === '$$ResourceNode$$') {
          return node.children[0]
        }
        return node
      }

      return () => {
        const node = takeNode()
        return <FragmentComponent>{node.getMessage('title') || node.componentName}</FragmentComponent>
      }
    }
  })
)
