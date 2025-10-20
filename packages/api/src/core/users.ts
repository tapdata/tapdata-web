import { requestClient } from '../request'

const BASE_URL = '/api/users'

export function login(params: any) {
  return requestClient.post(`${BASE_URL}/login`, params, {
    skipErrorHandler: true,
  })
}

export function logoutUser(params?: any) {
  return requestClient.post(`${BASE_URL}/logout`, params)
}

export function createUser(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function getUserById(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function getPermissions(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function resetUser(params: any) {
  return requestClient.post(`${BASE_URL}/reset`, params)
}

export function changeUserPassword(params: any) {
  return requestClient.post(`${BASE_URL}/change-password`, params)
}

export function updateUser(params: any) {
  return requestClient.patch(`${BASE_URL}/${params.id}`, params)
}

export function resetUserPassword(params: any) {
  return requestClient.post(`${BASE_URL}/reset-password`, params)
}

export function checkToken() {
  return requestClient.get(`${BASE_URL}/checktoken`)
}

export function newResetPassword(token: string) {
  return requestClient.post(
    `${BASE_URL}/newResetPassword?access_token=${token}`,
  )
}

export function confirmUser(id: string, token: string) {
  return requestClient.get(`${BASE_URL}/confirm?uid=${id}&token=${token}`)
}

export function sendVerifyEmail(params: any) {
  return requestClient.post(`${BASE_URL}/sendVerifyEmail`, params)
}

export function deletePermissionRoleMapping(id: string, params: any) {
  return requestClient.delete(
    `${BASE_URL}/deletePermissionRoleMapping?id=${id}`,
    params,
  )
}

export function getUserRoles(params: any) {
  return requestClient.get(`${BASE_URL}/roles`, { params })
}

export function upsertUserWithWhere(where: any, params: any) {
  return requestClient.post(
    `${BASE_URL}/upsertWithWhere?where=${encodeURIComponent(JSON.stringify(where))}`,
    params,
  )
}

export function isCompleteGuide(id: string) {
  return requestClient.patch(`${BASE_URL}/isCompleteGuide?id=${id}`)
}

export function getUserInfo() {
  return requestClient.get(`${BASE_URL}/self`)
}

export function updateUserInfo(where: any, params: any) {
  return requestClient.post(
    `${BASE_URL}/update?where=${encodeURIComponent(JSON.stringify(where))}`,
    params,
  )
}

export function sendValidateCode(params: any) {
  return requestClient.post(`${BASE_URL}/sendValidateCode`, params)
}

export function getUserInfoByToken() {
  return requestClient.get(`${BASE_URL}/byToken`)
}

export function updatePermissionRoleMapping(id: string, params: any) {
  return requestClient.put(
    `${BASE_URL}/updatePermissionRoleMapping?id=${id}`,
    params,
  )
}

export function testLdapLogin(data: any) {
  return requestClient.post(`${BASE_URL}/testLdapLogin`, data)
}

export function checkLdapLoginEnable() {
  return requestClient.get(`${BASE_URL}/checkLdapLoginEnable`)
}

export function refreshAccessCode() {
  return requestClient.post(`${BASE_URL}/refreshAccessCode`)
}

// Base Http methods that are used in the codebase
export function fetchUsers(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function countUsers(params: any) {
  return requestClient.get<{ count: number }>(`${BASE_URL}/count`, { params })
}

export function patchUser(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function batchUpdateUserListtags(params: any) {
  return requestClient.patch(`${BASE_URL}/batchUpdateListtags`, params)
}
