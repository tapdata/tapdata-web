import Http from './Http'
import { isPlainObj } from '@tap/shared'
export default class AlarmAPI extends Http {
  constructor() {
    super('/api/alarm')
  }
  listTask() {
    return this.axios.get(`${this.url}/list_task`)
  }

  list(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get(`${this.url}/list`, config)
  }
  close(ids) {
    return this.axios.post(`${this.url}/close?ids=${ids}`)
  }
  channels() {
    return this.axios.get(`${this.url}/channels`)
  }
}
export { AlarmAPI }
