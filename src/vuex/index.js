import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
	plugins: [
		createPersistedState({
			key: 'tapdata',
			storage: window.localStorage || {
				getItem: () => {},
				setItem: () => {},
				removeItem: () => {}
			}
		})
	],

	// 全局变量
	state: {
		dataFlows: {
			panelFlag: true,
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
			imodel: '',
			datatypemodel: '',
			keyword: '',
			selectedSeachType: '',
			rowsPerPage: '',
			descending: '',
			sortBy: ''
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
			compareMethod: '',
			mode: '',
			active: ''
		}
	},

	actions,

	mutations
});

export default store;
