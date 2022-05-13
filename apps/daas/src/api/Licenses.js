/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class Licenses extends PublicAPI {
  constructor() {
    super('/api/Licenses')
  }

  expires(params) {
    return axios.get(this.url + '/expires', params)
  }

  getSid(ids) {
    return axios.get(`${this.url}/sid`, {
      params: {
        id: JSON.stringify(ids)
      }
    })
  }

  updateLicense(params) {
    return axios.post(`${this.url}/upload`, params)
  }
}
