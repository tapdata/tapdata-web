<script>
import MarkdownIt from 'markdown-it'
import '@tap/assets/styles/github-markdown.css'

export default {
  name: 'GitBook',
  props: {
    value: {
      type: [String, Blob],
      require: true,
    },
  },
  emits: ['update:value'],
  data() {
    return {
      html: '',
    }
  },
  watch: {
    value(v1, v2) {
      if (v1 !== v2) {
        this.init()
      }
    },
  },
  mounted() {
    this.value && this.init()
  },
  methods: {
    init() {
      const v = this.value
      const reader = new FileReader()
      const blob = new Blob([v])
      reader.readAsText(blob, 'utf8')
      reader.addEventListener('load', () => {
        // TODO: 代码高亮，复制按钮
        const md = new MarkdownIt({ html: true })
        // a标签，新窗口打开
        this.html = md
          .render(reader.result)
          .replaceAll('<a href=', `<a target="_blank" href=`)
      })
    },
  },
}
</script>

<template>
  <div class="markdown-body-wrap">
    <div class="markdown-body" v-html="html" />
  </div>
</template>
