import { PreviewText } from '@formily/element-plus'
import { transformComponent } from '@formily/element-plus/esm/__builtins__'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import InfiniteSelect from './InfiniteSelect.vue'

const AsyncSelect = InfiniteSelect

const TransformAsyncSelect = transformComponent(AsyncSelect, {
  change: 'update:modelValue',
})

const InnerAsyncSelect = connect(
  TransformAsyncSelect,
  mapProps({
    value: 'modelValue',
    readOnly: 'readonly',
  }),
  mapReadPretty(PreviewText.Input),
)

export { InnerAsyncSelect as AsyncSelect }

export { InfiniteSelect }
