import { JsEditor as _JsEditor } from '@tap/component'

export const JsEditor = {
  props: {
    value: String,
    height: {
      type: [String, Number],
      default: 200
    },
    options: {
      type: Object,
      default: () => ({})
    }
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
      ...this.options
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
}

export default JsEditor
