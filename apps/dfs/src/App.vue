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
    this.initMenuTour()
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
            description: `${this.$t(
              'menu_tour_instance'
            )}，<a href="https://docs.tapdata.net/quick-start/install/install-tapdata-agent/agent-on-selfhosted" target="_blank">${this.$t(
              'menu_tour_instance_link'
            )}</a>`
          }
        },
        {
          element: '#menu-connections',
          popover: {
            showButtons: ['next', 'previous'],
            description: this.$t('menu_tour_connection')
          }
        },
        {
          element: '#task-list-create',
          popover: {
            showButtons: ['next', 'previous'],
            description: this.$t('menu_tour_create_task')
          }
        }
      ]

      const targetElement = document.querySelector(steps[0].element)

      this.menuTour = driver({
        overlayOpacity: 0.5,
        allowClose: false,
        allowKeyboardControl: false,
        disableActiveInteraction: true,
        showProgress: true,
        prevBtnText: this.$t('public_button_previous'),
        nextBtnText: this.$t('public_button_next'),
        doneBtnText: this.$t('public_button_understand'),
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
