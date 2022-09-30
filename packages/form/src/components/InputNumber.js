import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { getComponentByTag } from './utils'
import PreviewText from './preview-text'

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
  }),
  mapReadPretty(PreviewText.Input)
)
