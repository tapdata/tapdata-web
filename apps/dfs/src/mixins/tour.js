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
      guideLoading: false,
      marketplaceGuideVisible: false,
      agentCountLoading: false
    }
  },

  computed: {
    ...mapState(['replicationTour']),
    ...mapGetters([
      'startingTour',
      'completedTour',
      'pausedTour',
      'pausedGuide',
      'guideExpand',
      'isGCPMarketplaceUser'
    ]),
    userId() {
      return this.$store.state.user.id
    }
  },

  async created() {
    if (this.isGCPMarketplaceUser) {
      // GCP Marketplace 用户，直接跳过引导
      let { total = 0 } = await this.$axios.get(`api/tcm/subscribe`)
      if (total === 0) {
        // 显示正在创建实例的提示
        this.marketplaceGuideVisible = true
      }
    }

    // this.loopLoadAgentCount()
    await this.setUrlParams() // url携带的自定义参数
  },

  destroyed() {
    this.handleDestroy()
  },

  methods: {
    ...mapMutations([
      'startTour',
      'setTourIndex',
      'setHighlightBoard',
      'completeTour',
      'pauseTour',
      'pauseGuide',
      'startGuide',
      'setShowReplicationTour',
      'openCompleteReplicationTour'
    ]),

    handleDestroy() {
      this.unwatchTourBehavior?.()
      this.unwatchTourStatus?.()
      this.unwatchTourRoute?.()
      this.unwatchTour?.()
      this.destroyDriver()
    },

    // 检查是否有安装过agent
    async checkGuide() {
      const { guide, replicationTour } = this.$store.state

      // 进入过任务引导
      if (replicationTour.status) return

      this.guideLoading = true
      let subscribe = await this.$axios.get(`api/tcm/subscribe`)
      const data = await this.$axios.get('api/tcm/agent')
      this.guideLoading = false

      const { subscribeId, agentId } = guide
      let items = data?.items || []
      let subItems = subscribe?.items || []

      // 没有订阅和实例
      if (!items.length && !subItems.length) {
        this.subscriptionModelVisible = true
        return
      }

      // 是否有运行中的实例
      let isRunning = items.find(i => i.status === 'Running')
      if (isRunning) {
        return { isRunning }
      }

      if (subscribeId) {
        if (subscribeId === '-') {
          // agent 引导过程中退订: subscribeId === '-', 所有订阅都是canceled按引导退订处理，能开启引导
          this.subscriptionModelVisible = subItems.every(item => item.status === 'canceled')
          return
        }

        let subscribe = subItems.find(i => guide.subscribeId === i.id)

        if (subscribe && subscribe.status === 'incomplete') {
          // 引导订阅的agent未支付
          this.subscribes = subscribe
          this.subscriptionModelVisible = true
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

      if (!subscribeId || !agentId) {
        this.subscriptionModelVisible = true
      }
    },

    loopLoadAgentCount(showLoading) {
      clearTimeout(this.loopLoadAgentCountTimer)
      this.agentCountLoading = showLoading
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
          this.agentCountLoading = false
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
        this.enterReplicationTour ||
        this.pausedGuide
      ) {
        return
      }
      if (this.agentRunningCount) {
        // 有可用的agent
        this.marketplaceGuideVisible = false
        this.checkReplicationTour()
      } else if (this.showAgentWarning && !this.enterAgentTour && !this.startingTour) {
        // 存在异常的agent
        await this.initAgentTour()
      }
    },

    changeIsUnDeploy(val) {
      this.isUnDeploy = val
    },

    async setUrlParams() {
      const { guide, mockUserPromise } = this.$store.state

      let bd_vid = getUrlSearch('bd_vid')
      const tp_vid = getUrlSearch('tp_vid')
      let params = {}

      if (tp_vid && !guide.tpVid) {
        guide.tpVid = params.tpVid = tp_vid
      }

      const logidUrlCloud = Cookie.get('logidUrlCloud')
      const userReferrer = Cookie.get('userReferrer')
      const userVirtualId = Cookie.get('userVirtualId')
      const userVisitedPages = Cookie.get('userVisitedPages')

      if (mockUserPromise) {
        const isMock = await mockUserPromise.catch(e => {
          console.error(e)
        })
        if (isMock) return
      }

      if (userVirtualId && !guide.expand?.userVirtualId) {
        params.expand = Object.assign(guide.expand, {
          userReferrer,
          userVirtualId,
          userVisitedPages
        })
      }

      if (logidUrlCloud) {
        const url = new URL(decodeURIComponent(logidUrlCloud))
        bd_vid = url.searchParams.get('bd_vid')
      }

      if (bd_vid && !guide.bdVid) {
        guide.bdVid = params.bdVid = bd_vid

        const conversionTypes = [
          {
            logidUrl: logidUrlCloud || location.href,
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
          this.setShowReplicationTour(true)
        } else this.$router.push({ name: 'migrateList' }) // 没有完成引导，继续进入数据复制
      }
    },

    initReplicationTour() {
      const taskMonitorId = `#task-${this.replicationTour.taskId} [name="monitor"]`
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
            description: i18n.t('dfs_mixins_tour_drag_source_table')
          }
        },
        {
          element: taskMonitorId,
          elementClick: () => {
            this.setCompleted()
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
            description: i18n.t('dfs_mixins_tour_view_monitor')
          }
        }
      ]
      this.replicationDriverObj = driver({
        allowClose: false,
        allowKeyboardControl: false,
        showProgress: true,
        steps,
        popoverClass: 'replication-driver-popover p-3',
        onPopoverRender: (popover, { config, state }) => {
          const closeBtn = document.createElement('button')
          closeBtn.innerText = this.$t('public_button_close')
          popover.footerButtons.appendChild(closeBtn)

          closeBtn.addEventListener('click', () => {
            this.pauseGuideAndTour()
          })
        },
        onHighlightStarted: (element, step, { state }) => {
          console.log('设置Index', state.activeIndex) // eslint-disable-line
          this.setTourIndex(state.activeIndex)
        }
      })

      // 监听任务引导行为
      this.unwatchTourBehavior?.()
      this.unwatchTourBehavior = this.$watch('replicationTour.behavior', async behavior => {
        if (!this.startingTour || !this.replicationDriverObj) {
          this.unwatchTourBehavior()
          return
        }

        if (behavior === 'add-task') {
          // this.setCompleted()
          // 设置进入任务监控的引导
          // 设置step的element
          const { steps } = this.replicationDriverObj.getConfig()
          steps[steps.length - 1].element = `#task-${this.replicationTour.taskId} [name="monitor"]`
          console.log(this.replicationDriverObj)
          await this.$nextTick()
        }
        this.replicationDriverObj.drive(this.replicationTour.activeIndex + 1)
      })

      // 监听任务引导状态
      this.unwatchTourStatus?.()
      this.unwatchTourStatus = this.$watch('replicationTour.status', (status, oldStatus) => {
        if (status === 'complete') this.unwatchTourStatus?.()
        // 从开始窗口点击开始任务引导
        if (status === 'starting' && !oldStatus) this.replicationDriverObj.drive(0)
      })

      // 监听路由变化
      this.unwatchTourRoute?.()
      this.unwatchTourRoute = this.$watch(
        '$route',
        to => {
          if (to.name === 'migrateList' && (this.pausedTour || this.startingTour)) {
            this.startTour()
            this.startGuide()
            if (!this.$store.state.replicationConnectionDialog) {
              this.$nextTick(() => {
                // 判断任务的监控按钮是否渲染
                let index = this.replicationTour.activeIndex
                if (this.replicationTour.behavior === 'add-target') {
                  if (index !== 2) {
                    debugger
                  }
                  index = 2
                }
                if (this.replicationTour.behavior === 'add-task') index = 3

                this.setTourIndex(index)

                if (index === 3 && !document.querySelector(taskMonitorId)) {
                  // 如果没有渲染，监听任务列表的加载时间
                  const unwatch = this.$watch('$store.state.taskLoadedTime', () => {
                    this.$nextTick(() => {
                      if (document.querySelector(taskMonitorId)) {
                        unwatch()
                        this.replicationDriverObj.drive(index)
                      }
                    })
                  })
                } else {
                  this.replicationDriverObj.drive(index || 0)
                }
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

      // 监听任务引导对象
      this.unwatchTour?.()
      this.unwatchTour = this.$watch(
        'replicationTour',
        tour => {
          this.$axios.post('api/tcm/user_guide', {
            tour
            // expand: this.$store.state.guide.expand // 带上 expand 保存上 guideStatus
          })
          if (this.completedTour) this.unwatchTour?.()
        },
        {
          deep: true
        }
      )
    },

    setCompleted() {
      // this.openCompleteReplicationTour()
      this.completeTour()
      this.destroyDriver()
    },

    pauseGuideAndTour() {
      this.pauseGuide()
      this.handleDestroy()
    },

    async handleOpenGuide() {
      await this.checkGuide()

      if (!this.subscriptionModelVisible) {
        // 继续判断任务引导
        if (this.agentRunningCount) {
          this.checkReplicationTour()
          this.startGuide()
        } else {
          this.$message.warning(this.$t('agent_tip_no_running'))
        }
      } else {
        this.startGuide()
      }
    },

    updateMarketplaceGuide(val) {
      this.marketplaceGuideVisible = false
    },

    initMenuTour() {
      const steps = [
        {
          element: '#menu-Instance',
          popover: {
            showButtons: ['next', 'previous'],
            description: '在这里可以订阅半托管引擎部署在您本地，详细了解半托管引擎'
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
            showButtons: ['next', 'previous', 'close'],
            description: '点击这个可以尝试创建更高级的复制同步任务。'
          }
        }
      ]
      this.menuTour = driver({
        allowClose: false,
        allowKeyboardControl: false,
        showProgress: true,
        steps,
        popoverClass: 'replication-driver-popover p-3',
        onPopoverRender: (popover, { config, state }) => {},
        onHighlightStarted: (element, step, { state }) => {}
      })
    }
  }
}
