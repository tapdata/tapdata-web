import { requestClient } from '../request'

const BASE_URL = '/api/roles'

/**
 * Fetch roles
 */
export function fetchRoles(filter?: any, config?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    ...config,
  })
}

/**
 * Count roles
 */
export function countRoles(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * Create role
 */
export function createRole(params: any) {
  return requestClient.post(BASE_URL, params)
}

/**
 * Update role by id
 */
export function updateRoleById(data: any) {
  return requestClient.patch(`${BASE_URL}/${data.id}`, data)
}

/**
 * Delete role principals by id
 */
export function deleteRolePrincipals(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}/principals`)
}

/**
 * Find one role
 */
export function findOneRole(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * Update role with where condition
 */
export function updateRole(where: any, attributes: any) {
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
