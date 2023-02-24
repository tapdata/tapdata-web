import { transformComponent } from '@formily/element/lib/__builtins__/shared'
import { connect, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element'
import { Slider as ElSlider } from 'element-ui'

const TransformElSlider = transformComponent(ElSlider, {
  change: 'input'
})

export const Slider = connect(TransformElSlider, mapReadPretty(PreviewText.Input))

export default Slider
