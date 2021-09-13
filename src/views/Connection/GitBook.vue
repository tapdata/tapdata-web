<template>
  <div v-if="htmlMD" class="markdown-body-wrap git-book">
    <div class="markdown-body" v-html="htmlMD"></div>
  </div>
</template>

<script>
export default {
  name: 'GitBook',
  data() {
    return {
      htmlMD: ''
    }
  },
  mounted() {
    this.getHtmlMD(this.$route.query.databaseType)
  },
  methods: {
    getHtmlMD(type) {
      this.htmlMD = require(`@/assets/md/connection/${type.toLowerCase()}.md`)
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
    margin-top: 0px;
    margin: 8px 0;
    margin: 14px 0 14px;
  }
  pre {
    background-color: #eee;
    margin-bottom: 8px;
    margin-top: 8px;
    margin: 12px 0 12px;
  }
  blockquote {
    margin-bottom: 8px;
    margin-top: 8px;
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
    margin-top: 0px;
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
