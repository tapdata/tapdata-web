const mutations = {
	dataFlows(state, payload) {
		state.dataFlows = payload;
	},
	delDataFlows(state, payload) {
		state.dataFlows = payload;
	},
	tableSelector(state, payload) {
		state.tableSelectorSearch = payload;
	}
};
export default mutations;
