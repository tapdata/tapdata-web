const mutations = {
    dataFlows (state, payload) {
      state.dataFlows = payload
    },
    delDataFlows (state, payload) {
      state.dataFlows = ''
    }
}
export default mutations
