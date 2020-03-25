const mutations = {
    dataFlows (state, payload) {
      state.dataFlows = payload;
      sessionStorage.dataFlows = payload;
    },
    delDataFlows (state, payload) {
      state.dataFlows = payload;
      sessionStorage.removeItem='';
    }
};
export default mutations;
