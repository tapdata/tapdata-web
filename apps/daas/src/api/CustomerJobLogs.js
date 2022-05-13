/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class CustomerJobLogs extends PublicAPI {
  constructor() {
    super('/api/CustomerJobLogs')
  }
  solutions(params) {
    return axios.get(this.url + '/solutions', { params })
  }
}
