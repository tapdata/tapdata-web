import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/clusterStates'

// 类型定义
export interface ClusterState {
  id: string
  uuid: string
  status: string
  reportInterval: number
  systemInfo: {
    hostname: string
    uuid: string
    ip: string
    ips: string[]
    time: number
    accessCode: string
    username: string
    process_id: string
    cpus: number
    os: string
    totalmem: number
    logDir: string
    work_dir: string
    installationDirectory: string
  }
  engine: {
    status: string
    processID: string
    serviceStatus: string
    netStat: any[]
  }
  management: {
    status: string
    processID: string
    serviceStatus: string
  }
  apiServer: {
    status: string
    processID: string
    serviceStatus: string
  }
  customMonitorStatus: any[]
  insertTime: string
  ttl: string
  last_updated: string
  // 可选字段（用于前端扩展）
  agentName?: string
  custIP?: string
  canUpdate?: boolean
  metricValues?: {
    CpuUsage: string
    HeapMemoryUsage: string
  }
}

export interface ClusterMonitorParams {
  uuid: string
  name?: string
  command?: string
  arguments?: string
  id?: string
}

export interface ClusterStatusUpdateParams {
  uuid: string
  server: string
  operation: string
}

export interface ClusterAgentEditParams {
  custIP?: string
  agentName?: string
}

export function updateClusterStatus(params: ClusterStatusUpdateParams) {
  return requestClient.post(`${BASE_URL}/updataStatus`, params)
}

export function addClusterMonitor(params: ClusterMonitorParams) {
  return requestClient.post(`${BASE_URL}/addMonitor`, params)
}

export function removeClusterMonitor(params: ClusterMonitorParams) {
  return requestClient.post(`${BASE_URL}/removeMonitor`, params)
}

export function editClusterMonitor(params: ClusterMonitorParams) {
  return requestClient.post(`${BASE_URL}/editMonitor`, params)
}

export function editClusterAgent(id: string, params: ClusterAgentEditParams) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function findAccessNodeInfo(params: any) {
  return requestClient.get(`${BASE_URL}/findAccessNodeInfo`, { params })
}

export function findRawServerInfo(params?: any) {
  return requestClient.get(`${BASE_URL}/findRawServerInfo`, { params })
}

// Base Http methods that are used in the codebase
export function fetchClusterStates(params?: any) {
  return requestClient.get<PageFetchResult<ClusterState>>(BASE_URL, { params })
}

export function countClusterStates(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function patchClusterState(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function deleteClusterState(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createClusterState(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneClusterState(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateClusterState(where: any, attributes: any) {
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
