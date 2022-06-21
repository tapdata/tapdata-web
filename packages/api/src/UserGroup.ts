import Http from './Http'

export default class UserGroups extends Http {
  constructor() {
    super('/api/UserGroups')
  }
  get(params) {
    if (Array.isArray(params)) {
      return this.axios.get(this.url + '/' + params.join('/'))
    }
    if (params.url) {
      const url = params.url
      delete params.url
      return this.axios.get(url, { params })
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }
  count(params) {
    return this.axios.get(this.url + '/count', { params })
  }
  patch(data) {
    return this.axios.patch(this.url + '/' + data.id, data)
  }
  delete(params) {
    return this.axios.delete(`${this.url}/` + params.id, params)
  }
}
export { UserGroups }
