import Http from './Http'

export default class ApiServers extends Http {
  constructor() {
    super('/api/ApiServers')
  }
  findOne(params) {
    params = params || {}
    return this.axios.get(this.url + '/findOne', { params })
  }
  patch(params) {
    return this.axios.patch(this.url, params)
  }
  count(params) {
    return this.axios.get(this.url + '/count', { params })
  }
  get(params) {
    if (Array.isArray(params)) {
      return this.axios.get(this.url + '/' + params.join('/'))
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }
  delete(id, name) {
    // return axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return this.axios.delete(`${this.url}/${id}`)
    } else {
      return this.axios.delete(`${this.url}/${id}?clientName=${name}`)
    }
  }
  post(params) {
    if (params.uri) {
      return this.axios.post(`${this.url}/${params.uri}`, params)
    }
    return this.axios.post(this.url, params)
  }
}
export { ApiServers }
