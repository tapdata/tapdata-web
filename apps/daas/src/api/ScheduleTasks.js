/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/18
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class TaskHistoriesAPI extends PublicAPI {
  constructor() {
    super('/api/ScheduleTasks')
  }

  post(params) {
    return axios.post(this.url, params)
  }
}
