/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import axios from 'axios'
import PublicAPI from './publicApi'

export default class Connections extends PublicAPI {
  constructor() {
    super('/api/Connections')
  }
  customQuery(id, params) {
    let url = `${this.url}/${id}` + '/customQuery?'
    for (let item in params) {
      url += item + '=' + params[item] + '&'
    }
    return axios.get(url)
  }
  copy(id, params) {
    return axios.post(this.url + '/' + id + '/copy', params)
  }
  deleteConnection(id, name) {
    return axios.delete(`${this.url}/${id}?name=${name}`)
  }
  batchUpdateListtags(params) {
    return axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  check(id, params) {
    return axios.patch(`${this.url}/${id}`, params)
  }
  patchId(params) {
    let id = params._id || params.id
    delete params._id
    delete params.id
    return axios.patch(`${this.url}/${id}`, params)
  }
  update(params) {
    return axios.post(
      `${this.url}/update?where=` +
        encodeURIComponent(JSON.stringify({ _id: params.id })),
      params
    )
  }
}
