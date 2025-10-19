import { requestClient } from '../request'

const BASE_URL = '/api/Permissions'

/**
 * Fetch permissions
 */
export function fetchPermissions(filter?: any, config?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    ...config,
  })
}

/**
 * Count permissions
 */
export function countPermissions(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * Create permission
 */
export function createPermission(params: any) {
  return requestClient.post(BASE_URL, params)
}

/**
 * Delete permission by id
 */
export function deletePermissionById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * Find one permission
 */
export function findOnePermission(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * Update permission by id
 */
export function updatePermissionById(data: any) {
  return requestClient.patch(`${BASE_URL}/${data.id}`, data)
}

/**
 * Update permission with where condition
 */
export function updatePermission(where: any, attributes: any) {
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
