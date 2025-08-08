import { composeExport } from '@tap/form/src/shared'
import { defineComponent } from 'vue'
import { useOperation, usePrefix } from '../../../hooks'
import { IconWidget } from '../IconWidget'

const DeleteComponent = defineComponent({
  props: ['node'],
  setup(props) {
    const operationRef = useOperation()
    const prefixRef = usePrefix('aux-copy')
    return () => {
      if (props.node === props.node.root) return null
      return (
        <button
          class={prefixRef.value}
          onClick={() => {
            operationRef.value.removeNodes([props.node])
          }}
        >
          <IconWidget infer="Remove" />
        </button>
      )
    }
  },
})
export const Delete = composeExport(DeleteComponent, { displayName: 'Delete' })
