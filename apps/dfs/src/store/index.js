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
    startingGuide: false,
    highlightBoard: false,
    driverIndex: 0,
    addConnectionAction: '',
    driverBehavior: '', // add-source, add-target, add-task
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

    setStartingGuide(state, flag) {
      state.startingGuide = flag
    },

    setDriverIndex(state, index) {
      state.driverIndex = index
    },

    setDriverBehavior(state, behavior) {
      state.driverBehavior = behavior
    },

    setHighlightBoard(state, flag) {
      state.highlightBoard = flag
    }
  }
})

export default store
