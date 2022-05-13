// 集群管理
import Http from './http'

export class Cluster extends Http {
  constructor() {
    super('/api/clusterStates')
  }
  updateStatus(params) {
    return this.axios.post(this.url + '/updataStatus', params)
  }
  addMonitor(params) {
    return this.axios.post(this.url + '/addMonitor', params)
  }
  removeMonitor(params) {
    return this.axios.post(this.url + '/removeMonitor', params)
  }
  editMonitor(params) {
    return this.axios.post(this.url + '/editMonitor', params)
  }
  editAgent(id, params) {
    return this.axios.patch(this.url + '/' + id, params)
  }
  findAccessNodeInfo(params) {
    return this.axios.get(this.url + '/findAccessNodeInfo', { params })
  }
}
