<script>
import ace from 'ace-builds'
import workerJavascriptUrl from 'ace-builds/src-noconflict/worker-javascript?url'
import workerJsonUrl from 'ace-builds/src-noconflict/worker-json?url'

import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/snippets/javascript'
import 'ace-builds/src-noconflict/snippets/json'
import 'ace-builds/src-noconflict/snippets/python'
import 'ace-builds/src-noconflict/snippets/sql'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/theme-one_dark'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/theme-sqlserver'
import 'ace-builds/src-noconflict/ext-beautify'

const WORKER = {
  javascript: workerJavascriptUrl,
  json: workerJsonUrl,
}

const ACTION_EVENTS = ['change', 'blur', 'focus', 'copy', 'paste', 'input']

export default {
  name: 'VCodeEditor',
  props: {
    value: {
      required: true,
    },
    lang: String,
    theme: {
      type: String,
      default: 'one_dark',
    },
    height: [String, Number],
    width: [String, Number],
    options: Object,
  },
  emits: ['init', 'initOptions', 'update:value', ...ACTION_EVENTS],
  data() {
    return {
      editor: null,
      contentBackup: '',
    }
  },
  watch: {
    value(val) {
      if (typeof val === 'object') {
        val = JSON.stringify(val)
      }
      if (this.contentBackup !== val) this.editor.setValue(val, 1)
    },
  },
  mounted() {
    const lang = this.lang || 'text'
    const theme = this.theme
    const editor = (this.editor = ace.edit(this.$el.firstElementChild))

    // ace.config.setModuleUrl('ace/ext/searchbox', extSearchboxUrl)
    // ace.config.setModuleUrl(`ace/mode/${lang}`, MAP[lang]?.[0])
    // ace.config.setModuleUrl(`ace/snippets/${lang}`, MAP[lang]?.[1])
    WORKER[lang] &&
      ace.config.setModuleUrl(`ace/mode/${lang}_worker`, WORKER[lang])

    const reqHandler = ace.require
    const tools = reqHandler('ace/ext/language_tools')
    const beautify = reqHandler('ace/ext/beautify') // get reference to extension

    this.$emit('init', editor, tools, beautify)

    editor.$blockScrolling = Infinity
    const session = editor.getSession()
    theme && editor.setTheme(`ace/theme/${theme}`)
    session.setMode(`ace/mode/${lang}`)
    session.setTabSize(2)

    const val =
      typeof this.value === 'object'
        ? JSON.stringify(this.value, null, 2)
        : this.value
    editor.setValue(val || '', 1)

    if (this.options) {
      session.setUseWrapMode(this.options.useWrapMode) // 自动换行
      editor.setOptions(this.options)
      this.$emit('initOptions', editor, tools, beautify)
    }

    editor.on('change', () => {
      const content = editor.getValue()
      this.$emit('update:value', content)
      this.contentBackup = content
    })

    ACTION_EVENTS.forEach((ev) => {
      editor.on(ev, (event, editor) => {
        this.$emit(ev, editor.getValue(), event, editor)
      })
    })
  },
  methods: {
    px(n) {
      if (/^\d*$/.test(n)) {
        return `${n}px`
      }
      return n
    },
  },
}
</script>

<template>
  <div
    :style="{
      height: height ? px(height) : '100%',
      width: width ? px(width) : '100%',
      padding: '12px 0',
      overflow: 'hidden',
      background: '#282c34',
    }"
  >
    <div
      :style="{
        height: '100%',
        width: '100%',
      }"
    />
  </div>
</template>
