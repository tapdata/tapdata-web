import { clusterApi } from '@tap/api'

export default {
  data() {
    const $t = this.$t.bind(this)
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      agentMap: null,
      agentStatusLabel: {
        // daas 引擎
        running: $t('cluster_running'),
        stopped: $t('cluster_stopped'),
        // dfs agent 管理
        Creating: $t('public_agent_status_to_be_deployed'),
        Running: $t('public_status_running'),
        Stopping: $t('public_status_stopping'),
        Stopped: $t('public_agent_status_offline')
      }
    }
  },

  created() {
    this.loop(this.isDaas ? this.getClusterStatus : this.getAgentStatus, 30000)
  },

  destroyed() {
    this.isDestroyed = true
    clearTimeout(this.syncTaskAgentTimer)
  },

  methods: {
    async getClusterStatus() {
      const { items = [] } = await clusterApi.get()
      const map = items.reduce((res, item) => {
        res[item.systemInfo['process_id']] = {
          status: this.agentStatusLabel[item.status] || '-',
          name: item.systemInfo.hostname,
          itemId: item.id
        }
        return res
      }, {})
      console.log('result', items, map) // eslint-disable-line
      this.agentMap = map
    },

    async getAgentStatus() {
      const { items = [] } = await this.$axios.get(
        'api/tcm/agent?filter=' +
          encodeURIComponent(
            JSON.stringify({
              size: 10000,
              page: 1
            })
          )
      )

      const map = items.reduce((res, item) => {
        res[item.tmInfo.agentId] = {
          status: this.agentStatusLabel[item.status] || '-',
          name: item.name,
          itemId: item.id
        }
        return res
      }, {})

      this.agentMap = map
    },

    async loop(callback, timeout) {
      await callback()

      if (this.syncTaskAgentTimer) {
        clearTimeout(this.syncTaskAgentTimer)
        this.syncTaskAgentTimer = null
      }
      if (this.isDestroyed) return

      this.syncTaskAgentTimer = setTimeout(() => {
        this.loop(callback, timeout)
      }, timeout)
    }
  }
}
