/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class Roles extends PublicAPI {
  constructor() {
    super('/api/roles')
  }

  post(params) {
    return axios.post(this.url, params)
  }

  patch(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }

  delete(id, name) {
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }

  principals(id) {
    return axios.delete(`${this.url}/${id}/principals`)
  }
}
