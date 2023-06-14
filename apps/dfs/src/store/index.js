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
  }
})

export default store
