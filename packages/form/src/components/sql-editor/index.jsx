import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { defineComponent } from 'vue'

export const SqlEditor = defineComponent({
  props: {
    value: String,
    height: {
      type: [String, Number],
      default: 200,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    disabled: Boolean,
  },

  setup(props, { emit, attrs }) {
    const onBlur = (val) => {
      if (val !== props.value) {
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
          value={props.value}
          lang="sql"
          height={props.height}
          onBlur={onBlur}
          options={options}
          {...attrs}
        />
      )
    }
  },
})
