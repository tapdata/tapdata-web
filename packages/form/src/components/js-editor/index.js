import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import * as Vue from 'vue'
import { JsEditor as _JsEditor, VIcon } from '@tap/component'
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
      handleAddCompleter: Function,
      theme: {
        type: String,
        default: 'chrome'
      },
      showFullscreen: Boolean
    },

    data() {
      return {
        fullscreen: false
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
      }
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
          $emit(this, 'change', val)
        }
        this.unbindEvent()
      },

      onInit(editor, tools) {
        if (this.handleAddCompleter && typeof this.handleAddCompleter === 'function') {
          this.handleAddCompleter(editor, tools)
        }
        $emit(this, 'init', editor)
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
          staticClass="form-js-editor-wrap flex flex-column border rounded-2"
          class={this.fullscreen && 'full-mode'}
          style={{ height: this.height + 'px' }}
        >
          {this.showFullscreen && (
            <div class="js-editor-toolbar flex align-center px-4">
              <div class="js-editor-toolbar-title flex-1">{this.$t('packages_form_js_processor_index_jiaoben')}</div>
              <ElLink
                onClick={() => {
                  this.fullscreen = !this.fullscreen
                  setTimeout(() => {
                    this.$refs.jsEditor.editor.resize(true)
                  }, 10)
                }}
                class="js-editor-fullscreen"
                type="primary"
              >
                {this.fullscreen
                  ? [<VIcon class="mr-1">suoxiao</VIcon>, this.$t('packages_form_js_editor_exit_fullscreen')]
                  : [<VIcon class="mr-1">fangda</VIcon>, this.$t('packages_form_js_editor_fullscreen')]}
              </ElLink>
            </div>
          )}
          <div class="code-before">
            <HighlightCode class="m-0" code={this.before} />
          </div>
          <_JsEditor
            ref="jsEditor"
            class="form-js-editor py-0 flex-1 min-h-0"
            theme={this.theme}
            value={this.code}
            lang="javascript"
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
        <_JsEditor
          ref="jsEditor"
          class="border rounded-2 py-0"
          style={{
            background: '#fff'
          }}
          theme={this.theme}
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
