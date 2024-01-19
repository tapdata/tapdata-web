import Vue from 'vue'
import Vuex from 'vuex'
import dataflow from '@tap/dag/src/store'
import classification from '@tap/component/src/store'
import overView from '@tap/ldp/src/store'
import { getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import i18n from '../i18n'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    dataflow,
    classification,
    overView
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
      wx: '',
      email: '',
      enableLicense: false,
      licenseCodes: [],
      gcpAccount: null,
      locale: ''
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
      taskId: ''
    },
    // 新人引导
    guide: {
      activeStep: '',
      userId: '',
      bdVid: '',
      tpVid: '',
      installStep: 1,
      demand: [],
      selectAgentType: '',
      spec: '',
      subscribeId: '',
      agentId: '',
      steps: [],
      behavior: '',
      behaviorAt: null,
      expand: {
        enableGuide: null,
        guideStatus: '' // starting, completed, paused
      }
    },
    agentCount: {
      agentTotalCount: 0,
      agentRunningCount: 0,
      twoWayAgentRunningCount: 0,
      freeTierAgentCount: 0,
      subscriptionAgentCount: 0,
      agentSummery: {
        FreeTier: 0,
        Stripe: 0
      }
    },

    config: {
      onlyEnglishLanguage: false,
      slackLink: '',
      station: '', //标记国际站international 国内站 domestic
      pagePermissions: [] // dataHub
    },

    showReplicationTour: false,
    replicationTourFinish: false,
    taskLoadedTime: null // 记录TargetPanel任务列表加载时间
  },

  getters: {
    language: state => {
      return state.user.locale
    },
    isGCPMarketplaceUser: state => state.user.gcpAccount !== null,
    isDomesticStation: (state, getters) => {
      console.log('isDomesticStation', getters.language)
      return getters.language !== 'en'
    },
    startingTour: state => state.replicationTour.status === 'starting',
    pausedTour: state => state.replicationTour.status === 'paused',
    completedTour: state => state.replicationTour.status === 'completed',
    pausedGuide: state => state.guide.expand.guideStatus === 'paused',
    startingGuide: state => state.guide.expand.guideStatus === 'starting',
    guideExpand: state => state.guide.expand
  },

  mutations: {
    setConfig(state, config) {
      Object.assign(state.config, config)
    },

    setInstanceLoading(state, loading) {
      state.instanceLoading = loading
    },

    setUser(state, user = {}) {
      Object.assign(state.user, user)
    },

    setLanguage(state, lang) {
      if (!lang) {
        lang = getCurrentLanguage()
      }
      state.user.locale = lang
      setCurrentLanguage(lang, i18n)
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

    setReplicationView(state, view) {
      state.replicationTour.view = view
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
      state.taskLoadedTime = new Date().getTime()
    }
  }
})

export default store
