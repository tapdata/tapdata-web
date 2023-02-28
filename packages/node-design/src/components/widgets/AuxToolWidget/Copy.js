import { useOperation, usePrefix } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { ElButton as Button } from 'element-plus'
import { defineComponent } from 'vue'

export const Copy = defineComponent({
  props: ['node'],
  setup: props => {
    const node = props.node
    const operationRef = useOperation()
    const prefix = usePrefix('aux-copy')
    return () => {
      if (node === node.root) return null
      return (
        <Button
          class={prefix}
          type="primary"
          onClick={() => {
            operationRef.value.cloneNodes([node])
          }}
        >
          <IconWidget infer="Clone" />
        </Button>
      )
    }
  }
})
