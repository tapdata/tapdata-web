<template>
  <History :remoteMethod="search" @row-click="rowClickHandler"></History>
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
        this.$axios.get('tm/api/InspectResults/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios.get('tm/api/InspectResults?filter=' + encodeURIComponent(JSON.stringify(filter)))
      ]).then(data => {
        return data
      })
    },
    rowClickHandler(item) {
      let url = ''
      let id = item.id
      if (this.$route.name === 'VerifyHistory') {
        id = item.firstCheckId
      }
      let route = this.$router.resolve({
        name: 'VerifyResult',
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
