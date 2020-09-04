const mutations = {
	dataFlows(state, payload) {
		state.dataFlows = payload;
	},
	delDataFlows(state, payload) {
		state.dataFlows = payload;
	},
	tableSelector(state, payload) {
		state.tableSelectorSearch = payload;
	},
	tableFlows(state, payload) {
		state.tableFlows = payload;
	}
};
export default mutations;
