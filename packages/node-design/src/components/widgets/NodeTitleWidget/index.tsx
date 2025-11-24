import { observer } from '@formily/reactive-vue'
import { defineComponent, type PropType } from 'vue'
import type { TreeNode } from '@designable/core'

const NodeTitleWidgetComponent = defineComponent({
  name: 'DnNodeTitleWidget',
  props: {
    node: Object as PropType<TreeNode>,
  },
  setup(props) {
    const takeNode = () => {
      const node = props.node!
      if (node.componentName === '$$ResourceNode$$') {
        return node.children[0]
      }
      return node
    }

    return () => {
      const node = takeNode()
      return <>{node.getMessage('title') || node.componentName}</>
    }
  },
})
export const NodeTitleWidget = observer(NodeTitleWidgetComponent)
