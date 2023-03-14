import { defineComponent, ref, watch } from '@vue/composition-api'
import { VCodeEditor } from '@tap/component'
import { useField } from '@formily/vue'

export const JsonEditor = defineComponent({
  props: {
    type: {
      type: String,
      default: 'string' // object
    },
    value: [String, Object, Array],
    height: {
      type: [String, Number],
      default: 200
    },
    options: {
      type: Object,
      default: () => ({})
    },
    disabled: Boolean,
    needFormat: Boolean
  },

  setup(props, { emit }) {
    const fieldRef = useField()
    const editorVal = ref(
      props.type === 'object' ? JSON.stringify(props.value, null, props.needFormat ? 2 : 0) : props.value
    )
    const onBlur = val => {
      if (val !== editorVal.value) {
        try {
          if (props.type === 'object') val = JSON.parse(val)
        } catch (e) {
          fieldRef.value.setFeedback({
            type: 'error',
            message: '格式错误'
          })
          console.error(e) // eslint-disable-line
        }
        emit('change', val)
      }
    }

    watch(
      () => props.value,
      v => {
        editorVal.value = v
      }
    )

    return () => {
      const options = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        ...props.options,
        readOnly: props.disabled
      }
      return (
        <VCodeEditor
          class="border rounded-2 p-0"
          theme="chrome"
          value={editorVal.value}
          lang="json"
          height={props.height}
          onBlur={onBlur}
          options={options}
        />
      )
    }
  }
})

export default JsonEditor
