import { isPlainObj } from '@tap/shared'
import { requestClient } from '../request'

const BASE_URL = '/api/discovery'

/**
 * Fetch discovery list
 */
export function fetchDiscoveryList(params?: any, config?: any) {
  const requestConfig = { params, ...config }
  if (isPlainObj(params)) {
    Object.assign(requestConfig, params)
  }
  return requestClient.get(BASE_URL, requestConfig)
}

/**
 * Get storage overview
 */
export function getStorageOverview(id: string) {
  return requestClient.get(`${BASE_URL}/storage/overview/${id}`)
}

/**
 * Get task overview
 */
export function getTaskOverview(id: string) {
  return requestClient.get(`${BASE_URL}/task/overview/${id}`)
}

/**
 * Get API overview
 */
export function getApiOverview(id: string) {
  return requestClient.get(`${BASE_URL}/api/overview/${id}`)
}

/**
 * Get preview
 */
export function getDiscoveryPreview(id: string) {
  return requestClient.get(`${BASE_URL}/storage/preview/${id}`)
}

/**
 * Get filter list
 */
export function getDiscoveryFilterList(filterType: string) {
  return requestClient.get(`${BASE_URL}/filterList?filterType=${filterType}`)
}

/**
 * Get discovery directory data
 */
export function getDiscoveryDirectoryData(params?: any, option?: any) {
  const config = { params, ...option }
  if (isPlainObj(params)) {
    Object.assign(config, params)
  }
  return requestClient.get(`${BASE_URL}/directory/data`, config)
}

/**
 * Create tags
 */
export function createDiscoveryTags(params: any) {
  return requestClient.post(`${BASE_URL}/tags`, params)
}

/**
 * Update tags
 */
export function updateDiscoveryTags(params: any) {
  return requestClient.patch(`${BASE_URL}/tags`, params)
}
