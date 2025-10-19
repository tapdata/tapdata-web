import { requestClient } from '../request'

const BASE_URL = '/api/data-permission'

export function getRoleActions(params: unknown) {
  return requestClient.get(`${BASE_URL}/role-actions`, { params })
}

export function postDataAuth(params: unknown) {
  return requestClient.post(`${BASE_URL}/data-auth`, params)
}

export function getPermissions(params: unknown) {
  return requestClient.get(`${BASE_URL}/permissions`, { params })
}

export function postPermissions(params: unknown) {
  return requestClient.post(`${BASE_URL}/permissions`, params)
}

export function getDataActions(params: unknown) {
  return requestClient.get(`${BASE_URL}/data-actions`, { params })
}
