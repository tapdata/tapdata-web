import * as Vue from 'vue'
import * as Vuex from 'vuex'
import dataflow from '@tap/dag/src/store'
import classification from '@tap/component/src/store'

const store = Vuex.createStore({
  modules: {
    dataflow,
    classification
  }
})

export default store
