<template>
  <History :remoteMethod="search" @row-click="rowClickHandler"></History>
</template>

<script>
import History from 'web-core/views/verification/History.vue'
export default {
  components: {
    History
  },
  methods: {
    search(filter) {
      if (filter?.where?.inspect_id?.regexp) {
        filter.where.inspect_id = filter.where.inspect_id.regexp.replace(/^\^(.*)\$$/, '$1')
      }
      if (filter?.where?.firstCheckId?.regexp) {
        filter.where.firstCheckId = filter.where.firstCheckId.regexp.replace(/^\^(.*)\$$/, '$1')
      }
      if (filter?.where?.parentId?.eq === null) {
        delete filter.where.parentId
      }
      return this.$axios
        .get('tm/api/InspectResults?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          return [{ count: data.total }, data.items]
        })
    },
    rowClickHandler(item) {
      let url = ''
      let id = item.id
      let routeName = 'VerifyResult'
      if (this.$route.name === 'VerifyDiffHistory') {
        routeName = 'VerifyDiffDetails'
      }
      let route = this.$router.resolve({
        name: routeName,
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
