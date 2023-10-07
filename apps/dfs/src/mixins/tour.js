import Mousetrap from 'mousetrap'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import i18n from '@/i18n'
import { connectionsApi, taskApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'
import { getUrlSearch } from '@tap/shared/src/util'

export default {
  data() {
    return {
      showAlarmTour: false,
      //新人引导
      step: 1,
      agent: {},
      isUnDeploy: false,
      subscribes: {},
      showReplicationTour: false,
      replicationTourFinish: false
    }
  },

  computed: {
    ...mapState(['replicationTour']),
    ...mapGetters(['startingTour', 'completedTour', 'pausedTour']),
    userId() {
      return this.$store.state.user.id
    }
  },

  watch: {
    $route(to, from) {
      console.log('$route', to) // eslint-disable-line
    }
  },

  async created() {
    await this.loadGuide()
    await this.checkGuide()
    this.loopLoadAgentCount()
    this.setUrlParams() // url携带的自定义参数
    let unwatch

    // 🎉🥚
    Mousetrap.bind('up up down down left right left right', () => {
      unwatch?.()
      if (this.startingTour) {
        this.showReplicationTour = false
        this.completeTour()
        this.destroyDriver()
      } else {
        this.subscriptionModelVisible = !this.subscriptionModelVisible
      }
    })
  },

  destroyed() {
    this.unwatchTourRoute?.()
    this.unwatchTour?.()
    this.destroyDriver()
  },

  methods: {
    ...mapMutations(['startTour', 'setTourIndex', 'setHighlightBoard', 'completeTour', 'pauseTour']),
    // 检查是否有安装过agent
    async checkGuide() {
      this.guideLoading = true
      let subscribe = await this.$axios.get(`api/tcm/subscribe`)
      const data = await this.$axios.get('api/tcm/agent')
      this.guideLoading = false
      const { guide } = this.$store.state
      const { subscribeId, agentId } = guide
      let items = data?.items || []
      let subItems = subscribe?.items || []

      items = items.filter(({ id }) => !['64a785ada8321f670d2338d1', '64a01d43a1dd0e614a1b7d86'].includes(id))

      //是否有未支付的订阅
      if (!items.length && !subItems.length) {
        this.subscriptionModelVisible = true
        return
      }

      //是否有运行中的实例
      let isRunning = items.find(i => i.status === 'Running')
      if (isRunning) {
        return
      }

      //是否有支付成功的订阅
      // if (subItems.find(i => i.status === 'active' && i.totalAmount !== 0)) return

      //订阅0 Agent 0  完全新人引导
      //订阅不为0 查找是否有待部署状态
      //Agent不为0 查找是否有待部署状态
      //优先未支付判定
      //未支付

      if (subscribeId) {
        let isUnPay = subItems.find(i => i.status === 'incomplete' && guide.subscribeId === i.id)

        if (isUnPay) {
          this.subscribes = isUnPay
          this.subscriptionModelVisible = true
          //是否有未支付的订阅
          return
        }
      }

      if (agentId) {
        //检查是否有待部署状态
        let isUnDeploy = items.find(i => i.status === 'Creating' && i.agentType === 'Local' && i.id === agentId)
        //未部署
        if (isUnDeploy) {
          this.agent = {
            id: isUnDeploy.id
          }
          this.isUnDeploy = true
          this.subscriptionModelVisible = true
          return
        }
      }
    },

    async loadGuide() {
      const guide = await this.$axios.get('api/tcm/user_guide')
      this.$store.commit('setGuide', guide)
      this.$store.commit('setReplicationTour', guide?.tour)
    },

    loopLoadAgentCount() {
      return this.$axios
        .get('api/tcm/agent/agentCount')
        .then(data => {
          this.showAgentWarning = data.agentTotalCount && !data.agentRunningCount
          this.agentRunningCount = data.agentRunningCount
          window.__agentCount__ = data
          this.$store.commit('setAgentCount', data)
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
                this.driverObj?.movePrevious()
              }
              unwatch()
            })
          }
        }
      }
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
      let unwatch = this.$watch('$store.state.instanceLoading', loading => {
        if (
          !loading &&
          this.$route.name === 'Instance' &&
          this.driverObj &&
          !this.driverObj.getActiveIndex() &&
          document.querySelector(element)
        ) {
          this.driverObj.drive(1)
        }

        if (!loading && !document.querySelector(element)) {
          this.driverObj?.destroy()
          this.driverObj = null
          unwatch()
        }
      })
      const startStep = this.getButtonStep({
        type: 'button',
        route: 'Instance',
        element,
        description: i18n.t('dfs_mixins_tour_qingxianqidongnin')
      })
      delete startStep.popover.showButtons
      const steps = [
        {
          type: 'menu',
          route: 'Instance',
          element: '#menu-Instance',
          popover: {
            description: i18n.t('dfs_mixins_tour_qingxianqidongnin')
          }
        },
        startStep
      ]

      this.driverObj?.destroy()
      this.driverObj = driver({
        showButtons: ['close'],
        allowKeyboardControl: false,
        steps,
        onDestroyed: () => {
          unwatch()
          this.beTouring = false
          this.enterAgentTour = true
        }
      })

      let stepIndex = 0

      if (steps[0].type === 'menu' && this.$route.name === steps[0].route) {
        stepIndex = 1
        if (!document.querySelector(element)) {
          return
        }
      }

      this.driverObj.drive(stepIndex)
    },

    async initTour() {
      const whiteList = ['connectionCreate']

      if (
        this.guideLoading ||
        this.subscriptionModelVisible ||
        whiteList.includes(this.$route.name) ||
        this.driverObj ||
        this.showAlarmTour ||
        this.beTouring ||
        this.enterReplicationTour
      ) {
        return
      }
      if (this.agentRunningCount) {
        // 有可用的agent
        this.checkReplicationTour()
      } else if (this.showAgentWarning && !this.enterAgentTour && !this.startingTour) {
        // 存在异常的agent
        await this.initAgentTour()
      }
    },

    changeIsUnDeploy(val) {
      this.isUnDeploy = val
    },

    setUrlParams() {
      // 上报百度索引
      const logidUrlCloud = Cookie.get('logidUrlCloud')
      const { guide } = this.$store.state

      const bd_vid = getUrlSearch('bd_vid')
      const tp_vid = getUrlSearch('tp_vid')
      let params = {}

      if (tp_vid && !guide.tpVid) {
        guide.tpVid = params.tpVid = tp_vid
      }

      if (bd_vid && !guide.bdVid) {
        guide.bdVid = params.bdVid = bd_vid
        const conversionTypes = [
          {
            logidUrl: logidUrlCloud,
            newType: 25
          }
        ]
        this.$axios
          .post('api/tcm/track/send_convert_data', conversionTypes)
          .then(data => {
            if (data) {
              this.buried('registerSuccess')
            }
          })
          .catch(e => {
            console.log('ocpc.baidu.com', e)
          })
      }

      if (Object.keys(params).length) {
        this.$axios.post('api/tcm/user_guide', params)
      }
    },

    destroyDriver() {
      if (this.startingTour) this.pauseTour()
      this.replicationDriverObj?.destroy()
      // this.driverObj = null
    },

    checkReplicationTour() {
      const tour = this.replicationTour
      if (tour.enable && !this.completedTour) {
        this.enterReplicationTour = true // 标识进入任务引导的过程，在轮询agent数量时判断
        this.initReplicationTour()

        if (!tour.status) {
          // 没有进入过
          this.showReplicationTour = true
        } else this.$router.push({ name: 'migrateList' }) // 没有完成引导，继续进入数据复制
      }
    },

    initReplicationTour() {
      const steps = [
        {
          element: '#btn-add-source',
          elementClick: () => {
            this.replicationDriverObj.destroy()
          },
          onHighlightStarted: (element, step, { state }) => {
            this.setTourIndex(state.activeIndex)
            element?.addEventListener('click', step.elementClick)
          },
          onDeselected: (element, step, options) => {
            element?.removeEventListener('click', step.elementClick)
          },
          popover: {
            showButtons: [],
            description: i18n.t('dfs_mixins_tour_dianjicichuchuang3')
          }
        },
        {
          element: '#btn-add-target',
          elementClick: () => {
            this.replicationDriverObj.destroy()
          },
          onHighlightStarted: (element, step, { state }) => {
            this.setTourIndex(state.activeIndex)
            element?.addEventListener('click', step.elementClick)
          },
          onDeselected: (element, step) => {
            element?.removeEventListener('click', step.elementClick)
          },
          popover: {
            showButtons: [],
            description: i18n.t('dfs_mixins_tour_dianjicichuchuang2')
          }
        },
        {
          element: '#replication-board',
          onHighlightStarted: (element, step, { state }) => {
            this.setTourIndex(state.activeIndex)
            this.setHighlightBoard(true)
          },
          onDeselected: () => {
            this.setHighlightBoard(false)
          },
          popover: {
            side: 'top',
            showButtons: [],
            description: i18n.t('dfs_mixins_tour_drag_source_table'),
            onPopoverRender: (popover, { state }) => {
              console.log('popover', popover) // eslint-disable-line
            }
          }
        }
      ]
      this.replicationDriverObj = driver({
        allowClose: false,
        // allowClose: process.env.NODE_ENV === 'development',
        allowKeyboardControl: false,
        showProgress: true,
        steps,
        onHighlightStarted: (element, step, { state }) => {
          console.log('设置Index', state.activeIndex) // eslint-disable-line
          this.setTourIndex(state.activeIndex)
        }
      })

      console.log('this.replicationDriverObj', this.replicationDriverObj)

      const unwatch = this.$watch('replicationTour.behavior', behavior => {
        if (!this.startingTour || !this.replicationDriverObj) {
          unwatch()
          return
        }

        this.replicationDriverObj.drive(this.replicationTour.activeIndex + 1)

        if (behavior === 'add-task') {
          this.setCompleted()
        }
      })

      this.unwatchTourRoute = this.$watch(
        '$route',
        to => {
          if (to.name === 'migrateList' && (this.pausedTour || this.startingTour)) {
            this.startTour()
            if (!this.$store.state.replicationConnectionDialog) {
              this.$nextTick(() => {
                this.replicationDriverObj.drive(this.replicationTour.activeIndex || 0)
              })
            }
          } else {
            this.destroyDriver()
          }

          if (this.completedTour) this.unwatchTourRoute?.()
        },
        {
          immediate: true
        }
      )

      this.unwatchTour = this.$watch(
        'replicationTour',
        tour => {
          this.$axios.post('api/tcm/user_guide', {
            tour
          })
          if (this.completedTour) this.unwatchTour?.()
        },
        {
          deep: true
        }
      )
    },

    setCompleted() {
      this.showReplicationTour = true
      this.replicationTourFinish = true
      this.completeTour()
      this.destroyDriver()
    },

    async handleStartTour() {
      this.showReplicationTour = false
      await this.$router.push({ name: 'migrateList' })
      this.startTour()
      this.replicationDriverObj.drive(0)
    },

    handleFinishTour() {
      this.showReplicationTour = false
    }
  }
}
