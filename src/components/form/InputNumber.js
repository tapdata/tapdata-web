import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElInputNumber = getComponentByTag('el-input-number', {
  change: 'input'
})

export const InputNumber = connect(
  ElInputNumber,
  mapProps({ readOnly: 'readonly' }, props => {
    let controlsPosition = 'right'
    if (props.controlsPosition) {
      controlsPosition = props.controlsPosition
    }
    return {
      controlsPosition
    }
  })
)
