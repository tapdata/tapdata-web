import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
import dataflow from '@tap/dag/src/store'
import classification from '@tap/component/src/store'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 全局变量
  actions,

  mutations,

  modules: {
    dataflow,
    classification
  }
})

export default store
