import Http from './http'

export class Users extends Http {
  constructor() {
    super('/api/users')
  }

  login(params) {
    return this.axios.post(`${this.url}/login`, params).then(this.useData)
  }

  getInfo() {
    return this.axios.get(`${this.url}/byToken`).then(this.useData)
  }
}
