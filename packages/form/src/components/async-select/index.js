import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { transformComponent } from '@formily/element-plus/esm/__builtins__'
import { PreviewText } from '@formily/element-plus'
import AsyncSelect from './AsyncSelect'

const TransformAsyncSelect = transformComponent(AsyncSelect, {
  change: 'update:modelValue'
})

const InnerAsyncSelect = connect(
  TransformAsyncSelect,
  mapProps({
    value: 'modelValue',
    readOnly: 'readonly'
  }),
  mapReadPretty(PreviewText.Input)
)

export { InnerAsyncSelect as AsyncSelect }

export default AsyncSelect
