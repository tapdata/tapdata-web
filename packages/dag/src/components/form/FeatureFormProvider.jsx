import { defineComponent } from 'vue'
import { FormProvider } from '@formily/vue'

// 定义需要 feature 控制的配置路径及其对应的 feature code
const FEATURE_CONTROLS = {
  fullBreakpointResume: 'resume',
  shareCache: 'tabs.advancedTab.sourceCollapse.sharedCache'
}

export const FeatureFormProvider = defineComponent({
  name: 'FeatureFormProvider',
  props: ['form'],

  setup(props, { slots, root }) {
    const setupFeatureControls = () => {
      const isControlEnabled = root.$store.getters['feature/isControlEnabled']
      const hasFeature = root.$store.getters['feature/hasFeature']

      // 只在 LITE 版本下进行控制
      if (!isControlEnabled) return

      Object.entries(FEATURE_CONTROLS).forEach(([feature, path]) => {
        const isEnabled = hasFeature(feature)

        if (!isEnabled) {
          props.form.setFieldState(path, state => {
            console.log('state', state)
            // 保存原有的 display 状态
            const originalDisplay = state.display

            // 设置一个观察函数来保持对原有 reactions 的响应
            state.display = state => {
              // 如果功能被禁用，始终返回 hidden
              if (!isEnabled) return 'hidden'
              // 否则返回原有的 display 值（可能是字符串或函数）
              return typeof originalDisplay === 'function' ? originalDisplay(state) : originalDisplay
            }
          })
        }
      })
    }

    setupFeatureControls()

    return () => <FormProvider form={props.form}>{slots.default?.()}</FormProvider>
  }
})
