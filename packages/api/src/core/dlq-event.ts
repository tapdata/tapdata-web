import { requestClient } from '../request'

const BASE_URL = '/api/dql-events'

export type DlqEventStatus =
  | 'PENDING'
  | 'REPROCESSING'
  | 'RECOVERED'
  | 'RECOVERY_FAILED'
  | 'NOT_REPROCESSABLE'

export type DlqErrorType =
  | 'MALFORMED_RECORD'
  | 'POISON_RECORD'
  | 'TRANSFORM_ERROR'
  | 'TARGET_WRITE_ERROR'
  | 'UNKNOWN_RECORD_ERROR'

export type DlqTaskSyncType = 'migrate' | 'sync'

export type DlqRecoveryMode = 'AUTO'

export type DlqRecoveryBatchStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL_FAILED'
  | 'FAILED'
  | 'CANCELED'

export interface DlqEventQueryParams {
  taskId?: string
  eventId?: string
  taskName?: string
  sourceTable?: string
  targetTable?: string
  keyword?: string
  errorCode?: string
  dmlType?: 'I' | 'U' | 'D'
  errorType?: DlqErrorType
  status?: DlqEventStatus
  startTime?: string
  endTime?: string
  skip?: number
  limit?: number
  order?: string
}

export interface DlqEvent {
  id: string
  eventId: string
  taskId: string
  taskName: string
  /**
   * The TM DQL event API does not include the task sync type. Keep this
   * optional for local fixtures and older responses; production callers
   * should resolve it from the task API when it is needed for navigation.
   */
  syncType?: DlqTaskSyncType
  sourceTable: string
  targetTable: string
  dmlType: 'I' | 'U' | 'D'
  errorType: DlqErrorType
  errorCode: string
  eventTime: string
  failedAt: string
  captureSeq?: number
  status: DlqEventStatus
  recoveryCount: number
  lastRecoveryTime?: string
}

export interface DlqRecoveryAttempt {
  attemptId: string
  batchId: string
  startedAt: string
  finishedAt?: string
  result: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'TIMEOUT'
  message?: string
  errorMessage?: string
}

export interface DlqEventDetail extends DlqEvent {
  /** Localized reason returned by TM when the event cannot be reprocessed. */
  notReprocessableReason?: string
  sourceNodeId?: string
  sourceNodeName?: string
  targetNodeId?: string
  targetNodeName?: string
  failedNodeId?: string
  failedNodeName?: string
  stage?: string
  tableId?: string
  captureSeq?: number
  /** Canonical JSON string returned by TM's DQL event detail endpoint. */
  eventKey?: string
  eventKeyMissing?: boolean
  payloadFormat?: string
  payloadHash?: string
  payloadSize?: number
  payloadComplete?: boolean
  payloadPreview?: Record<string, unknown>
  payloadPreviewTruncated?: boolean
  errorDetails?: string
  rawErrorRef?: string
  recoveryAttempts?: DlqRecoveryAttempt[]
}

export interface DlqEventListResult {
  items: DlqEvent[]
  total: number
}

export interface DlqEventSummary {
  total: number
  pending: number
  reprocessing: number
  recovered: number
  recoveryFailed: number
  notReprocessable: number
}

export interface DlqRecoveryPreview {
  taskId?: string
  taskName?: string
  canSubmit: boolean
  orderedEvents: DlqEvent[]
  riskyEvents?: Array<{
    eventId: string
    sourceTable?: string
    targetTable?: string
    dmlType?: DlqEvent['dmlType']
    eventTime?: string
    captureSeq?: number
    messageCode?: string
    message: string
  }>
  blockedEvents: Array<{
    eventId: string
    sourceTable?: string
    targetTable?: string
    dmlType?: DlqEvent['dmlType']
    eventTime?: string
    captureSeq?: number
    messageCode?: string
    message: string
  }>
  message?: string
}

export interface DlqRecoveryBatch {
  batchId: string
  taskId: string
  taskName: string
  status: DlqRecoveryBatchStatus
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

export function fetchDlqEvents(params: DlqEventQueryParams) {
  return requestClient.get<DlqEventListResult>(BASE_URL, { params })
}

export function fetchDlqEventDetail(eventId: string) {
  return requestClient.get<DlqEventDetail>(`${BASE_URL}/${eventId}`)
}

export function fetchDlqEventSummary(
  params: Omit<DlqEventQueryParams, 'status' | 'skip' | 'limit' | 'order'>,
) {
  return requestClient.get<DlqEventSummary>(`${BASE_URL}/summary`, { params })
}

export function previewDlqRecovery(eventIds: string[]) {
  return requestClient.post<DlqRecoveryPreview>(
    `${BASE_URL}/recovery/preview`,
    { eventIds, mode: 'AUTO' satisfies DlqRecoveryMode },
  )
}

export function startDlqRecovery(eventIds: string[]) {
  return requestClient.post<DlqRecoveryBatch>(`${BASE_URL}/recovery`, {
    eventIds,
    confirm: true,
    mode: 'AUTO' satisfies DlqRecoveryMode,
  })
}
