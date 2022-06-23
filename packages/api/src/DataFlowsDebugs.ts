import Http from './Http'

export default class DataFlowsDebugs extends Http {
  constructor() {
    super('/api/DataFlowsDebugs')
  }

  getTables(params: unknown) {
    return this.axios.get(this.url + '/getTables', { params: params })
  }
}
export { DataFlowsDebugs }
