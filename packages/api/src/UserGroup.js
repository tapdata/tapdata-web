import Http from './http'

export default class UserGroups extends Http {
  constructor() {
    super('/api/UserGroups')
  }
  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    if (params.url) {
      let url = params.url
      delete params.url
      return axios.get(url, { params })
    }
    params = params || {}
    return axios.get(this.url, { params })
  }
  count(params) {
    return axios.get(this.url + '/count', { params })
  }
  patch(data) {
    return axios.patch(this.url + '/' + data.id, data)
  }
  delete(params) {
    return axios.delete(`${this.url}/` + params.id, params)
  }
}
export { UserGroups }
