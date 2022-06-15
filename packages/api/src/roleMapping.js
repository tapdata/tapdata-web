import Http from './http'

export default class RoleMappings extends Http {
  constructor() {
    super('/api/RoleMappings')
  }

  delete(id, name) {
    // return axios.delete(`${this.url}/${id}`)
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }
  post(params) {
    return axios.post(this.url, params)
  }
  saveAll(params) {
    return axios.post(this.url + '/saveAll', params)
  }
}
export { RoleMappings }
