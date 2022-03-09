import { useOperation, usePrefix } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { Button } from 'element-ui'
import { defineComponent } from 'vue-demi'

export const Copy = defineComponent({
  props: ['node'],
  setup: props => {
    const node = props.node
    const operation = useOperation()
    const prefix = usePrefix('aux-copy')
    return () => {
      if (node === node.root) return null
      return (
        <Button
          class={prefix}
          type="primary"
          onClick={() => {
            operation.cloneNodes([node])
          }}
        >
          <IconWidget infer="Clone" />
        </Button>
      )
    }
  }
})
