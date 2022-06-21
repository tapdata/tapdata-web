import axios, { AxiosInstance } from 'axios'

const CancelToken = axios.CancelToken
export default class Http {
  url: string
  axios: AxiosInstance

  constructor(url: string) {
    this.url = url
    this.axios = axios
  }

  count(params: unknown) {
    return this.axios.get(this.url + '/count', { params })
  }

  patch(params) {
    return this.axios.patch(this.url, params)
  }

  updateById(id, attributes) {
    return this.axios.patch(this.url + '/' + id, attributes)
  }

  /**
   *
   * @param where 	Criteria to match model instances
   * @param attributes	An object of model property name/value pairs
   * @return {Promise<AxiosResponse<T>>}
   */
  update(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)

    return this.axios.post(this.url + '/update?where=' + encodeURIComponent(where), attributes)
  }

  get(params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      const qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return this.axios.get(this.url + '/' + params.join('/') + qs)
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }

  delete(id) {
    return this.axios.delete(`${this.url}/${id}`)
  }

  post(params) {
    return this.axios.post(this.url, params)
  }

  findOne(params) {
    params = params || {}
    return this.axios.get(this.url + '/findOne', { params })
  }
}
export { CancelToken }
