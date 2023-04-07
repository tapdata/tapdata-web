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
      return (
        <_Input
          attrs={{ ...attrs }}
          on={{
            ...listeners,
            blur: ev => {
              let val = ev.target.value
              let newVal = val

              if (props.trim) {
                newVal = val?.trim()
              }
              if (newVal !== val) listeners.change(newVal)
            }
          }}
        />
      )
    }
  }
})

Input.TextArea = _Input.TextArea
