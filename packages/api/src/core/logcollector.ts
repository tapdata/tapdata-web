import { requestClient } from '../request'

const BASE_URL = '/api/logcollector'

export function fetchLogcollector(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function getLogcollector(params: any) {
  if (Array.isArray(params)) {
    return requestClient.get(`${BASE_URL}/${params.join('/')}`)
  }
  if (params.url) {
    return requestClient.get(params.url)
  }
  params = params || {}
  return requestClient.get(BASE_URL, { params })
}

export function patchLogcollectorId(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function getLogcollectorByConnectionName(name: string) {
  if (name) {
    return requestClient.get(`${BASE_URL}/byConnectionName/${name}`)
  }
}

export function getSystemConfig(params: any) {
  return requestClient.get(`${BASE_URL}/system/config`, { params })
}

export function patchSystemConfig(params: any) {
  return requestClient.patch(`${BASE_URL}/system/config`, params)
}

export function getLogcollectorDetail(id: string) {
  return requestClient.get(`${BASE_URL}/detail/${id}`)
}

export function getLogcollectorChart(params: any) {
  return requestClient.get(`${BASE_URL}/system/config/stats`, { params })
}

export function checkLogcollector() {
  return requestClient.get(`${BASE_URL}/check/system/config`)
}

export function getLogcollectorByTaskId(taskId: string) {
  return requestClient.get(`${BASE_URL}/byTaskId/${taskId}`)
}

export function getLogcollectorBySubTaskId(subTaskId: string) {
  return requestClient.get(`${BASE_URL}/bySubTaskId/${subTaskId}`)
}

export function getTableNames(taskId: string, params: any) {
  return requestClient.get(`${BASE_URL}/tableNames/${taskId}`, { params })
}

export function getNewTableNames(
  taskId: string,
  callSubId: string,
  params: any,
) {
  return requestClient.get(`${BASE_URL}/tableNames/${taskId}/${callSubId}`, {
    params,
  })
}

export function getRelateTasks(params: any) {
  return requestClient.get(`${BASE_URL}/relate_tasks`, { params })
}

// 停止挖掘
export function exclusionTables(taskId: string, params: any) {
  return requestClient.post(`${BASE_URL}/exclusionTables/${taskId}`, params)
}

// 恢复挖掘
export function addTables(taskId: string, params: any) {
  return requestClient.post(`${BASE_URL}/addTables/${taskId}`, params)
}

export function getTableInfos(params: any) {
  return requestClient.get(`${BASE_URL}/tableInfos`, { params })
}

export function getExcludeTableInfos(params: any) {
  return requestClient.get(`${BASE_URL}/excludeTableInfos`, { params })
}

export function getConnectionIdsByTaskId(taskId: string) {
  return requestClient.get(`${BASE_URL}/connectionIds/${taskId}`)
}
