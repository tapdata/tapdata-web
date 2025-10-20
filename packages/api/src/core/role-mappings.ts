import { requestClient } from '../request'

const BASE_URL = '/api/RoleMappings'

/**
 * Fetch role mappings
 */
export function fetchRoleMappings(filter?: any, config?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    ...config,
  })
}

/**
 * Count role mappings
 */
export function countRoleMappings(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * Create role mapping
 */
export function createRoleMapping(params: any) {
  return requestClient.post(BASE_URL, params)
}

/**
 * Delete role mapping by id
 */
export function deleteRoleMappingById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * Save all role mappings
 */
export function saveAllRoleMappings(params: any) {
  return requestClient.post(`${BASE_URL}/saveAll`, params)
}

/**
 * Find one role mapping
 */
export function findOneRoleMapping(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * Update role mapping by id
 */
export function updateRoleMappingById(data: any) {
  return requestClient.patch(`${BASE_URL}/${data.id}`, data)
}
