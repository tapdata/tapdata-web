<template>
  <div class="markdown-body-wrap p-4">
    <div class="markdown-body" v-html="html"></div>
  </div>
</template>

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
      reader.onload = () => {
        // TODO: 代码高亮，复制按钮
        const md = new MarkdownIt({ html: true })
        // a标签，新窗口打开
        this.html = md
          .render(reader.result)
          .replace(/<a href=/g, `<a target="_blank" href=`)
      }
    },
  },
  emits: ['update:value'],
}
</script>
