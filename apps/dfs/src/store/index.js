import Vue from 'vue'
import Vuex from 'vuex'
import dataflow from '@daas/dag/src/store'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    dataflow
  }
})

export default store
