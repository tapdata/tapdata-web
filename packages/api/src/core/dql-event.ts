import { requestClient } from '../request'

const BASE_URL = '/api/dql-events'

export type DqlEventStatus =
  | 'PENDING'
  | 'REPROCESSING'
  | 'RECOVERED'
  | 'RECOVERY_FAILED'
  | 'NOT_REPROCESSABLE'

export type DqlErrorType =
  | 'MALFORMED_RECORD'
  | 'POISON_RECORD'
  | 'TRANSFORM_ERROR'
  | 'TARGET_WRITE_ERROR'
  | 'UNKNOWN_RECORD_ERROR'

export type DqlTaskSyncType = 'migrate' | 'sync'

export type DqlRecoveryBatchStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL_FAILED'
  | 'FAILED'
  | 'CANCELED'

export interface DqlEventQueryParams {
  taskId?: string
  taskName?: string
  sourceTable?: string
  targetTable?: string
  keyword?: string
  dmlType?: 'I' | 'U' | 'D'
  errorType?: DqlErrorType
  status?: DqlEventStatus
  startTime?: string
  endTime?: string
  skip?: number
  limit?: number
  order?: string
}

export interface DqlEvent {
  id: string
  eventId: string
  taskId: string
  taskName: string
  syncType: DqlTaskSyncType
  sourceTable: string
  targetTable: string
  dmlType: 'I' | 'U' | 'D'
  errorType: DqlErrorType
  errorCode: string
  eventTime: string
  failedAt: string
  captureSeq?: number
  status: DqlEventStatus
  recoveryCount: number
  lastRecoveryTime?: string
}

export interface DqlRecoveryAttempt {
  attemptId: string
  batchId: string
  startedAt: string
  finishedAt?: string
  result: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'TIMEOUT'
  message?: string
  errorMessage?: string
}

export interface DqlEventDetail extends DqlEvent {
  sourceNodeName?: string
  targetNodeName?: string
  failedNodeName?: string
  stage?: string
  tableId?: string
  captureSeq?: number
  eventKeys?: Array<{
    type: 'PRIMARY_KEY' | 'UNIQUE_INDEX'
    name?: string
    values: Record<string, unknown>
  }>
  eventKeyMissing?: boolean
  payloadFormat?: string
  payloadSize?: number
  payloadComplete?: boolean
  payloadPreview?: Record<string, unknown>
  payloadPreviewTruncated?: boolean
  errorDetails?: string
  rawErrorRef?: string
  recoveryAttempts?: DqlRecoveryAttempt[]
}

export interface DqlEventListResult {
  items: DqlEvent[]
  total: number
}

export interface DqlEventSummary {
  total: number
  pending: number
  reprocessing: number
  recovered: number
  recoveryFailed: number
  notReprocessable: number
}

export interface DqlRecoveryPreview {
  taskId?: string
  taskName?: string
  canSubmit: boolean
  orderedEvents: DqlEvent[]
  blockedEvents: Array<{
    eventId: string
    sourceTable?: string
    targetTable?: string
    dmlType?: DqlEvent['dmlType']
    eventTime?: string
    captureSeq?: number
    message: string
  }>
  message?: string
}

export interface DqlRecoveryBatch {
  batchId: string
  taskId: string
  taskName: string
  status: DqlRecoveryBatchStatus
  selectedCount: number
  successCount: number
  failedCount: number
  skippedCount: number
  eventIds: string[]
  orderedEventIds?: string[]
  startedAt?: string
  finishedAt?: string
  message?: string
}

export function fetchDqlEvents(params: DqlEventQueryParams) {
  return requestClient.get<DqlEventListResult>(BASE_URL, { params })
}

export function fetchDqlEventDetail(eventId: string) {
  return requestClient.get<DqlEventDetail>(`${BASE_URL}/${eventId}`)
}

export function fetchDqlEventSummary(
  params: Omit<DqlEventQueryParams, 'status' | 'skip' | 'limit' | 'order'>,
) {
  return requestClient.get<DqlEventSummary>(`${BASE_URL}/summary`, { params })
}

export function previewDqlRecovery(eventIds: string[]) {
  return requestClient.post<DqlRecoveryPreview>(
    `${BASE_URL}/recovery/preview`,
    { eventIds },
  )
}

export function startDqlRecovery(eventIds: string[]) {
  return requestClient.post<DqlRecoveryBatch>(`${BASE_URL}/recovery`, {
    eventIds,
    confirm: true,
  })
}
