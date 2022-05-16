/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/18
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class Settings extends PublicAPI {
  constructor() {
    super('/api/Settings')
  }

  getRegistryPolicy() {
    return axios.get(`${this.url}/getRegistryPolicy`)
  }
  patch(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }

  settingPatch(params) {
    return axios.patch(`${this.url}`, params)
  }
  testEmail() {
    return axios.post(`${this.url}/testEmail`)
  }
  save(params) {
    return axios.patch(`${this.url}/save`, params)
  }
  getObjectId() {
    return axios.post(`${this.url}/ObjectId`)
  }
  findOne(id) {
    return axios.get(`${this.url}/${id}`)
  }
  enterpriseUpdate(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)
    return axios.post(this.url + '/enterpriseUpdate?where=' + encodeURIComponent(where), attributes)
  }
}
