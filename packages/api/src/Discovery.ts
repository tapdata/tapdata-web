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
    return this.axios.get(this.url, config)
  }
  overViewStorage(id: string) {
    return this.axios.get(`${this.url}/storage/overview/${id}`)
  }
  overViewTask(id: string) {
    return this.axios.get(`${this.url}/task/overview/${id}`)
    //return this.axios.get(`https://mock.apifox.cn/m1/1293445-0-default/api/discovery/task/overview/`)
  }
  overViewApi(id: string) {
    return this.axios.get(`${this.url}/api/overview/${id}`)
    // return this.axios.get(`https://mock.apifox.cn/m1/1293445-0-default/api/discovery/api/overview/`)
  }
  preview(id: string) {
    return this.axios.get(`${this.url}/storage/preview/${id}`)
  }
  filterList(filterType) {
    return this.axios.get(`${this.url}/filterList?filterType=${filterType}`)
  }
  discoveryList(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get(`${this.url}/directory/data`, config)
  }
  postTags(params) {
    return this.axios.post(`${this.url}/tags`, params)
  }
  patchTags(params) {
    return this.axios.patch(`${this.url}/tags`, params)
  }
}
export { Discovery }
