import Http from './Http'
import { isPlainObj } from '@tap/shared'
export default class Notification extends Http {
  constructor() {
    super('/api/Messages')
  }
  // readAll(filter, update) {
  //   return this.axios.request({
  //     url: this.url + '/update?where=' + filter,
  //     method: 'post',
  //     data: update
  //   })
  // }
  pageRead(filter) {
    return this.axios.request({
      url: this.url,
      method: 'post',
      data: filter
    })
  }

  upsertWithWhere(filter, update) {
    return this.axios.request({
      url: this.url + '/update?where=' + filter,
      method: 'post',
      data: update
    })
  }
  readAll(params) {
    return this.axios.post(this.url + '/readAll', params)
  }
  list(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get(this.url + '/list', config)
  }
}
export { Notification }
