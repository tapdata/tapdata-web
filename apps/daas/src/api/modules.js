/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class Modules extends PublicAPI {
  constructor() {
    super('/api/Modules')
  }
  post(params, name) {
    if (name) {
      return axios.post(`${this.url}/${params.uri}`, params)
    }

    if (params.uri) {
      return axios.post(`${this.url}/${params.uri}`, params)
    }

    return axios.post(this.url, params)
  }

  delete(id, name) {
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?tablename=${name}`)
    }
  }

  getApiDocument(id) {
    return axios.get(this.url + '/getApiDocument?id=' + id)
  }

  getByCollectionName(params) {
    return axios.get(this.url + '/api/getByCollectionName', { params })
  }

  getSchema(id) {
    return axios.get(this.url + '/getSchema/' + id)
  }

  getdata(id) {
    return axios.get(this.url + '/getSchema/' + id.mondeid)
  }

  batchUpdateListtags(params) {
    return axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
}
