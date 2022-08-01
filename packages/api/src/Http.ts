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

  patch(params: unknown) {
    return this.axios.patch(this.url, params)
  }

  updateById(id: string, attributes: unknown) {
    return this.axios.patch(this.url + '/' + id, attributes)
  }

  /**
   *
   * @param where 	Criteria to match model instances
   * @param attributes	An object of model property name/value pairs
   * @return {Promise<AxiosResponse<T>>}
   */
  update(where: unknown, attributes: unknown) {
    let queryStr = ''
    if (typeof where === 'object') {
      queryStr = JSON.stringify(where)
    }
    if (typeof where === 'string') {
      queryStr = where
    }
    return this.axios.post(this.url + '/update?where=' + encodeURIComponent(queryStr), attributes)
  }

  get(params: unknown, filter: unknown) {
    if (Array.isArray(params)) {
      let queryStr = ''
      if (typeof filter === 'object') {
        queryStr = JSON.stringify(filter)
      } else if (typeof filter === 'string') {
        queryStr = filter
      }
      const qs = queryStr ? '?filter=' + encodeURIComponent(queryStr) : ''
      return this.axios.get(this.url + '/' + params.join('/') + qs)
    } else if (typeof params === 'string') {
      return this.axios.get(this.url + '/' + params)
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }

  delete(id: string) {
    return this.axios.delete(`${this.url}/${id}`)
  }

  post(params: unknown) {
    return this.axios.post(this.url, params)
  }

  findOne(params: unknown) {
    params = params || {}
    return this.axios.get(this.url + '/findOne', { params })
  }
}
export { CancelToken }
