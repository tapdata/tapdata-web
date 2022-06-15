/**
/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'
export default class ApiCalls extends PublicAPI {
  constructor() {
    super('/api/ApiCalls')
  }

  getAllMethod(params) {
    return axios.get(this.url + '/getAllMethod', { params })
  }

  getAllResponseCode(params) {
    return axios.get(this.url + '/getAllResponseCode', { params })
  }
}
