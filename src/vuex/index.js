import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from "vuex-persistedstate";
import mutations from './mutations';
import actions from "./actions";

Vue.use(Vuex);

const store = new Vuex.Store({

  plugins:[
    createPersistedState({
      key: 'tapdata',
      storage: window.sessionStorage || window.localStorage || {
        getItem: (key)=>{},
        setItem: (key, value)=>{},
        removeItem: (key, value)=>{},
      }
    }),
  ],

  // 全局变量
  state: {
    dataFlows:{
      search: '',
      timeData: [],
      status: '',
      person: '',
      classification: [],
    }
  },

 actions,

 mutations,

});

export default store;
