/**
/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class ClusterAPI extends PublicAPI {
  constructor() {
    super('/api/clusterStates')
  }

  updateStatus(params) {
    return axios.post(this.url + '/updataStatus', params)
  }

  addMonitor(params) {
    return axios.post(this.url + '/addMonitor', params)
  }

  removeMonitor(params) {
    return axios.post(this.url + '/removeMonitor', params)
  }

  editMonitor(params) {
    return axios.post(this.url + '/editMonitor', params)
  }
  editAgent(id, params) {
    return axios.patch(this.url + '/' + id, params)
  }
  findAccessNodeInfo(params) {
    return axios.get(this.url + '/findAccessNodeInfo', { params })
  }
}
