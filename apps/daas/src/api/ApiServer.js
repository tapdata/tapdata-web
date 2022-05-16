import axios from '@/plugins/axios'
import PublicApi from './publicApi'

export default class ApiServersAPI extends PublicApi {
  constructor() {
    super('/api/ApiServers')
  }
  findOne(params) {
    params = params || {}
    return axios.get(this.url + '/findOne', { params })
  }
  patch(params) {
    return axios.patch(this.url, params)
  }
  count(params) {
    return axios.get(this.url + '/count', { params })
  }
  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    params = params || {}
    return axios.get(this.url, { params })
  }
  delete(id, name) {
    // return axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?clientName=${name}`)
    }
  }
  post(params) {
    if (params.uri) {
      return axios.post(`${this.url}/${params.uri}`, params)
    }
    return axios.post(this.url, params)
  }
}
