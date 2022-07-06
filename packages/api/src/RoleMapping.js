import Http from './Http'

export default class RoleMappings extends Http {
  constructor() {
    super('/api/RoleMappings')
  }

  post(params) {
    return this.axios.post(this.url, params)
  }
  saveAll(params) {
    return this.axios.post(this.url + '/saveAll', params)
  }
}
export { RoleMappings }
