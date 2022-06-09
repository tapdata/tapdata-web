import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element'
import { InputNumber as ElInputNumber } from 'element-ui'

// 暂时不将input事件转换为change，避免必填时，没有value触发事件从而出现校验错误
/*const TransformElInputNumber = transformComponent<InputNumberProps>(
  ElInputNumber,
  {
    change: 'input',
  }
)*/

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

export default InputNumber
