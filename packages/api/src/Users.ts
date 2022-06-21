import Http from './Http'

export default class Users extends Http {
  constructor() {
    super('/api/users')
  }

  login(params) {
    return this.axios.post(this.url + '/login', params)
  }
  logout(params) {
    return this.axios.post(this.url + '/logout', params)
  }
  post(params) {
    return this.axios.post(this.url, params)
  }
  getUserById(params) {
    return this.axios.get(this.url + params)
  }
  getPermissions(params) {
    return this.axios.get(this.url + params)
  }

  reset(params) {
    return this.axios.post(this.url + '/reset', params)
  }

  changePassword(params) {
    return this.axios.post(this.url + '/change-password', params)
  }

  patch(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }

  resetPassword(params) {
    return this.axios.post(this.url + '/reset-password', params)
  }

  checktoken() {
    return this.axios.get(this.url + '/checktoken')
  }

  newResetPassword(token) {
    return this.axios.post(this.url + '/newResetPassword?access_token=' + token)
  }

  confirm(id, token) {
    return this.axios.get(`${this.url}/confirm?uid=${id}&token=${token}`)
  }

  sendVerifyEmail(params) {
    return this.axios.post(this.url + '/sendVerifyEmail', params)
  }

  deletePermissionRoleMapping(id, params) {
    return this.axios.delete(`${this.url}/deletePermissionRoleMapping?id=${id}`, params)
  }

  role(params) {
    return this.axios.get(this.url + '/roles', { params })
  }

  upsertWithWhere(where, params) {
    return this.axios.post(this.url + '/upsertWithWhere?where=' + encodeURIComponent(JSON.stringify(where)), params)
  }

  isCompleteGuide(id) {
    return this.axios.patch(this.url + '/isCompleteGuide?id=' + id)
  }

  getUserInfo() {
    return this.axios.get(this.url + '/self')
  }

  update(where, params) {
    return this.axios.post(this.url + '/update?where=' + encodeURIComponent(JSON.stringify(where)), params)
  }

  sendValidateCode(params) {
    return this.axios.post(this.url + '/sendValidateCode', params)
  }
  getInfo() {
    return this.axios.get(`${this.url}/byToken`).then(this.useData)
  }
}
export { Users }
