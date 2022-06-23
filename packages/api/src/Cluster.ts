// 集群管理
import Http from './Http'

export class Cluster extends Http {
  constructor() {
    super('/api/clusterStates')
  }
  updateStatus(params: unknown) {
    return this.axios.post(this.url + '/updataStatus', params)
  }
  addMonitor(params: unknown) {
    return this.axios.post(this.url + '/addMonitor', params)
  }
  removeMonitor(params: unknown) {
    return this.axios.post(this.url + '/removeMonitor', params)
  }
  editMonitor(params: unknown) {
    return this.axios.post(this.url + '/editMonitor', params)
  }
  editAgent(id: string, params: unknown) {
    return this.axios.patch(this.url + '/' + id, params)
  }
  findAccessNodeInfo(params: unknown) {
    return this.axios.get(this.url + '/findAccessNodeInfo', { params })
  }
}
export default Cluster
