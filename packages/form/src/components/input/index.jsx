import { Input as _Input } from '@formily/element-plus'
import { defineComponent } from 'vue'

export const Input = defineComponent({
  props: {
    // 默认去空格
    trim: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs }) {
    return () => {
      return (
        <_Input
          {...{
            ...attrs,
            onBlur: (ev) => {
              const val = ev.target.value
              let newVal = val

              if (props.trim) {
                newVal = val?.trim()
              }
              if (newVal !== val) attrs.onChange(newVal)
            },
          }}
        />
      )
    }
  },
})

Input.TextArea = _Input.TextArea
