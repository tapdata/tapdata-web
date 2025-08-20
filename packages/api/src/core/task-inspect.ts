import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/task-inspect'

export interface InspectionRow {
  sourceTable: string
  targetTable: string
  countDiff: number
  countMore: number
  countMiss: number
}

export interface DiffRow {
  id: string
  diffType: 'DIFF' | 'MISS' | 'MORE'
  source: Record<string, any>
  target: Record<string, any>
  diffFields: string[]
  sourceFields: string[]
  targetFields: string[]
  diffFieldsMap: Record<string, string>
}

export interface TaskInspectOperation {
  ts: number
  op: string
  msg: string
  userId: string
  user: string
}

export interface TaskInspectConfig {
  timeCheckMode: 'NORMAL' | 'ROUND' | 'TRUNCATE'
  checkNoPkTable: boolean
  queueCapacity: number
  custom: {
    cdc: {
      enable: boolean
      sample: {
        interval: number
        limit: number
      }
      type: 'CLOSE' | 'SAMPLE'
    }
    full?: {
      enable: boolean
    }
    recover?: {
      enable: boolean
    }
  }
  mode: 'CLOSE' | 'INTELLIGENT' | 'CUSTOM'
}

export async function getTaskInspectConfig(taskId: string) {
  const res = await requestClient.get<TaskInspectConfig>(
    `${BASE_URL}/${taskId}`,
  )

  return (
    res || {
      mode: 'CLOSE',
      timeCheckMode: 'NORMAL',
      checkNoPkTable: false,
      queueCapacity: 1000,
      custom: {
        cdc: {
          enable: true,
          sample: { interval: 1, limit: 10 },
          type: 'SAMPLE',
        },
      },
    }
  )
}

export function updateTaskInspectConfig(taskId: string, config: any) {
  return requestClient.put(`${BASE_URL}/${taskId}`, config)
}

export function getTaskInspectHistories(taskId: string, params: any) {
  return requestClient.get(`${BASE_URL}/${taskId}/histories`, { params })
}

export interface ManualCheckParams {
  historyId?: string
  tableNames?: string[]
  resultIds?: string[]
  diffTypes?: string[]
}

export function manualCheck(taskId: string, params: ManualCheckParams = {}) {
  return requestClient.post(`${BASE_URL}/${taskId}/manual-check`, params)
}

export function manualRecover(taskId: string, params: ManualCheckParams = {}) {
  return requestClient.post(`${BASE_URL}/${taskId}/manual-recover`, params)
}

export interface InspectResultsLastOp {
  manualId: string
  manualType: 'manualCheck' | 'manualRecover'
  totals: number
  unfinished: number
  created: string
}

export function getTaskInspectResultsLastOp(taskId: string) {
  return requestClient.get<InspectResultsLastOp>(
    `${BASE_URL}/${taskId}/results-last-op`,
  )
}

export function getTaskInspectResultsGroupByTable(inspectId: string) {
  return requestClient.get<PageFetchResult<InspectionRow>>(
    `/api/task-inspect-histories/${inspectId}/results/group-by-table`,
  )
}

export function getTaskInspectHistoriesResults(
  inspectId: string,
  sourceTable: string,
) {
  return requestClient.get<PageFetchResult<DiffRow>>(
    `/api/task-inspect-histories/${inspectId}/results`,
    {
      params: {
        filter: JSON.stringify({
          where: { sourceTable },
        }),
      },
    },
  )
}

export function getTaskInspectResultsOperations(resultId: string) {
  return requestClient.get<TaskInspectOperation[]>(
    `/api/task-inspect-results/${resultId}/operations`,
  )
}
