import { licensesApi } from '@tap/api'
import { getSettingByKey } from '@tap/shared/src/settings'

const MENU_FEATURE_MAP = {
  dataService: 'dataService',
  sharedCacheList: 'shareCache',
  functionList: 'customFunction',
  customNodeList: 'customNode',
  sharedMiningList: 'shareCdc',
  migrateList: 'dataMigrate',
  dataConsole: 'realTimeDataService',
  roleList: 'roleManage',
  users: 'userManage',
  externalStorage: 'externalStorage',
  webhookAlerts: 'webhookAlerts',
}

const TYPE2NAME = {
  LITE: 'Live Integration',
  OP: 'Live Data Platform',
  SERVICE: 'Live Service',
}

const getState = function () {
  return {
    licenseType: '',
    features: [],
  }
}

// 初始化 state
const state = getState()

// getters
const getters = {
  licenseType: (state) => {
    return state.licenseType
  },
  features: (state) => {
    return state.features
  },
  featureMap: (state) => {
    return state.features.reduce((acc, feature) => {
      acc[feature.type] = acc[feature.type] || []
      acc[feature.type].push(feature.code)
      return acc
    }, {})
  },
  connectors: (state, getters) => {
    return getters.featureMap.CONNECTOR || []
  },
  hasMenu: (state, getters) => {
    return (code) => {
      return getters.featureMap.MENU?.includes(code)
    }
  },
  hasFeature: (state, getters) => {
    return (code) => {
      return (
        !getters.isControlEnabled || getters.featureMap.FEATURE?.includes(code)
      )
    }
  },
  isMenuEnabled: (state, getters) => (menuName) => {
    if (!getters.isControlEnabled) {
      return true
    }

    const menuCode = MENU_FEATURE_MAP[menuName]
    if (!menuCode) {
      return true
    }

    return getters.hasMenu(menuCode)
  },
  isControlEnabled: (state) => {
    return state.licenseType === 'LITE' || state.licenseType === 'SERVICE'
  },
  versionName: (state) => {
    return TYPE2NAME[state.licenseType]
  },
}

// actions
const actions = {
  async getFeatures({ commit }) {
    if (
      getSettingByKey('checkLicense') === 'false' ||
      import.meta.env.DEV ||
      import.meta.env.VUE_APP_MODE === 'community'
    ) {
      commit('setFeatures', {
        licenseType: 'OP',
        features: [],
      })
      return
    }
    const data = await licensesApi.getFeatures()
    commit('setFeatures', data)
  },
}

// mutations
const mutations = {
  setFeatures(state, data) {
    state.licenseType = data.licenseType
    state.features = data.features
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
