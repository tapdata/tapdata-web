const getState = function () {
  const state = JSON.parse(sessionStorage.getItem('classificationState'))
  return {
    connections: {
      panelFlag: state?.connections?.panelFlag || false,
      classification: state?.connections?.classification || [],
      sortField: state?.connections?.sortField || 'name',
      sortOrder: state?.connections?.sortOrder || 'asc',
      panelWidth: state?.connections?.panelWidth || 240,
    },
    migrate: {
      panelFlag: state?.migrate?.panelFlag || false,
      classification: state?.migrate?.classification || [],
      sortField: state?.migrate?.sortField || 'name',
      sortOrder: state?.migrate?.sortOrder || 'asc',
      panelWidth: state?.migrate?.panelWidth || 240,
    },
    sync: {
      panelFlag: state?.sync?.panelFlag || false,
      classification: state?.sync?.classification || [],
      sortField: state?.sync?.sortField || 'name',
      sortOrder: state?.sync?.sortOrder || 'asc',
      panelWidth: state?.sync?.panelWidth || 240,
    },
    inspect: {
      panelFlag: state?.inspect?.panelFlag || false,
      classification: state?.inspect?.classification || [],
      sortField: state?.inspect?.sortField || 'name',
      sortOrder: state?.inspect?.sortOrder || 'asc',
      panelWidth: state?.inspect?.panelWidth || 240,
    },
  }
}

// 初始化 state
const state = getState()

// getters
const getters = {
  stateConnections: (state) => {
    return state.connections
  },
  stateMigrate: (state) => {
    return state.migrate
  },
  stateSync: (state) => {
    return state.sync
  },
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
    const type = data?.type || 'connections'
    state[type].classification = data.value
    sessionStorage.setItem('classificationState', JSON.stringify(state))
  },

  /**
   * 设置数据脏状态
   * @param state
   * @param data
   */
  setPanelFlag(state, data) {
    const type = data?.type || 'connections'
    state[type].panelFlag = data.panelFlag
    sessionStorage.setItem('classificationState', JSON.stringify(state))
  },

  /**
   * 设置排序规则
   * @param state
   * @param data
   */
  setSort(state, data) {
    const type = data?.type || 'connections'
    if (data.sortField !== undefined) {
      state[type].sortField = data.sortField
    }
    if (data.sortOrder !== undefined) {
      state[type].sortOrder = data.sortOrder
    }
    sessionStorage.setItem('classificationState', JSON.stringify(state))
  },

  /**
   * 设置面板宽度
   * @param state
   * @param data
   */
  setPanelWidth(state, data) {
    const type = data?.type || 'connections'
    state[type].panelWidth = data.panelWidth
    sessionStorage.setItem('classificationState', JSON.stringify(state))
  },
}

export default {
  // 加上命名空间
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
