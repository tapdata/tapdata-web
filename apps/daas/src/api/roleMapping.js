/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class RoleMappings extends PublicAPI {
  constructor() {
    super('/api/RoleMappings')
  }

  delete(id, name) {
    // return axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }
  post(params) {
    return axios.post(this.url, params)
  }
  saveAll(params) {
    return axios.post(this.url + '/saveAll', params)
  }
}
