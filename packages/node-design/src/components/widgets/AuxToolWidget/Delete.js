import { IconWidget } from '../IconWidget'
import { useOperation, usePrefix } from '../../../hooks'
import { Button } from 'element-ui'
import { defineComponent } from 'vue-demi'

export const Delete = defineComponent({
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
            operationRef.value.removeNodes([node])
          }}
        >
          <IconWidget infer="Remove" />
        </Button>
      )
    }
  }
})
