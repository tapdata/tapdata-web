import Http from './Http'

export default class DataFlows extends Http {
  constructor() {
    super('/api/DataFlows')
  }
  relatedDataFlows(params: unknown) {
    return this.axios.get(this.url + '/relatedDataFlows', { params })
  }
}
export { DataFlows }
