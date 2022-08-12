import { JsEditor as _JsEditor } from '@tap/component'
import { connect, mapProps } from '@formily/vue'
import { HighlightCode } from './highlight-code'

export const JsEditor = connect(
  {
    props: {
      value: String,
      before: String,
      after: String,
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
      return this.before || this.after ? (
        <div class="code-editor border rounded-2 overflow-hidden">
          <div class="code-before">
            <HighlightCode class="m-0" code={this.before} />
          </div>
          <_JsEditor
            class="border rounded-2 py-0"
            style={{
              background: '#fff'
            }}
            theme="chrome"
            value={this.value}
            lang="javascript"
            height={this.height}
            onBlur={this.onBlur}
            options={options}
          />
          <div class="code-after">
            <HighlightCode code={this.after} />
          </div>
        </div>
      ) : (
        <_JsEditor
          class="border rounded-2"
          style={{
            background: '#fff'
          }}
          theme="chrome"
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
