<template>
  <div
    :style="{
      height: height ? px(height) : '100%',
      width: width ? px(width) : '100%'
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
      default: 'one_dark'
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
          fontSize: 18,
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
      tools.addCompleter({
        getCompletions: (editor, session, pos, prefix, callback) => {
          if (prefix.length === 0) {
            return callback(null, [])
          } else {
            return callback(null, [
              { name: 'abs', value: 'Math.abs', scope: 1, meta: 'Math' },
              {
                caption: 'replaceFieldName',
                snippet: 'replaceFieldName("${1}")',
                meta: 'replaceFieldName',
                type: 'snippet',
                scope: 1
              }
            ])
          }
        },
        getDocTooltip: function (item) {
          if (item.type == 'snippet' && !item.docHTML) {
            item.docHTML = ['<b>', item.caption, '</b>', '<hr></hr>', item.snippet].join('')
          }
        }
      })
    }
  }
}
</script>
