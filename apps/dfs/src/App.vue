<template>
  <div id="app" :class="[$route.name]">
    <RouterView />

    <ReplicationTour
      :value="showReplicationTour"
      @input="setShowReplicationTour"
      :finish="replicationTourFinish"
      @start="handleStartTour"
      @finish="handleFinishTour"
    ></ReplicationTour>
  </div>
</template>

<script>
import ReplicationTour from '@/components/ReplicationTour'
import { buried } from '@/plugins/buried'
import { mapMutations, mapState } from 'vuex'
import { provide } from '@vue/composition-api'
export default {
  name: 'app',
  provide: {
    async checkAgent(callback) {
      let data = await this.$axios.get('api/tcm/agent/agentCount')
      if (data.agentRunningCount || data.agentRunningCount > 0) {
        callback?.()
      } else {
        this.$message.error(this.$t('agent_error_check'))
        throw new Error(this.$t('agent_error_check'))
      }
    },
    buried,
    lockedFeature: {},
    openLocked: () => {}
  },
  components: { ReplicationTour },
  computed: {
    ...mapState(['showReplicationTour', 'replicationTourFinish'])
  },
  mounted() {
    const unwatch = this.$watch('$route', () => {
      unwatch()
      this.$nextTick(async () => {
        if (this.$route.query?.tour) {
          const guide = await this.$axios.get('api/tcm/user_guide')
          // 查询是否有查看监控的行为
          const behavior = guide?.tour?.behavior
          if (behavior && behavior !== 'view-monitor') {
            this.openCompleteReplicationTour()
            this.$axios.post('api/tcm/user_guide', {
              tour: {
                ...guide.tour,
                behavior: 'view-monitor',
                behaviorAt: Date.now()
              }
            })
          }
        }
      })
    })
  },
  methods: {
    ...mapMutations(['setShowReplicationTour', 'startTour', 'openCompleteReplicationTour']),

    async handleStartTour() {
      this.setShowReplicationTour(false)
      await this.$router.push({ name: 'migrateList' })
      this.startTour()
    },
    handleFinishTour() {
      this.setShowReplicationTour(false)
    }
  }
}
</script>

<style lang="scss">
#app {
  position: relative;
  height: 100%;
  min-width: 1440px;
  font-size: 14px;
}
.second-line .el-radio-button__inner {
  margin-top: 10px;
  border-left: 1px solid #dcdfe6;
}
.second-line + .second-line {
  .el-radio-button__inner {
    border-left: 0;
  }
}
</style>
