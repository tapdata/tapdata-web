import { requestClient } from '../request'

const BASE_URL = '/api/UserLogs'

export function createUserLog(params: any) {
  return requestClient.post(BASE_URL, params)
}

// Base Http methods that are used in the codebase
export function fetchUserLogs(filter?: object) {
  return requestClient.get(BASE_URL, {
    params: filter ? JSON.stringify(filter) : undefined,
  })
}

export function countUserLogs(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function patchUserLog(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function deleteUserLog(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function findOneUserLog(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateUserLog(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  }
  if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}
