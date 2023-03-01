import { InputNumber as _InputNumber } from '@formily/element-plus'
import { defineComponent } from 'vue'

export const InputNumber = defineComponent({
  setup(props, { attrs, listeners }) {
    return () => {
      const { value } = attrs
      return (
        <_InputNumber
          attrs={{ ...attrs }}
          on={{
            ...listeners,
            change: val => {
              // 输入框首次渲染，如果是必填且没有值的时候会触发校验
              if (val !== undefined || value !== val) {
                listeners.change(val)
              }
            }
          }}
        />
      )
    }
  }
})
