import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/task/rebalance'

export type RebalanceStatus = 'RUNNING' | 'OK' | 'FAILED' | 'CANCELLED'

export type JobStatus =
  | 'PENDING'
  | 'STOPPING'
  | 'STARTING'
  | 'OK'
  | 'CANCELLED'
  | 'INVALID_AGENT'
  | 'STATUS_ERROR'
  | 'STOP_TIMEOUT'
  | 'START_TIMEOUT'
  | 'FAILED'

export type SchedulableStatus =
  | 'OK'
  | 'AGENT_OFFLINE'
  | 'STATUS_ERROR'
  | 'MANUAL_AGENT'
  | 'INCREMENTAL_NOT_STARTED'

export interface TaskPreview {
  taskId: string
  taskName: string
  type: 'initial_sync' | 'cdc' | 'initial_sync+cdc'
  syncType: 'sync' | 'migrate' | 'logCollector' | 'mem_cache' | 'connHeartbeat'
  status: string
  sourceAgentId: string
  targetAgentId: string
  movable: boolean
  schedulableStatus: SchedulableStatus
  changed: boolean
  reason?: string | null
  priorityScore: number
  priorityScoreItems?: {
    syncType?: number
    nodeCount?: number
    startTime?: number
  }
  nodeCount: number
  startTime?: number | null
}

export interface TaskRebalancePreviewVo {
  tasks?: TaskPreview[]
  moveCount?: number
  reason?: string | null
}

export interface TaskRebalanceVo {
  id: string
  name: string
  status: RebalanceStatus
  createTime: string
  lastUpdated: string
  finishAt?: string | null
  totalCount: number
  pendingCount: number
  stoppingCount: number
  startingCount: number
  okCount: number
  failedCount: number
  cancelledCount: number
  errorMesg?: string | null
  userId: string
  createUser: string
  lastUpdBy: string
  customId: string
}

export interface TaskRebalanceJobVo {
  id: string
  rebalanceId: string
  taskId: string
  taskName: string
  status: JobStatus
  errorMesg?: string | null
  sourceAgentId: string
  targetAgentId: string
  beginAt?: string | null
  finishAt?: string | null
  createTime: string
  lastUpdated: string
  userId: string
  createUser: string
  lastUpdBy: string
  customId: string
}

export interface TaskRebalanceDetailVo {
  rebalance: TaskRebalanceVo
  jobs: TaskRebalanceJobVo[]
}

export interface TaskRebalanceActiveVo {
  active: boolean
}

/**
 * 生成均衡预览，不落库、不执行
 */
export function previewTaskRebalance() {
  return requestClient.post<TaskRebalancePreviewVo>(`${BASE_URL}/preview`)
}

/**
 * 创建并启动均衡
 */
export function createTaskRebalance(data?: TaskRebalancePreviewVo) {
  return requestClient.post<TaskRebalanceVo>(BASE_URL, data)
}

/**
 * 历史列表 (分页)
 */
export function fetchTaskRebalances(filter?: Filter) {
  return requestClient.get<PageFetchResult<TaskRebalanceVo>>(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

/**
 * 是否有正在运行的均衡
 */
export function hasActiveTaskRebalance() {
  return requestClient.get<TaskRebalanceActiveVo>(`${BASE_URL}/active`)
}

/**
 * 均衡详情 (含子任务)
 */
export function getTaskRebalanceDetail(id: string) {
  return requestClient.get<TaskRebalanceDetailVo>(`${BASE_URL}/${id}`)
}

/**
 * 取消该均衡下所有 PENDING 子任务
 */
export function cancelTaskRebalance(id: string) {
  return requestClient.post<void>(`${BASE_URL}/${id}/cancel`)
}

/**
 * 取消单个 PENDING 子任务
 */
export function cancelTaskRebalanceJob(id: string, taskId: string) {
  return requestClient.post<void>(`${BASE_URL}/${id}/cancel/${taskId}`)
}
