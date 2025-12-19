import classification from '@tap/component/src/store'
import dataflow from '@tap/dag/src/store'
import overView from '@tap/ldp/src/store'
import { createStore } from 'vuex'
import actions from './actions'
import feature from './modules/feature'
import mutations from './mutations'

const store = createStore({
  // 全局变量
  state: {
    notification: {
      unRead: 0,
    },
    appVersion: '',
    appearance: {
      enableEnvTag: '',
      envTagContent: '',
      envTagColor: '',
    },
  },
  actions,

  mutations: {
    ...mutations,
    SET_APP_VERSION(state, version) {
      state.appVersion = version
    },
    setAppearance(state, appearance) {
      Object.assign(state.appearance, appearance)
    },
    setAppearanceBySetting(state, setting) {
      setting
        .filter((item) => {
          return item.category === 'Appearance'
        })
        .forEach((item) => {
          state.appearance[item.key] = item.value
        })
    },
  },

  modules: {
    dataflow,
    classification,
    overView,
    feature,
  },
})

export default store
