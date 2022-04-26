<template>
  <div
    :style="{
      height: height ? px(height) : '100%',
      width: width ? px(width) : '100%',
      padding: '12px 0',
      backgroundColor: '#F5F6F8',
      overflow: 'hidden'
    }"
  >
    <VCodeEditor
      :value="value"
      :theme="theme"
      :lang="lang"
      :width="width"
      :height="height"
      :options="_options"
      @init="init"
      @input="$emit('input', $event)"
    ></VCodeEditor>
    <div v-if="false" class="position-absolute w-100 h-100 flex flex-column">
      <div class="p-4" style="background: #fff">
        <VButton>返回</VButton>
      </div>
      <div class="flex flex-fill">
        <VCodeEditor
          :value="value"
          class="flex-fill"
          :lang="lang"
          :theme="theme"
          :options="_options"
          @init="init"
          @input="$emit('input', $event)"
        ></VCodeEditor>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodeEditor',
  props: {
    value: String,
    theme: {
      type: String,
      // default: 'one_dark'
      default: 'katzenmilch'
    },
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
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system')
      }
      this.$api('Javascript_functions')
        .get({
          filter: JSON.stringify({
            size: 0
          })
        })
        .then(res => {
          let items = res?.data?.items || []
          items.sort((a, b) => {
            let scoreMap = {
              custom: 0,
              jar: 1,
              system: 2
            }
            let aName = a.methodName || a.function_name
            let bName = b.methodName || b.function_name
            aName = aName.toLowerCase()
            bName = bName.toLowerCase()
            if (a.type !== b.type) {
              return scoreMap[a.type] - scoreMap[b.type]
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
          editor.completers = [
            {
              getCompletions: (editor, session, pos, prefix, callback) => {
                if (prefix.length === 0) {
                  return callback(null, [])
                } else {
                  return callback(
                    null,
                    items.map((item, index) => {
                      let methodName = item.methodName || item.function_name
                      return {
                        caption: methodName,
                        snippet: methodName + '(${1})',
                        meta: typeMapping[item.type],
                        type: 'snippet',
                        score: 1000000 - index,
                        format: item.format,
                        parametersDesc: item.parameters_desc,
                        returnDesc: item.return_value
                      }
                    })
                  )
                }
              },
              getDocTooltip: function (item) {
                if (item.type == 'snippet') {
                  let body = item.parametersDesc
                    ? `<pre class="code-editor-snippet-tips__body"><div class="panel-title">parameters description</div>${item.parametersDesc}</pre>`
                    : `<pre class="code-editor-snippet-tips__body">${item.format || item.caption}</pre>`
                  let footer = item.returnDesc
                    ? `<pre class="code-editor-snippet-tips__footer"><div class="panel-title">return description</div>${item.returnDesc}</pre>`
                    : ''
                  item.docHTML = `<div class="code-editor-snippet-tips"><div class="code-editor-snippet-tips__header"><span class="panel-title">function</span>${
                    item.format || item.caption
                  }</div>${body}${footer}</div>`
                }
              }
            }
          ]
        })
    }
  }
}
</script>
<style lang="scss">
.ace_tooltip.ace_doc-tooltip {
  background: rgba(221, 221, 221, 0.4);
  color: #c1c1c1;
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
  word-break: break-word;
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
  background-color: #f5f6f8;
  .ace_gutter {
    background-color: #f5f6f8;
    .ace_gutter-active-line {
      color: map-get($fontColor, light);
    }
  }
}
</style>
