import Http from './http'
export default class Roles extends Http {
  constructor() {
    super('/api/roles')
  }

  post(params) {
    return axios.post(this.url, params)
  }

  patch(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }

  delete(id, name) {
    if (name == '') {
      return axios.delete(`${this.url}/${id}`)
    } else {
      return axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }

  principals(id) {
    return axios.delete(`${this.url}/${id}/principals`)
  }
}
export { Roles }
