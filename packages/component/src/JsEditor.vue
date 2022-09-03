<template>
  <VCodeEditor
    :value="value"
    :theme="theme"
    :lang="lang"
    :width="width"
    :height="height - 24"
    :options="_options"
    @init="init"
    v-on="$listeners"
  ></VCodeEditor>
</template>

<script>
import VCodeEditor from './base/VCodeEditor.vue'
import { functionApi, sharedCacheApi } from '@tap/api'
import { getCode } from '@tap/business'

export default {
  name: 'JsEditor',
  components: { VCodeEditor },
  props: {
    value: String,
    theme: String,
    lang: {
      type: String,
      default: 'javascript'
    },
    width: [String, Number],
    height: [String, Number],
    options: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      editor: null
    }
  },
  computed: {
    _options() {
      return Object.assign(
        {
          printMargin: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          fontSize: 12,
          wrap: true
        },
        this.options
      )
    }
  },
  methods: {
    px(n) {
      if (/^\d*$/.test(n)) {
        return n + 'px'
      }
      return n
    },
    format() {
      this.beautify.beautify(this.editor.session)
    },
    init(editor, tools, beautify) {
      this.editor = editor
      this.beautify = beautify
      let typeMapping = {
        custom: this.$t('packages_component_function_type_option_custom'),
        jar: this.$t('packages_component_function_type_option_jar'),
        system: this.$t('packages_component_function_type_option_system')
      }
      const formatCache = item => {
        return {
          caption: item.name,
          snippet: getCode(item)[0],
          type: 'snippet',
          meta: this.$t('packages_component_shared_cache')
        }
      }
      const formatFunction = item => {
        let methodName = item.methodName || item.function_name
        return {
          caption: methodName,
          snippet: methodName + '(${1})',
          meta: typeMapping[item.type],
          type: 'snippet',
          format: item.format,
          parametersDesc: item.parameters_desc,
          returnDesc: item.return_value,
          originType: item.type
        }
      }
      Promise.all([
        sharedCacheApi.get(),
        functionApi.get({
          filter: JSON.stringify({
            size: 0
          })
        })
      ]).then(([cacheData, functionData]) => {
        let cacheItems = cacheData?.items || []
        let functionItems = functionData?.items || []
        let items = cacheItems.map(formatCache).concat(functionItems.map(formatFunction))
        items.sort((a, b) => {
          let scoreMap = {
            custom: 0,
            jar: 1,
            system: 2
          }
          let aName = a.caption.toLowerCase()
          let bName = b.caption.toLowerCase()
          if (a.originType && b.originType && a.originType !== b.originType) {
            return scoreMap[a.originType] - scoreMap[b.originType]
          } else {
            if (aName < bName) {
              return -1
            }
            if (aName > bName) {
              return 1
            }
            return 0
          }
        })
        tools.addCompleter({
          getCompletions: (editor, session, pos, prefix, callback) => {
            if (prefix.length === 0) {
              return callback(null, [])
            } else {
              return callback(
                null,
                items.map((item, index) => {
                  item.score = 1000000 - index
                  return item
                })
              )
            }
          },
          getDocTooltip: function (item) {
            if (item.type == 'snippet') {
              let type = `<div class="code-editor-snippet-tips__type">${item.meta}</div>`
              let title = `<span class="panel-title">${item.originType ? 'function' : 'Cache name'}</span>`
              let body = item.parametersDesc
                ? `<pre class="code-editor-snippet-tips__body"><div class="panel-title">parameters description</div>${item.parametersDesc}</pre>`
                : item.originType
                ? `<pre class="code-editor-snippet-tips__body">${item.format || item.caption}</pre>`
                : `<pre class="code-editor-snippet-tips__body">${item.snippet}</pre>`
              let footer = item.returnDesc
                ? `<pre class="code-editor-snippet-tips__footer"><div class="panel-title">return description</div>${item.returnDesc}</pre>`
                : ''
              item.docHTML = `<div class="code-editor-snippet-tips">${type}<div class="code-editor-snippet-tips__header">${title}${
                item.format || item.caption
              }</div>${body}${footer}</div>`
            }
          }
        })
      })
    }
  }
}
</script>
<style lang="scss">
.ace_tooltip.ace_doc-tooltip {
  background: #fafafa;
  color: #333c4a;
}
.code-editor-snippet-tips {
  max-height: 400px;
  max-width: 500px;
  pre {
    margin: 0;
  }
  .panel-title {
    margin-right: 10px;
    color: #c678dd;
  }
}
.code-editor-snippet-tips__header {
  white-space: normal;
  word-break: break-all;
}
.code-editor-snippet-tips__type {
  color: #2c65ff;
  font-size: 14px;
}
.code-editor-snippet-tips__body,
.code-editor-snippet-tips__footer {
  padding: 10px 0;
  border-top: 1px solid #ccc;
  font-size: 12px;
  white-space: normal;
  word-break: break-word;
  .panel-title {
    margin-bottom: 6px;
  }
}
.ace-katzenmilch {
  background-color: #f7f8fa;
  .ace_gutter {
    background-color: #f7f8fa;
    .ace_gutter-active-line {
      color: #535f72;
    }
  }
}
</style>
