import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
import dataflow from '@daas/dag/src/store'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 全局变量
  state: {
    notification: {
      unRead: 0
    },
    tableFlows: {
      flowId: '',
      keyword: '',
      status: '',
      way: '',
      executionStatus: ''
    },
    dataFlows: {
      search: '',
      timeData: [],
      status: '',
      person: '',
      classification: []
    },
    tableSelectorSearch: '',
    apiModules: {
      status: '',
      selectedSeachType: '',
      searchForKeyWord: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    apiDataExplorer: {
      api_server_process_id: '',
      selectedSeachType: '',
      dataExpDesc: '',
      dataExpSortBy: '',
      dataExpRowsPerPage: ''
    },
    apiAnalysis: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    application: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    apiServer: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    connections: {
      iModel: 'fuzzy',
      databaseType: '',
      keyword: '',
      databaseModel: '',
      status: '',
      panelFlag: true
    },
    createConnection: {
      databaseType: ''
    },
    metadata: {
      keyword: '',
      isFuzzy: true,
      metaType: '',
      db: ''
    },
    metadataDefinition: {
      selectedMetaType: '',
      selectedSeachType: '',
      keyword: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    dataQuality: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    ttl: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    dataRules: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    dataCollect: {
      keyword: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    tasks: {
      keyword: '',
      selectedSeachType: '',
      rowsPerPage: '',
      descending: '',
      sortBy: ''
    },
    dataVerification: {
      keyword: '',
      inspectMethod: '',
      mode: '',
      enabled: '',
      result: ''
    }
  },

  actions,

  mutations,

  modules: {
    dataflow
  }
})

export default store
