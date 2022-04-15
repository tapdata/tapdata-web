<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.$root.checkAgent = this.checkAgent
  },
  methods: {
    checkAgent(cb) {
      this.$api('Workers')
        .getAvailableAgent()
        .then(res => {
          if (!res?.data?.result?.length) {
            this.$message.error(this.$t('agent_check_error'))
          } else {
            cb && cb()
          }
        })
    }
  }
}
</script>
<style lang="scss">
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.container-header {
  padding: 15px 20px;
  background: #fff;
  font-size: 16px;
  border-bottom: 1px solid #dedee4;
  box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
}
</style>
