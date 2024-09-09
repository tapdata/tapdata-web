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
import { driver } from 'driver.js'
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
    // this.initMenuTour()
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

      this.$nextTick(() => {
        this.initMenuTour()
      })
    },

    waitForElement(selector, callback) {
      const observer = new MutationObserver((mutationsList, observer) => {
        if (document.querySelector(selector)) {
          observer.disconnect()
          callback()
        }
      })

      observer.observe(document.body, { childList: true, subtree: true })
    },

    initMenuTour() {
      const steps = [
        {
          element: '#menu-Instance',
          popover: {
            showButtons: ['next', 'previous'],
            description: `在这里可以订阅半托管引擎部署在您本地，<a href="https://docs.tapdata.net/quick-start/install/install-tapdata-agent/agent-on-selfhosted" target="_blank">详细了解半托管引擎</a>`
          }
        },
        {
          element: '#menu-connections',
          popover: {
            showButtons: ['next', 'previous'],
            description: '在这里可以管理和添加您的数据源/目标库'
          }
        },
        {
          element: '#task-list-create',
          popover: {
            showButtons: ['next', 'previous'],
            description: '点击这个可以尝试创建更高级的复制同步任务。'
          }
        }
      ]

      const targetElement = document.querySelector(steps[0].element)

      this.menuTour = driver({
        allowClose: false,
        allowKeyboardControl: false,
        disableActiveInteraction: true,
        showProgress: true,
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        doneBtnText: '我知道啦',
        steps,
        popoverClass: 'menu-tour-popover p-4 rounded-lg',
        onPopoverRender: (popover, { config, state }) => {},
        onHighlightStarted: (element, step, { state }) => {}
      })

      if (targetElement) {
        this.startMenuTour()
      } else {
        this.waitForElement(steps[0].element, () => {
          setTimeout(() => {
            this.startMenuTour()
          }, 500)
        })
      }
    },

    async startMenuTour() {
      if (this.$route.name !== 'migrateList') {
        await this.$router.push({ name: 'migrateList' })
      }
      this.menuTour.drive(0)
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
