import { requestClient } from '../request'

const BASE_URL = '/api/UserGroups'

/**
 * Fetch user groups
 */
export function fetchUserGroups(filter?: any, config?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    ...config,
  })
}

/**
 * Count user groups
 */
export function countUserGroups(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * Patch user group by id
 */
export function patchUserGroupById(data: any) {
  return requestClient.patch(`${BASE_URL}/${data.id}`, data)
}

/**
 * Delete user group by id
 */
export function deleteUserGroupById(params: any) {
  return requestClient.delete(`${BASE_URL}/${params.id}`, params)
}

// Base CRUD methods

/**
 * Create user group
 */
export function createUserGroup(params: any) {
  return requestClient.post(BASE_URL, params)
}

/**
 * Find one user group
 */
export function findOneUserGroup(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * Update user group
 */
export function updateUserGroup(where: any, attributes: any) {
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
