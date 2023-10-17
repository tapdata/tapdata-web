import { transformComponent } from '@formily/element-plus/lib/__builtins__/shared'
import { connect, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element-plus'
import { ElSlider } from 'element-plus'

const TransformElSlider = transformComponent(ElSlider, {
  change: 'input'
})

export const Slider = connect(TransformElSlider, mapReadPretty(PreviewText.Input))

export default Slider
