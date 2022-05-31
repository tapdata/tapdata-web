<template>
  <div v-if="htmlMD" class="markdown-body-wrap git-book">
    <div class="markdown-body" v-html="htmlMD"></div>
  </div>
</template>

<script>
export default {
  name: 'GitBook',
  props: {
    databaseType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      htmlMD: ''
    }
  },
  watch: {
    databaseType(v) {
      this.getHtmlMD(v)
    }
  },
  mounted() {
    this.getHtmlMD(this.databaseType)
  },
  methods: {
    getHtmlMD(type) {
      let locale = this.$i18n.locale || 'zh-CN'
      this.htmlMD = require(`@/assets/md/${locale}/connection/${type.toLowerCase()}.md`)
    }
  }
}
</script>

<style lang="scss">
.git-book {
  max-width: 500px;
  padding: 10px 20px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid rgba(222, 222, 228, 100);
  border-top: none;
}
.markdown-body-wrap .markdown-body {
  h2 {
    font-size: 18px;
    margin: 1em 0 15px;
    padding-top: 0.8em;
    padding-bottom: 0.8em;
  }
  h3 {
    font-size: 14px;
    margin: 22px 0 16px;
  }
  h4 {
    font-size: 13px;
    margin: 20px 0 16px;
  }
  h5 {
    font-size: 12px;
    margin: 16px 0 16px;
    font-weight: 700;
  }
  p {
    font-size: 12px;
    line-height: 24px;
    color: #666666;
    margin: 14px 0 14px;
  }
  pre {
    background-color: #eee;
    margin: 12px 0 12px;
    overflow: hidden;
    > code {
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
  blockquote {
    margin: 14px 0 14px;
    background-color: #eee;
    padding: 16px 16px;
  }
  tr {
    background-color: #f5f5f5;
  }
  code {
    background-color: #eee;
  }
  ul,
  ol,
  li {
    list-style: unset;
    font-size: 12px;
    line-height: 20px;
    color: #666666;
    margin: 8px 0;
  }
  blockquote {
    border-color: #409eff;
  }
  table {
    display: table;
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
  }
}
</style>
