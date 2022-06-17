// 集群管理
import Http from './Http'

export class Cluster extends Http {
  constructor() {
    super('/api/clusterStates')
  }
  updateStatus(params) {
    return this.axios.post(this.url + '/updataStatus', params).then(this.useData)
  }
  addMonitor(params) {
    return this.axios.post(this.url + '/addMonitor', params).then(this.useData)
  }
  removeMonitor(params) {
    return this.axios.post(this.url + '/removeMonitor', params).then(this.useData)
  }
  editMonitor(params) {
    return this.axios.post(this.url + '/editMonitor', params).then(this.useData)
  }
  editAgent(id, params) {
    return this.axios.patch(this.url + '/' + id, params).then(this.useData)
  }
  findAccessNodeInfo(params) {
    return this.axios.get(this.url + '/findAccessNodeInfo', { params }).then(this.useData)
  }
}
export default Cluster
