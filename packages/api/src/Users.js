import Http from './http'

export class Users extends Http {
  constructor() {
    super('/api/users')
  }

  getPermissions(userId) {
    return this.axios.get(`${this.url}/${userId}/permissions`).then(this.useData)
  }
}
