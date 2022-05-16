/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class UserLogsAPI extends PublicAPI {
  constructor() {
    super('/api/UserLogs')
  }

  post(params) {
    return axios.post(this.url, params)
  }
}
