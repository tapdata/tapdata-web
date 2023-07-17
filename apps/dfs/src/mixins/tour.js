import i18n from '@/i18n'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { connectionsApi, taskApi } from '@tap/api'

export default {
  data() {
    return {
      showAlarmTour: false
    }
  },

  computed: {
    userId() {
      return this.$store.state.user.id
    }
  },

  created() {
    this.loopLoadAgentCount()
  },

  beforeRouteUpdate(to, from, next) {
    next()
    this.$nextTick(() => {
      this.beTouring = false
      const whiteList = ['connectionCreate']
      if (!whiteList.includes(to.name)) {
        this.initTour()
      }
    })
  },

  destroyed() {
    this.driverObj?.destroy()
    this.driverObj = null
  },

  methods: {
    loopLoadAgentCount() {
      return this.$axios
        .get('api/tcm/agent/agentCount')
        .then(data => {
          this.showAgentWarning = data.agentTotalCount && !data.agentRunningCount
          this.agentRunningCount = data.agentRunningCount
          window.__agentCount__ = data

          this.initTour()
        })
        .finally(() => {
          this.loopLoadAgentCountTimer = setTimeout(() => {
            this.loopLoadAgentCount()
          }, 10000)
        })
    },

    checkAgentCount() {
      return this.showAgentWarning
    },

    async getCount($in) {
      const { count } = await connectionsApi.count({
        where: JSON.stringify({
          connection_type: {
            $in
          }
        })
      })
      return count
    },

    async checkSourceCount() {
      const count = await this.getCount(['source', 'source_and_target'])
      return !count
    },

    async checkTargetCount() {
      const count = await this.getCount(['target', 'source_and_target'])

      if (!count) return true

      const total = await this.getCount(['source', 'target', 'source_and_target'])
      return total < 2
    },

    /**
     * 获取复制任务数量
     * @returns {Promise<*>}
     */
    async checkTaskCount() {
      const { count } = await taskApi.count({
        where: JSON.stringify({
          syncType: 'migrate',
          is_deleted: false,
          status: {
            $nin: ['deleting', 'delete_failed']
          }
        })
      })
      return !count
    },

    async getTaskRunningCount() {
      const { count } = await taskApi.count({
        where: JSON.stringify({
          syncType: 'migrate',
          is_deleted: false,
          status: 'running'
        })
      })
      return count
    },

    getMenuStep(options) {
      return {
        type: options.type,
        route: options.route,
        element: options.element,
        popover: {
          progressText: options.progressText,
          description: options.description,
          showButtons: [],
          onPopoverRender: (popover, { state }) => {
            const unwatch = this.$watch('$route', to => {
              if (to.name === options.route) {
                this.driverObj.moveNext()
              }
              unwatch()
            })
          }
        }
      }
    },

    getButtonStep(options) {
      let unwatch
      return {
        type: options.type,
        route: options.route,
        element: options.element,
        elementClick: (...args) => {
          //创建按钮点击后，隐藏引导
          unwatch && unwatch()
          this.beTouring = true
          this.driverObj.destroy()
          this.driverObj = null
        },
        onHighlightStarted: (element, step, options) => {
          element?.addEventListener('click', step.elementClick)
          if (!element) {
            step.elementClick()
          }
        },
        onDeselected: (element, step, options) => {
          element?.removeEventListener('click', step.elementClick)
        },
        popover: {
          progressText: options.progressText,
          description: options.description,
          showButtons: [],
          onPopoverRender: (popover, { state }) => {
            unwatch = this.$watch('$route', to => {
              if (to.name !== options.route) {
                this.driverObj.movePrevious()
              }
              unwatch()
            })
          }
        }
      }
    },

    async getSteps() {
      const _steps = [
        {
          key: 'sourceConnection',
          handle: this.checkSourceCount
        },
        {
          key: 'targetConnection',
          handle: this.checkTargetCount
        },
        {
          key: 'task',
          handle: this.checkTaskCount
        }
      ]
      const steps = []
      const stepMap = {
        sourceConnection: [
          {
            type: 'menu',
            route: 'connections',
            element: '#menu-connections',
            description: i18n.t('dfs_mixins_tour_qingchuangjianninde3'),
            progressText: '1/6'
          },
          {
            type: 'button',
            route: 'connections',
            element: '#connection-list-create',
            description: i18n.t('dfs_mixins_tour_dianjicichuchuang3'),
            progressText: '2/6'
          }
        ],
        targetConnection: [
          {
            type: 'menu',
            route: 'connections',
            element: '#menu-connections',
            description: i18n.t('dfs_mixins_tour_qingchuangjianninde2'),
            progressText: '3/6'
          },
          {
            type: 'button',
            route: 'connections',
            element: '#connection-list-create',
            description: i18n.t('dfs_mixins_tour_dianjicichuchuang2'),
            progressText: '4/6'
          }
        ],
        task: [
          {
            type: 'menu',
            route: 'migrateList',
            element: '#menu-migrate',
            description: i18n.t('dfs_mixins_tour_qingchuangjianninde'),
            progressText: '5/6'
          },
          {
            type: 'button',
            route: 'migrateList',
            element: '#task-list-create',
            description: i18n.t('dfs_mixins_tour_dianjicichuchuang'),
            progressText: '6/6'
          }
        ]
      }

      for (let item of _steps) {
        const enable = await item.handle()

        if (enable) {
          stepMap[item.key].forEach(option => {
            if (option.type === 'menu') steps.push(this.getMenuStep(option))
            if (option.type === 'button') steps.push(this.getButtonStep(option))
          })
        }
      }

      return steps
    },

    setComplete() {
      localStorage[`allStepsComplete-${this.userId}`] = Date.now()
    },

    hasComplete() {
      return !!localStorage[`allStepsComplete-${this.userId}`]
    },

    hasCompleteAlarm() {
      return !!localStorage[`completeAlarm-${this.userId}`]
    },

    async initDriver() {
      this.loadingStep = true
      const steps = await this.getSteps()
      this.loadingStep = false

      if (!steps.length) {
        // 满足所有步骤完成的条件
        this.setComplete()
        // await this.initAlarmTour()
      } else {
        this.driverObj = driver({
          allowClose: false,
          showProgress: true,
          // onDestroyed: () => {
          //   this.startingTour = false
          // },
          steps
        })
        this.driverObj.drive(steps[0].type === 'menu' && this.$route.name === steps[0].route ? 1 : 0)
      }
    },

    async initAlarmTour() {
      if (this.$route.name !== 'migrateList' || this.hasCompleteAlarm()) return
      const runningCount = await this.getTaskRunningCount()

      if (runningCount > 0 && this.$route.name === 'migrateList') {
        this.showAlarmTour = true
      }
    },

    async initAgentTour() {
      const { items: agentData } = await this.$axios.get(
        'api/tcm/agent?filter=' +
          encodeURIComponent(
            JSON.stringify({
              where: {
                status: { $in: ['Error', 'Stopped'] }
              }
            })
          )
      )
      const agent = agentData.find(agent => {
        if (agent.tapdataAgentStatus !== 'stopped' && (agent.agentType !== 'Cloud' || !agent.publicAgent)) {
          // if (agent.agentType !== 'Cloud' || !agent.publicAgent) {
          return true
        }
      })

      if (!agent) return

      const element = `#agent-${agent.id} [name="${agent.agentType === 'Cloud' ? 'restart' : 'start'}"]`
      let unwatch
      const steps = [
        {
          type: 'menu',
          route: 'Instance',
          element: '#menu-Instance',
          onDeselected: (element, step, options) => {
            unwatch()
          },
          popover: {
            description: i18n.t('dfs_mixins_tour_qingxianqidongnin'),
            showButtons: [],
            onPopoverRender: (popover, { state }) => {
              // agent列表加载成功后开始显示引导
              unwatch = this.$watch('$store.state.instanceLoading', loading => {
                if (!loading && this.$route.name === 'Instance') {
                  this.driverObj.moveNext()
                  unwatch()
                }
              })
            }
          }
        },
        this.getButtonStep({
          type: 'button',
          route: 'Instance',
          element,
          description: i18n.t('dfs_mixins_tour_qingxianqidongnin')
        })
      ]

      console.log('initAgentTour', steps) // eslint-disable-line

      this.driverObj = driver({
        // allowClose: false,
        steps,
        onDestroyed: () => {
          this.beTouring = false
          this.enterAgentTour = true
        }
      })
      this.driverObj.drive(steps[0].type === 'menu' && this.$route.name === steps[0].route ? 1 : 0)
    },

    async initTour() {
      const whiteList = ['connectionCreate']

      if (
        this.subscriptionModelVisible ||
        whiteList.includes(this.$route.name) ||
        this.driverObj ||
        this.showAlarmTour ||
        this.loadingStep ||
        this.beTouring
      ) {
        return
      }
      if (this.agentRunningCount) {
        // 有可用的agent
        // await this.initDriver()
        if (this.hasComplete()) {
          await this.initAlarmTour()
        } else {
          await this.initDriver()
        }
      } else if (this.showAgentWarning && !this.enterAgentTour) {
        // 存在异常的agent
        await this.initAgentTour()
      }
    }
  }
}
