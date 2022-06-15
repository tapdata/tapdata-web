import Http from './http'
export default class notification extends Http {
  constructor() {
    super('/api/Messages')
  }
  // readAll(filter, update) {
  //   return axios.request({
  //     url: this.url + '/update?where=' + filter,
  //     method: 'post',
  //     data: update
  //   })
  // }
  pageRead(filter) {
    return axios.request({
      url: this.url,
      method: 'post',
      data: filter
    })
  }

  upsertWithWhere(filter, update) {
    return axios.request({
      url: this.url + '/update?where=' + filter,
      method: 'post',
      data: update
    })
  }
  readAll(params) {
    return axios.post(this.url + '/readAll', params)
  }
}
export { notification }
