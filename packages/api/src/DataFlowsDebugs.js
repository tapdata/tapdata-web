import Http from './http'

export default class DataFlowsDebugs extends Http {
  constructor() {
    super('/api/DataFlowsDebugs')
  }

  getTables(params) {
    return axios.get(this.url + '/getTables', { params: params })
  }
}
export { DataFlowsDebugs }
