import Vue from 'vue'
import Vuex from 'vuex'
import dataflow from '@tap/dag/src/store'
import classification from '@tap/component/src/store'
import overView from '@tap/ldp/src/store'

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
      licenseCodes: []
    },
    highlightBoard: false,
    driverIndex: 0,
    driverBehavior: '', // add-source, add-target, add-task
    replicationTour: {
      enable: false,
      activeIndex: null,
      behavior: '', // add-source, add-target, add-task
      status: '', // starting, completed, paused
      view: 'list' // board, list
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
      behaviorAt: null
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
    }
  },

  getters: {
    startingTour: state => state.replicationTour.status === 'starting',
    pausedTour: state => state.replicationTour.status === 'paused',
    completedTour: state => state.replicationTour.status === 'completed'
  },

  mutations: {
    setInstanceLoading(state, loading) {
      state.instanceLoading = loading
    },

    setUser(state, user = {}) {
      Object.assign(state.user, user)
      console.log('state.user', state.user) // eslint-disable-line
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
    },

    setUpgradeFeeVisible(state, flag) {
      state.upgradeFeeVisible = flag
    },

    setReplicationView(state, view) {
      state.replicationTour.view = view
    }
  }
})

export default store
