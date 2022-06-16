import Http from './http'

export default class RoleMappings extends Http {
  constructor() {
    super('/api/RoleMappings')
  }

  delete(id, name) {
    // return this.this.axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return this.axios.delete(`${this.url}/${id}`)
    } else {
      return this.axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }
  post(params) {
    return this.axios.post(this.url, params)
  }
  saveAll(params) {
    return this.axios.post(this.url + '/saveAll', params)
  }
}
export { RoleMappings }
