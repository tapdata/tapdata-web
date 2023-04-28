<template>
  <div class="markdown-body-wrap git-book">
    <div class="markdown-body" v-html="html"></div>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it'

export default {
  name: 'GitBook',
  props: {
    value: {
      type: [String, Blob],
      require: true
    }
  },
  data() {
    return {
      html: ''
    }
  },
  watch: {
    value(v1, v2) {
      if (v1 !== v2) {
        this.init()
      }
    }
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
        const md = new MarkdownIt({ html: true })
        // a标签，新窗口打开
        this.html = md.render(reader.result).replace(/<a href=/g, `<a target="_blank" href=`)
      }
    }
  }
}
</script>

<style lang="scss">
.git-book {
  padding: 10px 20px;
  overflow-y: auto;
  background-color: rgba(250, 250, 250, 100);
  border: 1px solid rgba(222, 222, 228, 100);
  border-top: none;
}

.markdown-body-wrap {
  .markdown-body {
    h2 {
      font-size: 18px;
    }
    h3 {
      font-size: 16px;
    }
    h4 {
      font-size: 15px;
    }
    h5 {
      font-size: 14px;
    }
    p {
      font-size: 14px;
      line-height: 22px;
    }
    ul,
    ol,
    li {
      font-size: 14px;
    }
    blockquote {
      margin: 0 0 20px;
      padding: 10px 20px;
      p {
        margin: 0 0 10px;
      }
      p:last-child,
      ul:last-child,
      ol:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
