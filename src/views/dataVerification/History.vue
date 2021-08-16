<template>
  <History style="margin: 0" :remoteMethod="search" @row-click="rowClickHandler"></History>
</template>

<script>
import History from 'web-core/views/verification/history.vue'
export default {
  components: {
    History
  },
  methods: {
    search(filter, where) {
      return Promise.all([
        this.$api('InspectResults').count({
          where: JSON.stringify(where)
        }),
        this.$api('InspectResults').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        return [countRes.data, res.data]
      })
    },
    rowClickHandler(item) {
      let url = ''
      let id = item.id
      if (this.$route.name === 'dataVerifyHistory') {
        id = item.firstCheckId
      }
      let route = this.$router.resolve({
        name: 'dataVerifyResult',
        params: {
          id
        }
      })
      url = route.href
      window.open(url, '_blank')
    }
  }
}
</script>
