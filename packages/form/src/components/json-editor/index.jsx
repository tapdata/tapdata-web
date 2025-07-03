import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { computed, defineComponent } from 'vue'

export const JsonEditor = defineComponent({
  props: {
    type: {
      type: String,
      default: 'string', // object
    },
    value: [String, Object, Array],
    height: {
      type: [String, Number],
      default: 200,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    disabled: Boolean,
    needFormat: Boolean,
  },

  setup(props, { emit, attrs }) {
    const editorVal = computed(() => {
      return props.type === 'object'
        ? JSON.stringify(props.value, null, props.needFormat ? 2 : 0)
        : props.value
    })
    const onBlur = (val) => {
      if (val !== editorVal.value) {
        try {
          if (val && props.type === 'object') val = JSON.parse(val)
        } catch (error) {
          console.error(error)
        }
        emit('change', val)
      }
    }

    return () => {
      const options = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        ...props.options,
        readOnly: props.disabled,
      }
      return (
        <VCodeEditor
          class="border rounded-xl p-0"
          theme="chrome"
          value={editorVal.value}
          lang="json"
          height={props.height}
          onBlur={onBlur}
          options={options}
          {...attrs}
        />
      )
    }
  },
})

export default JsonEditor
