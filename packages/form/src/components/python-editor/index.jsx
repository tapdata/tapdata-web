import { connect, mapProps } from '@formily/vue'
import { PythonEditor as _PythonEditor, VIcon } from '@tap/component'
import { HighlightCode } from '../highlight-code'
import './style.scss'

export const PythonEditor = connect(
  {
    emits: ['change', 'init'],
    props: {
      value: String,
      before: {
        type: String,
        default: '',
      },
      beforeRegexp: String,
      after: {
        type: String,
        default: '',
      },
      afterRegexp: String,
      height: {
        type: [String, Number],
        default: 200,
      },
      options: {
        type: Object,
        default: () => ({}),
      },
      disabled: Boolean,
      includeBeforeAndAfter: Boolean,
      handleAddCompleter: Function,
      theme: {
        type: String,
        default: 'chrome',
      },
      showFullscreen: Boolean,
      addTabInLine: Boolean,
    },

    data() {
      return {
        fullscreen: false,
      }
    },

    computed: {
      code() {
        if (this.includeBeforeAndAfter) {
          return this.value
            .replace(new RegExp(this.beforeRegexp || this.before), '')
            .replace(new RegExp(this.afterRegexp || this.before), '')
        }
        return this.value
      },
    },

    methods: {
      onFocus() {
        this.bindEvent()
      },
      onBlur(val) {
        if (val !== this.code) {
          if (this.includeBeforeAndAfter) {
            val = `${this.before}${val}${this.after}`
          }
          this.$emit('change', val)
        }
        this.unbindEvent()
      },

      onInit(editor, tools) {
        if (
          this.handleAddCompleter &&
          typeof this.handleAddCompleter === 'function'
        ) {
          this.handleAddCompleter(editor, tools)
        }
        this.$emit('init', editor)
      },

      // 防止写代码时，不小心返回或者关闭页面
      handleBeforeunload(ev) {
        ev.returnValue = ''
      },

      bindEvent() {
        window.addEventListener('beforeunload', this.handleBeforeunload)
      },

      unbindEvent() {
        window.removeEventListener('beforeunload', this.handleBeforeunload)
      },
    },

    render() {
      const options = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        ...this.options,
        readOnly: this.disabled,
      }
      return this.before || this.after ? (
        <div
          class={[
            'form-js-editor-wrap form-python-editor-wrap flex flex-column border rounded-4 overflow-hidden',
            { 'full-mode': this.fullscreen },
          ]}
          style={{ height: `${this.height}px` }}
        >
          {this.showFullscreen && (
            <div class="js-editor-toolbar flex align-center px-4">
              <div class="js-editor-toolbar-title flex-1">
                {this.$t('packages_form_js_processor_index_jiaoben')}
              </div>
              <ElLink
                onClick={() => {
                  this.fullscreen = !this.fullscreen
                  setTimeout(() => {
                    this.$refs.pythonEditor.editor.resize(true)
                  }, 10)
                }}
                class="js-editor-fullscreen"
                type="primary"
              >
                {this.fullscreen
                  ? [
                      <VIcon class="mr-1">suoxiao</VIcon>,
                      this.$t('packages_form_js_editor_exit_fullscreen'),
                    ]
                  : [
                      <VIcon class="mr-1">fangda</VIcon>,
                      this.$t('packages_form_js_editor_fullscreen'),
                    ]}
              </ElLink>
            </div>
          )}
          <div class="code-before">
            <HighlightCode class="m-0" code={this.before} />
          </div>
          <_PythonEditor
            ref="pythonEditor"
            class="form-js-editor py-0 flex-1 min-h-0"
            theme={this.theme}
            value={this.code}
            lang="python"
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onInitOptions={this.onInit}
            options={options}
          />
          <div class="code-after">
            <HighlightCode class="m-0" code={this.after} />
          </div>
        </div>
      ) : (
        <_PythonEditor
          ref="pythonEditor"
          class="border rounded-4 py-0 overflow-hidden"
          style={{
            background: '#fff',
          }}
          theme={this.theme}
          value={this.code}
          lang="python"
          height={this.height}
          onBlur={this.onBlur}
          onInit={this.onInit}
          options={options}
        />
      )
    },
  },
  mapProps({ disabled: true }),
)

export default PythonEditor
