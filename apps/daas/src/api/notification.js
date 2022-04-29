/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/18
 * @description
 */
import PublicAPI from './publicApi'
import axios from 'axios'

export default class notification extends PublicAPI {
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
  pageRead(filter, update) {
    return axios.request({
      url: this.url + '?where=' + filter,
      method: 'post',
      data: update
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
