<template>
  <div v-loading="loading" element-loading-background="#fff" class="h-100">
    <div
      v-if="hasMDB && !hasActive"
      class="text-center h-100 bg-white rounded-lg flex justify-center align-center flex-column"
    >
      <ElImage style="width: 200px; height: 200px" :src="require('@tap/assets/images/empty_waiting.png')"></ElImage>
      <div class="my-6">{{ $t('dfs_wait_storage_init') }}</div>
      <div>
        <ElButton @click="handleRefresh" type="primary" plain>{{ $t('public_button_refresh') }}</ElButton>
      </div>
    </div>
    <Dashboard v-else-if="hasMDB"></Dashboard>
    <Intro v-else-if="!loading"></Intro>
  </div>
</template>

<script>
import { Dashboard } from '@tap/ldp'
import Intro from './Intro'
import { liveDataPlatformApi } from '@tap/api'

export default {
  name: 'DataHub',

  components: { Intro, Dashboard },

  data() {
    return {
      hasMDB: false,
      hasActive: false,
      loading: true,
      paying: true,
    }
  },

  computed: {
    onlyIntro() {
      return false
      // return !this.$store.state.config.pagePermissions?.includes('dataHub')
    }
  },

  async created() {
    if (this.onlyIntro) {
      this.loading = false
      return
    }

    this.loading = true

    const setting = await liveDataPlatformApi.findOne()

    if (setting?.fdmStorageCluster === 'self' && setting?.fdmStorageConnectionId) {
      this.hasMDB = true
      this.hasActive = true
    } else {
      await this.loadMdbCount()

      if (this.hasMDB) {
        await this.loadMDBStatus()
      } else {
        await this.loadMdbSubscribeCount()
      }
    }

    this.loading = false
  },

  beforeUnmount() {
    clearTimeout(this.timer)
  },

  methods: {
    async loadMdbCount() {
      this.loading = true
      const { totalCount } = await this.$axios.get('api/tcm/mdb/stats')
      this.hasMDB = totalCount > 0

      if (!this.hasMDB) {
        await this.loadMdbSubscribeCount()
      }
    },

    async loadMdbSubscribeCount() {
      const data = await this.$axios.get(
        `api/tcm/subscribe?filter=${encodeURIComponent(
          JSON.stringify({
            where: {
              status: {
                $in: ['incomplete', 'active'],
              },
              'subscribeItems.productType': 'MongoDB',
            },
          }),
        )}`,
      )

      if (data?.total) {
        this.hasMDB = true
      }
    },

    async loadMDBStatus() {
      clearTimeout(this.timer)
      const { items } = await this.$axios.get('api/tcm/mdb')
      this.hasActive = items.some((item) => item.status === 'Activated')

      if (!this.hasActive) {
        this.timer = setTimeout(() => {
          this.loadMDBStatus()
        }, 10000)
      }
    },

    async handleRefresh() {
      this.$message.success(this.$t('public_message_operation_success'))
      await this.loadMDBStatus()
    },
  },
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
