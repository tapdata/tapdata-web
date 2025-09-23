import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/ApiServers'

export const API_SERVER_BASE_URL = BASE_URL

export interface ApiServer {
  id: string
  clientName: string
  clientURI: string
  processId: string
  user_id: string
}

export function fetchApiServers(filter?: Filter) {
  return requestClient.get<PageFetchResult<ApiServer>>(String(BASE_URL), {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function deleteApiServer(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createApiServer(data: Partial<ApiServer>) {
  return requestClient.post(BASE_URL, data)
}

export function updateApiServer(id: string, data: Partial<ApiServer>) {
  return requestClient.patch(`${BASE_URL}/${id}`, data)
}

// 127.0.0.1:3000/api/api-server-worker

export interface ApiServerWorker {
  processId: string
  workerPid: number
  name: string
  workers: Worker[]
  workerProcessStartTime: number
  status: string
  metricValues: {
    heapMemoryUsage: number
    cpuUsage: number
  }
}

export interface Worker {
  oid: string
  name: string
  id: number
  pid: number
  workerStatus: string
  workerStartTime: number
  metricValues: {
    heapMemoryUsage: number
    cpuUsage: number
  }
  sort: number
}

export function fetchApiServerWorker(processId: string) {
  return requestClient.get<ApiServerWorker>(
    `/api/api-server-worker?processId=${processId}`,
  )
}

export interface ApiServerCpuMem {
  processId: string
  pid: number
  name: string
  pingTime: number
  workerProcessStartTime: number
  status: string
  metricValues: {
    heapMemoryUsage: number
    cpuUsage: number
  }
}

export function fetchApiServerCpuMem() {
  return requestClient.get<ApiServerCpuMem[]>(`/api/api-server-worker/cpu-mem`)
}

export interface WorkCallParams {
  /**
   * 查询开始时间，默认当前时间过去五分钟
   */
  from?: number
  /**
   * 查询粒度：0-分钟，1-小时，2-天，3-周，4-月，默认0
   */
  granularity?: number
  /**
   * api-server的id, 必填
   */
  processId?: string
  /**
   * 查询结束时间，默认当前时间
   */
  to?: number
  /**
   * type of query data (0 is default type)：0-rps of worker，1-response time of worker，2-error
   * rate of worker，
   */
  type?: number
  [property: string]: any
}

export interface WorkerCallData {
  processMetric?: {
    processId: string
    processMetric: WorkerMetric
    [property: string]: any
  }
  workerMetrics: {
    workerMetric: WorkerMetric
    workerName: string
    [property: string]: any
  }[]
  [property: string]: any
}
export interface WorkerMetric {
  rps?: Array<number | null>
  errorRate?: Array<number | null>
  p50?: Array<number | null>
  p95?: Array<number | null>
  p99?: Array<number | null>
  time: number[]
  [property: string]: any
}

export function fetchWorkerCall(params: WorkCallParams) {
  return requestClient.get<WorkerCallData>(`/api/worker-call`, {
    params,
  })
}

export interface ApiCallsData {
  processMetric: DataProcessMetric
  workerMetrics: DataWorkerMetric[]
  [property: string]: any
}

export interface DataProcessMetric {
  processId: string
  processMetric: ProcessMetricElement[]
  serverName: string
  [property: string]: any
}

export interface ProcessMetricElement {
  apiId?: string
  apiName?: string
  count?: number
  errorCount?: number
  [property: string]: any
}

export interface DataWorkerMetric {
  workerMetric: WorkerMetricWorkerMetric[]
  workOid: string
  [property: string]: any
}

export interface WorkerMetricWorkerMetric {
  apiId: string
  apiName: string
  count: number
  errorCount: number
  [property: string]: any
}

export function fetchWorkerCallApiCalls(processId: string) {
  return requestClient.get<ApiCallsData>(
    `/api/worker-call/api-calls/${processId}`,
  )
}
