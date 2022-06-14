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
        const md = new MarkdownIt()
        this.html = md.render(reader.result)
      }
    }
  }
}
</script>

<style lang="scss">
.git-book {
  max-width: 550px;
  padding: 10px 20px;
  overflow-y: auto;
  background-color: rgba(250, 250, 250, 100);
  border: 1px solid rgba(222, 222, 228, 100);
  border-top: none;
}
</style>
