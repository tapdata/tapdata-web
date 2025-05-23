import { PreviewText } from '@formily/element-plus'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { transformComponent } from '../../shared'
import InfiniteSelect from './InfiniteSelect.vue'

const AsyncSelect = InfiniteSelect

const TransformAsyncSelect = transformComponent(AsyncSelect, {
  change: 'update:modelValue',
})

// ⚠️被connect包裹了一层，里面的defineExpose会访问不到
// 可以使用 getInnerRef() 获取暴露的属性
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
