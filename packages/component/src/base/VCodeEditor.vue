<template>
  <div
    :style="{
      height: height ? px(height) : '100%',
      width: width ? px(width) : '100%',
      padding: '12px 0',
      overflow: 'hidden',
      background: '#282c34'
    }"
  >
    <div
      :style="{
        height: '100%',
        width: '100%'
      }"
    ></div>
  </div>
</template>

<script>
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/theme-one_dark'
import 'ace-builds/src-noconflict/ext-beautify'

const ACTION_EVENTS = ['change', 'blur', 'focus', 'copy', 'paste', 'input']

export default {
  name: 'VCodeEditor',
  props: {
    value: {
      required: true
    },
    lang: String,
    theme: {
      type: String,
      default: 'one_dark'
    },
    height: [String, Number],
    width: [String, Number],
    options: Object
  },
  data() {
    return {
      editor: null,
      contentBackup: ''
    }
  },
  methods: {
    px(n) {
      if (/^\d*$/.test(n)) {
        return n + 'px'
      }
      return n
    }
  },
  watch: {
    value(val) {
      if (typeof val === 'object') {
        val = JSON.stringify(val)
      }
      if (this.contentBackup !== val) this.editor.setValue(val, 1)
    }
  },
  mounted() {
    let lang = this.lang || 'text'
    let theme = this.theme
    let editor = (this.editor = ace.edit(this.$el.firstElementChild))
    let tools = ace.require('ace/ext/language_tools')
    var beautify = ace.require('ace/ext/beautify') // get reference to extension
    ace.require('ace/ext/searchbox')
    this.$emit('init', editor, tools, beautify)

    editor.$blockScrolling = Infinity
    let session = editor.getSession()
    theme && editor.setTheme(`ace/theme/${theme}`)
    session.setMode(`ace/mode/${lang}`)
    session.setTabSize(2)

    let val = typeof this.value === 'object' ? JSON.stringify(this.value, null, 2) : this.value
    editor.setValue(val || '', 1)

    if (this.options) {
      session.setUseWrapMode(this.options.useWrapMode) // 自动换行
      editor.setOptions(this.options)
    }

    editor.on('change', () => {
      let content = editor.getValue()
      this.$emit('input', content)
      this.contentBackup = content
    })

    ACTION_EVENTS.forEach(ev => {
      editor.on(ev, (event, editor) => {
        this.$emit(ev, editor.getValue(), event, editor)
      })
    })
  }
}
</script>
