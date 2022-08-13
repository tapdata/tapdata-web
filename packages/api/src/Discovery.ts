import Http from './Http'
import { isPlainObj } from '@tap/shared'
export default class Discovery extends Http {
  constructor() {
    super('/api/discovery')
  }
  list(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery', config)
  }
  overView(id: string) {
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery/storage/overview/' + id)
  }
  preview(id: string) {
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery/storage/preview/' + id)
  }
  filterList(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery/filterList', config)
  }
  discoveryList(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery/directory/data', config)
  }
}
export { Discovery }
