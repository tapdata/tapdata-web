<template>
  <div v-loading="loading" element-loading-background="#fff" class="h-100">
    <Dashboard v-if="hasMDB"></Dashboard>
    <Intro v-else-if="!loading"></Intro>
  </div>
</template>

<script>
import { Dashboard } from '@tap/ldp'
import Intro from './Intro'

export default {
  name: 'DataHub',

  components: { Intro, Dashboard },

  data() {
    return {
      hasMDB: false,
      loading: true
    }
  },

  created() {
    this.loadMdbCount()
  },

  methods: {
    loadMdbCount() {
      this.loading = true
      this.$axios
        .get('api/tcm/mdb/stats')
        .then(data => {
          this.hasMDB = data?.totalCount > 0
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.img-sm {
  width: 48px;
  height: 48px;
}

.step-icon {
  width: 32px;
  height: 32px;
  line-height: 32px;
  background: #eef6ff;
}
</style>
