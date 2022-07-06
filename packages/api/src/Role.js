import Http from './Http'
export default class Roles extends Http {
  constructor() {
    super('/api/roles')
  }

  post(params) {
    return this.axios.post(this.url, params)
  }

  patch(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }

  principals(id) {
    return this.axios.delete(`${this.url}/${id}/principals`)
  }
}
export { Roles }
