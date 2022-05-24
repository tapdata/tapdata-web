/**
/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class ApplicationsAPI extends PublicAPI {
  constructor() {
    super('/api/Applications')
  }

  delete(id, name) {
    // return axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }

  findOne(params) {
    params = params || {}
    return axios.get(this.url + '/findOne', { params })
  }
}
