import Http from './Http'

export default class DataPermission extends Http {
  constructor() {
    super('/api/data-permission')
  }
  roleActions(params: unknown) {
    return this.axios.get(`${this.url}/role-actions`, { params })
  }
  dataAuth(params: unknown) {
    return this.axios.post(`${this.url}/data-auth`, params)
  }
}
export { DataPermission }
