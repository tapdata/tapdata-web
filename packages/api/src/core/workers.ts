import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/Workers'

export interface WorkerInfo {
  dataFlows: Record<string, any>[]
  systemInfo: Record<string, any>[]
  runningNum: number
  runningTaskNum: Record<string, number>
}

export interface Worker {
  id: string
  lastUpdBy: string
  createUser: string
  cpuLoad: number
  hostname: string
  usedMemory: number
  version: string
  metricValues: {
    HeapMemoryUsage: number | string
    CpuUsage: number | string
  }
  stopping: boolean
  gitCommitId: string
  singletonLock: string
  licenseBind: boolean
  createTime: string
  last_updated: string
  user_id: string
  process_id: string
  worker_type: string
  ping_time: number
  total_thread: number
  worker_date: string
}

export function getAvailableAgent() {
  return requestClient.get(`${BASE_URL}/availableAgent`)
}

export function getTaskUsedAgent(id: string) {
  return requestClient.get(`${BASE_URL}/available/taskUsedAgent?taskId=${id}`)
}

export function queryAllBindWorker() {
  return requestClient.get<Record<string, any>[]>(
    `${BASE_URL}/queryAllBindWorker`,
  )
}

export function unbindByProcessId(id: string) {
  return requestClient.post(`${BASE_URL}/unbindByProcessId?processId=${id}`)
}

export function getProcessInfo(processIds: string[]) {
  return requestClient.get<{ string: WorkerInfo }>(
    `${BASE_URL}/getProcessInfo`,
    {
      params: {
        process_id: JSON.stringify(processIds),
      },
    },
  )
}

// Base Http methods that are used in the codebase
export function fetchWorkers(filter?: object) {
  return requestClient.get<PageFetchResult<Worker>>(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function countWorkers(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteWorker(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createWorker(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function updateWorker(params: any) {
  return requestClient.patch(BASE_URL, params)
}

export function findOneWorker(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}
