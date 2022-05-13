import axios from '@/plugins/axios'
import PublicApi from './publicApi'

export default class ApiMonitorAPI extends PublicApi {
  constructor() {
    super('/api/modules')
  }
  preview() {
    return axios.get(this.url + '/preview')
  }
  rankLists(params) {
    params = params || {}
    return axios.get(this.url + '/rankLists', { params })
  }
  apiList(params) {
    params = params || {}
    return axios.get(this.url + '/apiList', { params })
  }
  apiDetail(params) {
    return axios.post(this.url + '/apiDetail', params)
  }
  apiClientName() {
    return axios.get('/api/ApiCalls/findClients')
  }
}
