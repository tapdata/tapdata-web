import axios from '@/plugins/axios'
export default class PublicAPI {
  constructor(url) {
    this.url = url
  }

  count(params) {
    return axios.get(this.url + '/count', { params })
  }

  patch(params) {
    return axios.patch(this.url, params)
  }

  updateById(id, attributes) {
    return axios.patch(this.url + '/' + id, attributes)
  }

  /**
   *
   * @param where 	Criteria to match model instances
   * @param attributes	An object of model property name/value pairs
   * @return {Promise<AxiosResponse<T>>}
   */
  update(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)

    return axios.post(this.url + '/update?where=' + encodeURIComponent(where), attributes)
  }

  get(params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      let qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return axios.get(this.url + '/' + params.join('/') + qs)
    }
    params = params || {}
    return axios.get(this.url, { params })
  }

  delete(id) {
    return axios.delete(`${this.url}/${id}`)
  }

  post(params) {
    return axios.post(this.url, params)
  }

  findOne(params) {
    params = params || {}
    return axios.get(this.url + '/findOne', { params })
  }
}
