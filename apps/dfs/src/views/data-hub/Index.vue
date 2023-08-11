<template>
  <div v-loading="loading" element-loading-background="#fff" class="h-100">
    <div
      v-if="hasMDB && creating"
      class="text-center h-100 bg-white rounded-lg flex justify-center align-center flex-column"
    >
      <ElImage style="width: 200px; height: 200px" :src="require('@tap/assets/images/empty_waiting.png')"></ElImage>
      <div class="my-6">{{ $t('dfs_wait_storage_init') }}</div>
      <div>
        <ElButton @click="handleRefresh" type="primary" plain>{{ $t('public_button_refresh') }}</ElButton>
      </div>
    </div>
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
      loading: true,
      creating: true
    }
  },

  async created() {
    this.loading = true
    await this.loadMdbCount()

    if (this.hasMDB) {
      await this.loadMDBStatus()
    }

    this.loading = false
  },

  beforeDestroy() {
    clearTimeout(this.timer)
  },

  methods: {
    async loadMdbCount() {
      this.loading = true
      const { totalCount } = await this.$axios.get('api/tcm/mdb/stats')
      this.hasMDB = totalCount > 0
    },

    async loadMDBStatus() {
      clearTimeout(this.timer)
      const { items } = await this.$axios.get('api/tcm/mdb')
      this.creating = items.some(item => item.status === 'Creating')

      if (this.creating) {
        this.timer = setTimeout(() => {
          this.loadMDBStatus()
        }, 10000)
      }
    },

    async handleRefresh() {
      this.$message.success(this.$t('public_message_operation_success'))
      await this.loadMDBStatus()
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
