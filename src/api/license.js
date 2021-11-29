/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from 'axios'

export default class Connections extends PublicAPI {
  constructor() {
    super('/api/Licenses')
  }

  getSid(ids) {
    return axios.get(`${this.url}/sid`, {
      params: {
        id: ids
      }
    })
  }

  updateLicense(params) {
    return axios.post(`${this.url}/upload`, params)
  }
}
