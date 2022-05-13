/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class UserGroupsAPI extends PublicAPI {
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
