const actions = {
  dataFlows (context, payload) {
          context.commit('login', payload);
        },
  delDataFlows (context) {
          context.commit('logout');
        }
}
export default actions
