/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class DataFlowInsights extends PublicAPI {
  constructor() {
    super('/api/DataFlowInsights')
  }

  runtimeMonitor(params) {
    return axios.get(this.url + '/runtimeMonitor', params)
  }
}
