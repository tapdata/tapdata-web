/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from 'axios'

export default class users extends PublicAPI {
  constructor() {
    super('/api/users')
  }
  login(params) {
    return axios.post(this.url + '/login', params)
  }
  logout(params) {
    return axios.post(this.url + '/logout', params)
  }
  post(params) {
    return axios.post(this.url, params)
  }
  getUserById(params) {
    return axios.get(this.url + params)
  }
  getPermissions(params) {
    return axios.get(this.url + params)
  }

  reset(params) {
    return axios.post(this.url + '/reset', params)
  }

  changePassword(params) {
    return axios.post(this.url + '/change-password', params)
  }

  patch(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }

  resetPassword(params) {
    return axios.post(this.url + '/reset-password', params)
  }

  checktoken() {
    return axios.get(this.url + '/checktoken')
  }

  newResetPassword(token) {
    return axios.post(this.url + '/newResetPassword?access_token=' + token)
  }

  confirm(id, token) {
    return axios.get(`${this.url}/confirm?uid=${id}&token=${token}`)
  }

  sendVerifyEmail(params) {
    return axios.post(this.url + '/sendVerifyEmail', params)
  }

  deletePermissionRoleMapping(id, params) {
    return axios.delete(`${this.url}/deletePermissionRoleMapping?id=${id}`, params)
  }

  role(params) {
    return axios.get(this.url + '/roles', { params })
  }

  upsertWithWhere(where, params) {
    return axios.post(this.url + '/upsertWithWhere?where=' + encodeURIComponent(JSON.stringify(where)), params)
  }

  isCompleteGuide(id) {
    return axios.patch(this.url + '/isCompleteGuide?id=' + id)
  }

  getUserInfo() {
    return axios.get(this.url + '/self')
  }

  update(where, params) {
    return axios.post(this.url + '/update?where=' + encodeURIComponent(JSON.stringify(where)), params)
  }

  sendValidateCode(params) {
    return axios.post(this.url + '/sendValidateCode', params)
  }
}
