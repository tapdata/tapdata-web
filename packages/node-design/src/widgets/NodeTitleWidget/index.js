import { observer } from '@formily/reactive-vue'
import { Fragment, h as hFrag } from '@formily/vue'
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
      const node = takeNode()
      hFrag(
        Fragment,
        {},
        {
          default: () => node.getMessage('title') || node.componentName
        }
      )
    }
  })
)
