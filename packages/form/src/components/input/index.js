import { Input as _Input } from '@formily/element'
import { defineComponent } from '@vue/composition-api'

export const Input = defineComponent({
  props: {
    // 默认去空格
    trim: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { attrs, listeners }) {
    return () => {
      const { value } = attrs
      return (
        <_Input
          attrs={{ ...attrs }}
          on={{
            ...listeners,
            change: val => {
              if (props.trim) {
                val = val.trim()
              }
              listeners.change(val)
            }
          }}
        />
      )
    }
  }
})

Input.TextArea = _Input.TextArea
