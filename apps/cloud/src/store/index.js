import { taskApi } from '@tap/api'
import classification from '@tap/component/src/store'
import dataflow from '@tap/dag/src/store'
import {
  getCurrentLanguage,
  setCurrentLanguage,
} from '@tap/i18n/src/shared/util'
import overView from '@tap/ldp/src/store'
import { getUrlSearch } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import { merge } from 'lodash'
import * as Vuex from 'vuex'
import i18n from '../i18n'
import axios from '../plugins/axios'
import { buried } from '../plugins/buried'

const store = Vuex.createStore({
  modules: {
    dataflow,
    classification,
    overView,
  },

  state: {
    upgradeFeeVisible: false,
    migrateTaskRunningCount: 0,
    instanceLoading: false,
    user: {
      id: '',
      username: '',
      nickname: '',
      avatar: '',
      telephone: '',
      phoneCountryCode: '',
      wx: '',
      email: '',
      enableLicense: false,
      licenseCodes: [],
      customData: {
        firstName: '',
        lastName: '',
      },
      gcpAccount: null,
      locale: '',
    },
    highlightBoard: false,
    driverIndex: 0,
    driverBehavior: '', // add-source, add-target, add-task
    replicationConnectionDialog: false,
    replicationTour: {
      enable: false,
      activeIndex: null,
      behavior: '', // add-source, add-target, add-task
      status: '', // starting, completed, paused
      view: 'list', // board, list
      sourceConnectionId: '',
      targetConnectionId: '',
      isDemoSource: null,
      isDemoTarget: null,
      taskId: '',
    },
    // 新人引导
    guide: {
      installStep: -1,
      demand: [''],
      selectAgentType: 'fullManagement',
      agentId: '',
      // steps: [],
      subscribeId: '',
      // spec: '',
      // behavior: '',
      tour: {
        view: 'list', // board, list
        taskId: '',
        status: 'starting', // starting, completed
      },
      expand: {
        suggestion: '',
        version: '',
        // version: '3.13.0'
      },
    },
    agentCount: {
      agentTotalCount: 0,
      agentRunningCount: 0,
      twoWayAgentRunningCount: 0,
      freeTierAgentCount: 0,
      subscriptionAgentCount: 0,
      agentSummery: {
        FreeTier: 0,
        Stripe: 0,
      },
    },

    config: {
      onlyEnglishLanguage: false,
      slackLink: '',
      station: '', //标记国际站international 国内站 domestic
      pagePermissions: [], // dataHub
    },

    showReplicationTour: false,
    replicationTourFinish: false,
    taskLoadedTime: null, // 记录TargetPanel任务列表加载时间
    isMockUser: false,
    mockUserPromise: null,
  },

  getters: {
    language: (state) => {
      return state.user.locale
    },
    isGCPMarketplaceUser: (state) => state.user.gcpAccount !== null,
    isDomesticStation: (state, getters) => {
      return getters.language !== 'en'
    },
    currencyType: (state, getters) =>
      getters.isDomesticStation ? 'cny' : 'usd',
    startingTour: (state) => state.replicationTour.status === 'starting',
    pausedTour: (state) => state.replicationTour.status === 'paused',
    completedTour: (state) => state.replicationTour.status === 'completed',
    pausedGuide: (state) => state.guide.expand.guideStatus === 'paused',
    startingGuide: (state) => state.guide.expand.guideStatus === 'starting',
    guideExpand: (state) => state.guide.expand,
  },

  mutations: {
    setConfig(state, config) {
      if (!config.slackLink) {
        config.slackLink =
          'https://join.slack.com/t/tapdata-workspace/shared_invite/zt-27lvv108h-G7aKWUbgZ2Ms~0MPehAhfg'
      }
      Object.assign(state.config, config)
    },

    setInstanceLoading(state, loading) {
      state.instanceLoading = loading
    },

    setUser(state, user = {}) {
      user.phoneCountryCode = user.phoneCountryCode?.replace(/[+-]/g, '')
      Object.assign(state.user, user)
    },

    setLanguage(state, lang) {
      if (!lang) {
        lang = getCurrentLanguage()
      }

      state.user.locale = setCurrentLanguage(lang, i18n)
    },

    setUserEmail(state, email) {
      state.user.email = email
    },

    setGuide(state, guide = {}) {
      Object.assign(state.guide, guide)
      sessionStorage.setItem('guide', JSON.stringify(state.guide))
    },

    setAgentCount(state, agentCount) {
      Object.assign(state.agentCount, agentCount)
    },

    setReplicationTour(state, tour) {
      Object.assign(state.replicationTour, tour)
    },

    setTourIndex(state, index) {
      state.replicationTour.activeIndex = index
    },

    setTourBehavior(state, behavior) {
      state.replicationTour.behavior = behavior
    },

    setHighlightBoard(state, flag) {
      state.highlightBoard = flag
    },

    startTour(state) {
      state.replicationTour.view = 'board'
      state.replicationTour.status = 'starting'
    },

    pauseTour(state) {
      state.replicationTour.status = 'paused'
    },

    completeTour(state) {
      state.replicationTour.status = 'completed'
      state.guide.expand.guideStatus = 'completed'
    },

    setUpgradeFeeVisible(state, flag) {
      state.upgradeFeeVisible = flag
    },

    setReplicationConnectionDialog(state, visible) {
      state.replicationConnectionDialog = visible
    },

    setExpand(state, expand) {
      Object.assign(state.guide.expand, expand)
    },

    startGuide(state) {
      state.guide.expand.guideStatus = 'starting'
    },

    pauseGuide(state) {
      state.guide.expand.guideStatus = 'paused'
    },

    completeGuide(state) {
      state.guide.expand.guideStatus = 'completed'
    },

    setShowReplicationTour(state, flag) {
      state.showReplicationTour = flag
    },

    openCompleteReplicationTour(state) {
      state.showReplicationTour = true
      state.replicationTourFinish = true
    },

    setTaskLoadedTime(state) {
      state.taskLoadedTime = Date.now()
    },

    setIsMockUser(state, flag) {
      state.isMockUser = flag
    },

    setMockUserPromise(state, promise) {
      state.mockUserPromise = promise
    },
  },

  actions: {
    async getFreeTier() {
      const [priceList] = await axios.get('api/tcm/orders/paid/price', {
        params: {
          productType: 'fullManagement',
        },
      })

      return priceList.paidPrice.find((item) => item.price === 0)
    },

    async subscribe({ state, commit }, freeTier) {
      const data = await axios.post('api/tcm/orders/subscribeV2', {
        price: 0,
        subscribeType: 'one_time',
        platform: 'fullManagement',
        subscribeItems: [
          {
            priceId: freeTier.priceId,
            quantity: 1,
            productType: 'Engine',
            agentType: 'Cloud',
            provider: '',
            region: '',
          },
        ],
        email: state.user.email,
      })
      const guideData = {
        agentId: data?.subscribeItems?.[0].resourceId,
        subscribeId: data?.subscribe,
      }

      commit('setGuide', guideData)

      axios.post('api/tcm/user_guide', guideData)
    },

    async checkMockUser({ commit, state }) {
      return axios
        .get('api/gw/user', {
          maxRedirects: 0,
        })
        .then((data) => {
          const mockUserId = data?.mockUserId || false
          commit('setIsMockUser', mockUserId)
          return mockUserId
        })
        .catch((error) => {
          console.error(error)
        })
    },

    async initGuide({ commit, dispatch, state }, router) {
      const isMockUser = await dispatch('checkMockUser')

      let guide = await axios.get('api/tcm/user_guide')

      let bd_vid
      let tp_vid
      let userExpand = {}
      let sendConvertData

      if (!isMockUser) {
        bd_vid = getUrlSearch('bd_vid')
        tp_vid = getUrlSearch('tp_vid')

        const userVirtualId = Cookie.get('userVirtualId')
        const logidUrlCloud = Cookie.get('logidUrlCloud')
        const userReferrer = Cookie.get('userReferrer')
        const userVisitedPages = Cookie.get('userVisitedPages')

        if (userVirtualId) {
          Cookie.remove('userVirtualId')

          userExpand = {
            userReferrer,
            userVirtualId,
            userVisitedPages,
          }
        }

        if (logidUrlCloud) {
          Cookie.remove('logidUrlCloud')

          const url = new URL(decodeURIComponent(logidUrlCloud))
          bd_vid = url.searchParams.get('bd_vid')
        }

        sendConvertData = () => {
          const conversionTypes = [
            {
              logidUrl: logidUrlCloud || location.href,
              newType: 25,
            },
          ]
          axios
            .post('api/tcm/track/send_convert_data', conversionTypes)
            .then((data) => {
              if (data) {
                buried('registerSuccess')
              }
            })
            .catch((error) => {
              console.log('ocpc.baidu.com', error)
            })
        }
      }

      if (!guide) {
        guide = await axios.post(
          'api/tcm/user_guide',
          merge({}, state.guide, {
            tp_vid,
            bd_vid,
            expand: {
              ...userExpand,
              version: '3.13.0',
            },
          }),
        )

        if (bd_vid) {
          sendConvertData?.()
        }
      } else {
        const params = {}

        if (!guide.expand) {
          params.expand = guide.expand = {
            suggestion: '',
            version: '',
          }
        }

        if (tp_vid && !guide.tpVid) {
          params.tpVid = guide.tpVid = tp_vid
        }
        if (userExpand.userVirtualId && !guide.expand?.userVirtualId) {
          params.expand = Object.assign(guide.expand, userExpand)
        }
        if (bd_vid && !guide.bdVid) {
          params.bdVid = guide.bdVid = bd_vid
          sendConvertData?.()
        }

        if (Object.keys(params).length) {
          axios.post('api/tcm/user_guide', params)
        }
      }

      commit('setGuide', guide)

      if (
        guide.expand.version !== '3.13.0' ||
        guide.tour.status === 'completed'
      )
        return state.guide

      if (guide.installStep === -1) {
        router.replace({
          name: 'Welcome',
        })

        const freeTier = await dispatch('getFreeTier')

        if (freeTier) {
          await dispatch('subscribe', freeTier)
        }
      } else if (guide.installStep > -1 && guide.tour.taskId) {
        const data = await taskApi.get({
          filter: JSON.stringify({
            where: {
              id: guide.tour.taskId,
            },
          }),
        })

        // 如果没有完成引导任务，并且任务还存在，跳转到引导任务
        if (data?.items?.length) {
          router.push({
            name: 'WelcomeTask',
            params: {
              id: guide.tour.taskId,
            },
          })
        }
      }

      return state.guide
    },

    startGuideTask({ commit, state }, { demand, suggestion }) {
      state.guide.demand = [demand, suggestion]

      axios.post('api/tcm/user_guide', {
        demand: state.guide.demand,
      })
    },

    setGuideTask({ commit, state }, taskId) {
      state.guide.installStep = 0
      state.guide.tour.taskId = taskId
      axios.post('api/tcm/user_guide', {
        installStep: state.guide.installStep,
        tour: state.guide.tour,
      })
    },

    setGuideStep({ commit, state }, step) {
      state.guide.installStep = step
      axios.post('api/tcm/user_guide', {
        installStep: state.guide.installStep,
      })
    },

    setGuideComplete({ commit, state }) {
      state.guide.tour.status = 'completed'
      axios.post('api/tcm/user_guide', {
        tour: state.guide.tour,
      })
    },

    setGuideViewTaskMonitor({ commit, state }) {
      if (state.guide.tour.behavior === 'view-monitor') return

      if (
        state.guide.expand.version !== '3.13.0' ||
        state.guide.tour.status !== 'completed'
      )
        return

      state.guide.tour.behavior = 'view-monitor'

      axios.post('api/tcm/user_guide', {
        tour: state.guide.tour,
      })

      commit('openCompleteReplicationTour')
    },

    setReplicationView({ commit, state }, view) {
      state.guide.tour.view = view
      axios.post('api/tcm/user_guide', {
        tour: state.guide.tour,
      })
    },
  },
})

export default store
