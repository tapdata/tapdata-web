import { requestClient } from '../request'

const BASE_URL = '/api/MetadataDefinition'

/**
 * Patch metadata definition by id
 */
export function patchMetadataDefinitionById(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function patchMetadataDefinition(params: any) {
  return requestClient.patch(`${BASE_URL}/${params.id}`, params)
}

/**
 * Get child account metadata definitions
 */
export function fetchMetadataDefinitionChildAccount(params?: any) {
  return requestClient.get(`${BASE_URL}/and/child_account`, { params })
}

/**
 * Batch push list tags to metadata definitions
 */
export function batchPushMetadataDefinitionListtags(
  tableName: string,
  params: any,
) {
  return requestClient.patch(
    `${BASE_URL}/batchPushListtags/${tableName}`,
    params,
  )
}

/**
 * Get all tags by type
 */
export function fetchMetadataDefinitionTags(type: string) {
  return requestClient.get(`${BASE_URL}/all-tag/${type}`)
}

// Base CRUD methods

/**
 * Count metadata definitions
 */
export function countMetadataDefinitions(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * Fetch metadata definitions
 */
export function fetchMetadataDefinitions(filter?: any, config?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    ...config,
  })
}

/**
 * Delete metadata definition by id
 */
export function deleteMetadataDefinition(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * Create metadata definition
 */
export function createMetadataDefinition(params: any) {
  return requestClient.post(BASE_URL, params)
}

/**
 * Find one metadata definition
 */
export function findOneMetadataDefinition(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * Update metadata definition
 */
export function updateMetadataDefinition(where: any, attributes: any) {
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
