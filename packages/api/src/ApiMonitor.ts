import Http from './Http'

export default class ApiMonitor extends Http {
  constructor() {
    super('/api/modules')
  }
  preview() {
    return this.axios.get(this.url + '/preview')
  }
  rankLists(params) {
    params = params || {}
    return this.axios.get(this.url + '/rankLists', { params })
  }
  apiList(params) {
    params = params || {}
    return this.axios.get(this.url + '/apiList', { params })
  }
  apiDetail(params) {
    return this.axios.post(this.url + '/apiDetail', params)
  }
  apiClientName() {
    return this.axios.get('/api/ApiCalls/findClients')
  }
}
export { ApiMonitor }
