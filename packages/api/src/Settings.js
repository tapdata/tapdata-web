import Http from './Http'

export default class Settings extends Http {
  constructor() {
    super('/api/Settings')
  }
  getRegistryPolicy() {
    return this.axios.get(`${this.url}/getRegistryPolicy`)
  }
  patch(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }

  settingPatch(params) {
    return this.axios.patch(`${this.url}`, params)
  }
  testEmail() {
    return this.axios.post(`${this.url}/testEmail`)
  }
  save(params) {
    return this.axios.patch(`${this.url}/save`, params)
  }
  getObjectId() {
    return this.axios.post(`${this.url}/ObjectId`)
  }
  findOne(id) {
    return this.axios.get(`${this.url}/${id}`)
  }
  enterpriseUpdate(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)
    return this.axios.post(this.url + '/enterpriseUpdate?where=' + encodeURIComponent(where), attributes)
  }

  findAlarm() {
    return this.axios.get(`${this.url}/alarm_find`)
  }
  saveAlarm(params) {
    return this.axios.post(`${this.url}/alarm_save`, params)
  }
  updateAlarm(params) {
    return this.axios.patch(`${this.url}/alarm_update`, params)
  }
}
export { Settings }
