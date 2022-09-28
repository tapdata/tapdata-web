import { JsEditor as _JsEditor } from '@tap/component'
import { connect, mapProps } from '@formily/vue'
import { HighlightCode } from '../highlight-code'
import './style.scss'

export const JsEditor = connect(
  {
    props: {
      value: String,
      before: {
        type: String,
        default: ''
      },
      beforeRegexp: String,
      after: {
        type: String,
        default: ''
      },
      afterRegexp: String,
      height: {
        type: [String, Number],
        default: 200
      },
      options: {
        type: Object,
        default: () => ({})
      },
      disabled: Boolean,
      includeBeforeAndAfter: Boolean,
      handleAddCompleter: Function
    },

    computed: {
      code() {
        if (this.includeBeforeAndAfter) {
          return this.value
            .replace(new RegExp(this.beforeRegexp || this.before), '')
            .replace(new RegExp(this.afterRegexp || this.before), '')
        }
        return this.value
      }
    },

    methods: {
      onBlur(val) {
        if (val !== this.code) {
          if (this.includeBeforeAndAfter) {
            val = `${this.before}${val}${this.after}`
          }
          this.$emit('change', val)
        }
      },

      onInit(editor, tools) {
        if (this.handleAddCompleter && typeof this.handleAddCompleter === 'function') {
          this.handleAddCompleter(editor, tools)
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
        <div
          class="form-js-editor-wrap flex flex-column border rounded-2 overflow-hidden"
          style={{ height: this.height + 'px' }}
        >
          <div class="code-before">
            <HighlightCode class="m-0" code={this.before} />
          </div>
          <_JsEditor
            class="form-js-editor py-0 flex-1 min-h-0"
            theme="chrome"
            value={this.code}
            lang="javascript"
            onBlur={this.onBlur}
            onInitOptions={this.onInit}
            options={options}
          />
          <div class="code-after">
            <HighlightCode class="m-0" code={this.after} />
          </div>
        </div>
      ) : (
        <_JsEditor
          class="border rounded-2 py-0"
          style={{
            background: '#fff'
          }}
          theme="chrome"
          value={this.code}
          lang="javascript"
          height={this.height}
          onBlur={this.onBlur}
          onInit={this.onInit}
          options={options}
        />
      )
    }
  },
  mapProps({ disabled: true })
)

export default JsEditor
