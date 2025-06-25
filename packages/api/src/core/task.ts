import { requestClient } from '../request'
import { isPlainObj } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'

const BASE_URL = '/api/Task'

export function fetchTasks(params?: any, filter?: any, headers?: any) {
  if (Array.isArray(params)) {
    let queryStr = ''
    if (typeof filter === 'object') {
      queryStr = JSON.stringify(filter)
    } else if (typeof filter === 'string') {
      queryStr = filter
    }
    const qs = queryStr ? '?filter=' + encodeURIComponent(queryStr) : ''
    return requestClient.get(BASE_URL + '/' + params.join('/') + qs)
  } else if (typeof params === 'string') {
    return requestClient.get(BASE_URL + '/' + params, { params: filter, headers })
  }
  params = params || {}
  return requestClient.get(BASE_URL, { params })
}

export function copyTask(id: string) {
  return requestClient.put(`${BASE_URL}/copy/${id}`)
}

export function pauseTask(id: string) {
  return requestClient.put(`${BASE_URL}/pause/${id}`)
}

export function batchDeleteTasks(ids: string[]) {
  return requestClient.delete(`${BASE_URL}/batchDelete?taskIds=${ids.join('&taskIds=')}`)
}

export function batchRenewTasks(ids: string[]) {
  return requestClient.patch(`${BASE_URL}/batchRenew?taskIds=${ids.join('&taskIds=')}`)
}

export function batchStopTasks(ids: string[]) {
  return requestClient.put(`${BASE_URL}/batchStop?taskIds=${ids.join('&taskIds=')}`)
}

