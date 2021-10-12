import Vue from 'vue'
import Vuex from 'vuex'
import dataflow from 'web-core/store/modules/dataflow'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    dataflow
  }
})

export default store
