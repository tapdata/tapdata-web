import Http from './http'
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
}
export { Notification }
