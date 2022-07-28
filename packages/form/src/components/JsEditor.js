import { JsEditor as _JsEditor } from '@tap/component'
import { connect, mapProps } from '@formily/vue'

export const JsEditor = connect(
  {
    props: {
      value: String,
      height: {
        type: [String, Number],
        default: 200
      },
      options: {
        type: Object,
        default: () => ({})
      },
      disabled: Boolean
    },

    methods: {
      onBlur(val) {
        if (val !== this.value) {
          this.$emit('change', val)
        }
      }
    },

    render() {
      const options = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        ...this.options,
        readOnly: this.disabled
      }
      return (
        <_JsEditor
          class="border rounded-2"
          value={this.value}
          lang="javascript"
          height={this.height}
          onBlur={this.onBlur}
          options={options}
        />
      )
    }
  },
  mapProps({ disabled: true })
)

export default JsEditor
