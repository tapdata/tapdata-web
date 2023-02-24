const getState = function () {
  let state = JSON.parse(sessionStorage.getItem('classificationState'))
  return {
    connections: {
      panelFlag: state?.connections?.panelFlag || false,
      classification: state?.connections?.classification || []
    },
    migrate: {
      panelFlag: state?.migrate?.panelFlag || false,
      classification: state?.migrate?.classification || []
    },
    sync: {
      panelFlag: state?.sync?.panelFlag || false,
      classification: state?.sync?.classification || []
    }
  }
}

// 初始化 state
const state = getState()
console.log(state, '当前分类标签store')

// getters
const getters = {
  stateConnections: state => {
    return state.connections
  },
  stateMigrate: state => {
    return state.migrate
  },
  stateSync: state => {
    return state.sync
  }
}

// actions
const actions = {}

// mutations
const mutations = {
  /**
   * 设置标签
   * @param state
   * @param data
   */
  setTag(state, data) {
    let type = data?.type || 'connections'
    state[type].classification = data.value
    sessionStorage.setItem('classificationState', JSON.stringify(state))
  },

  /**
   * 设置数据脏状态
   * @param state
   * @param data
   */
  setPanelFlag(state, data) {
    let type = data?.type || 'connections'
    state[type].panelFlag = data.panelFlag
    sessionStorage.setItem('classificationState', JSON.stringify(state))
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
