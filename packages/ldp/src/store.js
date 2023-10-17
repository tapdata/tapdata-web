const getState = function () {
  let state = JSON.parse(sessionStorage.getItem('overViewState'))
  return {
    panelFlag: state?.panelFlag || false,
    userId: state?.userId || []
  }
}

// 初始化 state
const state = getState()

// getters
const getters = {
  stateFlag: state => {
    return state.panelFlag
  },
  stateUserId: state => {
    return state.userId
  }
}

// actions
const actions = {}

// mutations
const mutations = {
  /**
   * 设置展开状态
   * @param state
   * @param data
   */
  setPanelFlag(state, data) {
    state.panelFlag = data.panelFlag
    state.userId = data.userId
    sessionStorage.setItem('overViewState', JSON.stringify(state))
  }
}

export default {
  // 加上命名空间
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
