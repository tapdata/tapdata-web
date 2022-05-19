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

  data() {
    return {
      sql: this.value
    }
  },

  watch: {
    value(v) {
      this.sql = v
    }
  },

  methods: {
    onInput(v) {
      this.sql = v
      this.$emit('input', v)
      this.$emit('change', v)
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
        value={this.sql}
        lang="javascript"
        height={this.height}
        onInput={this.onInput}
        options={options}
      />
    )
  }
}

export default JsEditor
