import axios from 'axios'

const CancelToken = axios.CancelToken
export default class Http {
  constructor(url) {
    this.url = url
    this.axios = axios
  }

  count(params) {
    return this.axios.get(this.url + '/count', { params }).then(this.useData)
  }

  patch(params) {
    return this.axios.patch(this.url, params).then(this.useData)
  }

  updateById(id, attributes) {
    return this.axios.patch(this.url + '/' + id, attributes).then(this.useData)
  }

  /**
   *
   * @param where 	Criteria to match model instances
   * @param attributes	An object of model property name/value pairs
   * @return {Promise<AxiosResponse<T>>}
   */
  update(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)

    return this.axios.post(this.url + '/update?where=' + encodeURIComponent(where), attributes).then(this.useData)
  }

  get(params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      let qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return this.axios.get(this.url + '/' + params.join('/') + qs).then(this.useData)
    }
    params = params || {}
    return this.axios.get(this.url, { params }).then(this.useData)
  }

  delete(id) {
    return this.axios.delete(`${this.url}/${id}`).then(this.useData)
  }

  post(params) {
    return this.axios.post(this.url, params).then(this.useData)
  }

  findOne(params) {
    params = params || {}
    return this.axios.get(this.url + '/findOne', { params }).then(this.useData)
  }

  useData(response) {
    return response.data
  }
}
export { CancelToken }
