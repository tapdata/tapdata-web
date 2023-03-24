/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Http from './Http'

export default class TCM extends Http {
  constructor() {
    super('/api/tcm')
  }
  //获取实例列表
  getAgent() {
    return this.axios.get(this.url + '/agent')
  }
  getAgentCount() {
    return this.axios.get(this.url + '/agent/agentCount')
  }
  //h获取可用区
  getRegion() {
    return this.axios.get(this.url + '/region')
  }
  //h获取可用区
  productVip(params) {
    return this.axios.get(this.url + '/product/vip', { params })
  }
  //实例相关地区列表
  getRegionZone() {
    return this.axios.get(this.url + '/agent/regionZone')
  }
  //vpc列表
  getVpcList(id) {
    return this.axios.get(this.url + '/vpc/list/' + id)
  }
  //创建网络策略
  strategy(params) {
    return this.axios.post(this.url + '/strategy', params)
  }
  //ecs列表
  getEcsList(id, params) {
    return this.axios.get(this.url + '/ecs/list/' + id, { params })
  }
  // 当前可用阿里云授权码
  licenseAvailable(params) {
    return this.axios.get(`${this.url}/license/available`, { params })
  }
}
export { TCM }
