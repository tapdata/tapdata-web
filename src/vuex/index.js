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
		tableSelectorSearch: ''
	},

	actions,

	mutations
});

export default store;
