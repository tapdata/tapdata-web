import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
import dataflow from '@tap/dag/src/store'
import classification from '@tap/component/src/store'
import overView from '@tap/ldp/src/store'
import feature from './modules/feature'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 全局变量
  state: {
    notification: {
      unRead: 0
    }
  },
  actions,

  mutations,

  modules: {
    dataflow,
    classification,
    overView,
    feature
  }
})

export default store