export function patchTaskById(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function findTaskDetailById(id: string) {
  return requestClient.get(`${BASE_URL}/findTaskDetailById/${id}`)
}

export function tranModelVersionControl(params: any) {
  return requestClient.post(`${BASE_URL}/tranModelVersionControl`, params)
}

export function getTaskById(id: string, params?: any, filter?: any) {
  if (Array.isArray(params)) {
    filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
    const qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
    return requestClient.get(`${BASE_URL}/${id}${params.join('/')}${qs}`)
  }
  params = params || {}
  return requestClient.get(`${BASE_URL}/${id}`, { params })
}

export function editTask(params: any) {
  return requestClient.patch(`${BASE_URL}/confirm/${params.id}`, params)
}

export function exportTasks(ids: string[]) {
  const href = `${BASE_URL}/batch/load?taskId=${ids.join('&taskId=')}&access_token=${Cookie.get('access_token')}`
  window.open(href)
}

export function checkTaskRun(id: string) {
  return requestClient.get(`${BASE_URL}/checkRun/${id}`)
}

export function batchUpdateTaskListtags(params: any) {
  return requestClient.patch(`${BASE_URL}/batchUpdateListtags`, params)
}

export function saveTask(params: any, config?: any) {
  return requestClient.patch(`${BASE_URL}/confirm/${params.id || ''}`, params, config)
}

export function saveAndStartTask(params: any, config?: any) {
  return requestClient.patch(`${BASE_URL}/confirmStart/${params.id || ''}`, params, config)
}

export function getTaskMetadata(params: any) {
  return requestClient.post(`${BASE_URL}/metadata`, params)
}

export function startTask(id: string, config?: any) {
  return requestClient.put(`${BASE_URL}/start/${id}`, null, config)
}

export function batchStartTasks(taskIds: string[], config?: any) {
  return requestClient.put(`${BASE_URL}/batchStart?taskIds=${taskIds.join('&taskIds=')}`, null, config)
}

export function stopTask(id: string) {
  return requestClient.put(`${BASE_URL}/stop/${id}`)
}

export function forceStopTask(id: string) {
  return requestClient.put(`${BASE_URL}/stop/${id}?force=true`)
}

export function resetTask(id: string) {
  return requestClient.put(`${BASE_URL}/renew/${id}`)
}

export function getTaskChart(id?: string) {
  if (id) {
    return requestClient.get(`${BASE_URL}/chart?user_id=${id}`)
  } else {
    return requestClient.get(`${BASE_URL}/chart`)
  }
}

export function checkTaskName(params: any = {}) {
  return requestClient.post(`${BASE_URL}/checkName`, params)
}

export function getNodeTableInfo(params: any = {}) {
  const config = { params }
  if (isPlainObj(params)) {
    Object.assign(config, params)
  }
  return requestClient.get(`${BASE_URL}/getNodeTableInfo`, config)
}

export function getTableStatus(connectionId: string, tableName: string) {
  return requestClient.get(`${BASE_URL}/table/status?connectionId=${connectionId}&tableName=${tableName}`)
}

export function getTaskConsole(params: any) {
  return requestClient.get('/api/task-console', { params })
}

export function testRunJs(params: any) {
  return requestClient.post('/api/task/migrate-js/test-run', params)
}

export function testRunJsRpc(params: any) {
  return requestClient.post('/api/task/migrate-js/test-run-rpc', params)
}

export function getRunJsResult(params: any) {
  return requestClient.get('/api/task/migrate-js/get-result', { params })
}

export function testRunPythonRpc(params: any) {
  return requestClient.post('/api/task/migrate-python/test-run-rpc', params)
}

export function getTaskRecords(id: string, params: any) {
  return requestClient.get(`${BASE_URL}/records/${id}`, { params })
}

export function autoInspectResultsGroupByTable(params: any) {
  return requestClient.post(`${BASE_URL}/auto-inspect-results-group-by-table`, params)
}

export function getAutoInspectResults(taskId: string, params: any) {
  return requestClient.get(`${BASE_URL}/${taskId}/auto-inspect-results`, { params })
}

export function getAutoInspectTotals(params: any) {
  return requestClient.post(`${BASE_URL}/auto-inspect-totals`, params)
}

export function getTaskStats() {
  return requestClient.get(`${BASE_URL}/stats`)
}

export function autoInspectAgain(taskId: string, params: any) {
  return requestClient.post(`${BASE_URL}/${taskId}/auto-inspect-again`, params)
}

export function putTaskLogSetting(taskId: string, params: any) {
  return requestClient.put(`${BASE_URL}/logSetting/${taskId}`, params)
}

export function taskConsoleRelations(params: any) {
  return requestClient.post('/api/task-console/relations', params)
}

export function renameTask(taskId: string, newName: string) {
  return requestClient.patch(`${BASE_URL}/rename/${taskId}?newName=${encodeURIComponent(newName)}`)
}

export function getTaskByConnection(params: any) {
  return requestClient.get(`${BASE_URL}/targetNode/connectionIds`, { params })
}

export function getTaskByTableName(params: any, config?: any) {
  return requestClient.get(`${BASE_URL}/stats/task`, { params, ...config })
}

export function getParentTaskSign(id: string, parentId: string) {
  return requestClient.get(`${BASE_URL}/${id}/parent-task-sign`, {
    params: {
      parentId,
    },
  })
}

export function checkCloudTaskLimit(taskId: string) {
  return requestClient.get(`${BASE_URL}/checkCloudTaskLimit/${taskId}`)
}

export function skipErrorEvents(taskId: string, ids: any) {
  return requestClient.post(`${BASE_URL}/skipErrorEvents/${taskId}`, ids)
}

export function getTaskTimeRange(data: any, params: any) {
  return requestClient.get(`${BASE_URL}/calculatedTimeRange`, {
    data: JSON.stringify(data),
    params
  })
}

export function getCurrentEngineTime() {
  return requestClient.get(`${BASE_URL}/getCurrentEngineTime`)
}

export function getTaskErrorEvents(taskId: string) {
  return requestClient.get(`${BASE_URL}/errors/${taskId}`)
}

export function downloadTaskAnalyze(taskId: string, params: any) {
  return requestClient.post(`${BASE_URL}/analyze/${taskId}`, null, {
    ...params,
    responseType: 'blob'
  })
}

export function refreshTaskSchema(taskId: string, params: any) {
  return requestClient.put(`${BASE_URL}/${taskId}/re-schemas`, null, {
    params
  })
}

// Base Http methods that are used in the codebase
export function countTasks(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteTask(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createTask(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneTask(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateTask(where: any, attributes: any) {
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
