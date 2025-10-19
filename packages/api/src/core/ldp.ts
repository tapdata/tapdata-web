import { requestClient } from '../request'

const BASE_URL = '/api/ldp'

/**
 * Create FDM task
 */
export function createFDMTask(data: any, config?: any) {
  return requestClient.post(`${BASE_URL}/fdm/task`, data, config)
}

/**
 * Create MDM task
 */
export function createMDMTask(data: any, config?: any) {
  return requestClient.post(`${BASE_URL}/mdm/task`, data, config)
}

/**
 * Search sources
 */
export function searchLDPSources(params?: any, config?: any) {
  return requestClient.get(`${BASE_URL}/fuzzy/search`, { params, ...config })
}

/**
 * Get task by tag
 */
export function getLDPTaskByTag(tags: any) {
  return requestClient.get(`${BASE_URL}/fdm/task/byTags`, {
    params: { tags },
  })
}

/**
 * Check can start by tag
 */
export function checkLDPCanStartByTag(tagId: string) {
  return requestClient.get(`${BASE_URL}/check/fdm/status`, {
    params: {
      tagId,
    },
  })
}

/**
 * Get FDM task list
 */
export function getFDMTaskList(params?: any) {
  return requestClient.get(`${BASE_URL}/fdm/task`, { params })
}

/**
 * Get MDM task list
 */
export function getMDMTaskList(params?: any) {
  return requestClient.get(`${BASE_URL}/mdm/task`, { params })
}

/**
 * Get FDM task by id
 */
export function getFDMTaskById(id: string) {
  return requestClient.get(`${BASE_URL}/fdm/task/${id}`)
}

/**
 * Get MDM task by id
 */
export function getMDMTaskById(id: string) {
  return requestClient.get(`${BASE_URL}/mdm/task/${id}`)
}

/**
 * Update FDM task
 */
export function updateFDMTask(id: string, data: any) {
  return requestClient.patch(`${BASE_URL}/fdm/task/${id}`, data)
}

/**
 * Update MDM task
 */
export function updateMDMTask(id: string, data: any) {
  return requestClient.patch(`${BASE_URL}/mdm/task/${id}`, data)
}

/**
 * Delete FDM task
 */
export function deleteFDMTask(id: string) {
  return requestClient.delete(`${BASE_URL}/fdm/task/${id}`)
}

/**
 * Delete MDM task
 */
export function deleteMDMTask(id: string) {
  return requestClient.delete(`${BASE_URL}/mdm/task/${id}`)
}

/**
 * Start FDM task
 */
export function startFDMTask(id: string) {
  return requestClient.put(`${BASE_URL}/fdm/task/${id}/start`)
}

/**
 * Start MDM task
 */
export function startMDMTask(id: string) {
  return requestClient.put(`${BASE_URL}/mdm/task/${id}/start`)
}

/**
 * Stop FDM task
 */
export function stopFDMTask(id: string) {
  return requestClient.put(`${BASE_URL}/fdm/task/${id}/stop`)
}

/**
 * Stop MDM task
 */
export function stopMDMTask(id: string) {
  return requestClient.put(`${BASE_URL}/mdm/task/${id}/stop`)
}

/**
 * Batch start FDM tasks
 */
export function batchStartFDMTasks(tagId: string, taskIds: string[]) {
  return requestClient.post(`${BASE_URL}/fdm/batch/start`, {
    tagId,
    taskIds,
  })
}

/**
 * Delete MDM table
 */
export function deleteMDMTable(tableId: string) {
  return requestClient.delete(`${BASE_URL}/mdm/table/${tableId}`)
}

/**
 * Batch start (alias for batchStartFDMTasks)
 */
export function batchStart(tagId: string, taskIds: string[]) {
  return requestClient.post(`${BASE_URL}/fdm/batch/start`, {
    tagId,
    taskIds,
  })
}
