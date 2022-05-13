/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class Measurement extends PublicAPI {
  constructor() {
    super('/api/measurement')
  }
  query(params) {
    return axios.post(this.url + '/query', params)
  }
  queryTransmitTotal() {
    return axios.get(this.url + '/queryTransmitTotal')
  }
}
