export const titleChange = {
  methods: {
    /**
     * 修改标签页标题
     *
     * @param dataflow 名称
     * @param status 状态
     */
    $titleSet(dataflow, status) {
      let icon = '⚠️'
      if (status === 'EXECUTING') {
        icon = '🔄'
      } else if (status === 'IDLE') {
        icon = '▶️'
      }

      window.document.title = `Tapdata - ${icon} ${dataflow}`
    },

    $titleReset() {
      document.title = this.$route.meta.title
    },
  },
}
