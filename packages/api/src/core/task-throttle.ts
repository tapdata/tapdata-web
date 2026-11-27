import { requestClient } from '../request'
import type { RequestClientConfig } from '@tap/request'

const BASE_URL = '/api/task-throttle'

export type ThrottleTaskKind = 'sync' | 'migrate' | 'logCollector'
export type ThrottlePhase = 'FULL' | 'CDC'
export type ThrottleDirection = 'INPUT' | 'OUTPUT'
export type ThrottleDimension = 'BYTES' | 'QPS'
export type ThrottleWaitReason =
  | 'NONE'
  | 'RATE_WAIT'
  | 'SAMPLE_WAIT'
  | 'BUFFER_WAIT'
  | 'WRITE_IO_WAIT'
  | 'LOG_RISK_WAIT'
  | 'BACKPRESSURE_WAIT'

export type LogPositionStatus =
  | 'NORMAL'
  | 'WARN_70'
  | 'CRITICAL_90'
  | 'UNKNOWN'
  | 'EXPIRED'

export type ThrottleApplyStatus =
  | 'NONE'
  | 'PENDING'
  | 'APPLIED'
  | 'FAILED'
  | 'WAITING_COMPATIBLE_AGENT'

export type ThrottleStopGateStatus =
  | 'NONE'
  | 'WAITING_STOP_EVIDENCE'
  | 'WAITING_COMPATIBLE_AGENT'

export type ThrottleRequestConfig = RequestClientConfig & {
  skipErrorMessage?: boolean
  skipAuthExpire?: boolean
}

export interface ThrottlePhaseLimit {
  enabled: boolean
  bytesPerSec?: number | null
  eventsPerSec?: number | null
}

export interface TaskThrottleActiveWaitDetail {
  phase: ThrottlePhase
  direction: ThrottleDirection
  waitReason: ThrottleWaitReason
  waitingDimensions: ThrottleDimension[]
  appliedVersion: number
  bufferWatermark: number
  logPositionStatus: LogPositionStatus
}

export interface TaskThrottleLiveStatusView {
  taskId: string
  throttlingActive: boolean
  statusUnknown: boolean
  policyConfigured?: boolean
  configuredPhases?: ThrottlePhase[]
  runEpoch: number
  lastReportedAtUtc?: number | null
  activeWaits: TaskThrottleActiveWaitDetail[]
  activeDimensionsByPhase: Partial<Record<ThrottlePhase, ThrottleDimension[]>>
}

export interface TaskThrottlePolicyView {
  taskKey: string
  tenantId: string
  taskKind: ThrottleTaskKind
  taskId: string
  desiredVersion: number
  desiredPhases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null
  updatedBy?: string | null
  updatedAt?: number | null
  appliedVersion: number
  appliedPhases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null
  appliedAt?: number | null
  applyStatus: ThrottleApplyStatus
  lastApplyReason?: string | null
  currentRunEpoch: number
  currentAgentId?: string | null
  protectedRunActive: boolean
  stopGateStatus: ThrottleStopGateStatus
  stopGateReason?: string | null
  cdcSampleRefreshIntervalSeconds?: number | null
  sampleConfigVersion?: number | null
  liveStatus?: TaskThrottleLiveStatusView | null
}

export interface TaskThrottlePolicyUpdateRequest {
  expectedVersion: number
  phases: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>>
}

export interface TaskThrottleConflictDetail {
  errorCode: string
  latestVersion: number
  latestView?: TaskThrottlePolicyView | null
}

export interface TaskThrottleChangeLogEntry {
  id: string
  dedupKey: string
  tenantId?: string | null
  taskKind?: string | null
  taskId: string
  taskKey?: string | null
  eventType: 'POLICY_CHANGE' | 'APPLY_RECEIPT' | 'STOP_EVIDENCE' | string
  runEpoch: number
  policyVersion: number
  beforePhases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null
  afterPhases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null
  outcome?: string | null
  reason?: string | null
  skippedVersions?: number[] | null
  operator?: string | null
  agentId?: string | null
  occurredAt: number
}

export interface TaskThrottleStopEvidencePayload {
  oldAgentId?: string | null
  oldRunEpoch: number
  evidenceRef: string
  processExited: boolean
  writeSettled: boolean
  note?: string
}

export interface TaskThrottleRankingItem {
  taskId: string
  taskName: string
  taskKind: ThrottleTaskKind | string
  estimatedBytesPerSec: number
  estimatedMbPerSec: number
  totalEstimatedBytes: number
  coveredSeconds: number
  coverageRatio: number
  throttleEnabled: boolean
  liveStatus?: TaskThrottleLiveStatusView | null
}

export interface TaskThrottleRankingExcludedItem {
  taskId: string
  taskName: string
  taskKind: ThrottleTaskKind | string
  coveredSeconds: number
  coverageRatio: number
  reason: string
}

export interface TaskThrottleRankingResponse {
  meterVersion: string
  direction: ThrottleDirection
  windowSeconds: number
  minCoverageRatio: number
  items: TaskThrottleRankingItem[]
  excluded: TaskThrottleRankingExcludedItem[]
}

export interface TaskThrottleSampleConfigAgentStatus {
  agentId: string
  appliedIntervalSeconds?: number | null
  appliedConfigVersion?: number | null
  status: 'APPLIED' | 'APPLYING' | 'UNSUPPORTED_LEGACY' | string
  reason?: string | null
}

export interface TaskThrottleSampleConfigView {
  key: string
  intervalSeconds: number
  configVersion: number
  updatedAt: number
  agentStatuses: TaskThrottleSampleConfigAgentStatus[]
}

export interface LogCollectorThrottleDirectionSnapshot {
  estimatedMbPerSec?: number | null
  qps?: number | null
  waitReason?: ThrottleWaitReason | null
  waitingDimensions?: ThrottleDimension[] | null
  logPositionStatus?: LogPositionStatus | null
  lastSampledAtUtc?: number | null
}

export interface LogCollectorThrottleConsumerSummary {
  taskId: string
  taskName: string
  syncType: string
  status: string
  consumerDelayMs?: number | null
  lastEventTime?: number | null
  throttleEnabled: boolean
  liveStatus?: TaskThrottleLiveStatusView | null
  logPositionStatus?: LogPositionStatus | null
  estimatedOutputMbPerSec?: number | null
}

export interface LogCollectorThrottleOverviewView {
  collectorTaskId: string
  collectorTaskName: string
  collectorStatus: string
  storageTimeDays: number
  policyView?: TaskThrottlePolicyView | null
  sourceCapture?: LogCollectorThrottleDirectionSnapshot | null
  logWrite?: LogCollectorThrottleDirectionSnapshot | null
  oldestConsumerReplayTime?: number | null
  totalConsumerCount: number
  hiddenConsumerCount: number
  visibleConsumers: LogCollectorThrottleConsumerSummary[]
}

export function getTaskThrottlePolicy(
  kind: ThrottleTaskKind,
  taskId: string,
  config?: ThrottleRequestConfig,
) {
  return requestClient.get<TaskThrottlePolicyView>(
    `${BASE_URL}/${kind}/${taskId}`,
    config as any,
  )
}

export function updateTaskThrottlePolicy(
  kind: ThrottleTaskKind,
  taskId: string,
  payload: TaskThrottlePolicyUpdateRequest,
  config?: ThrottleRequestConfig,
) {
  return requestClient.put<TaskThrottlePolicyView>(
    `${BASE_URL}/${kind}/${taskId}`,
    payload,
    {
      skipErrorMessage: true,
      ...config,
    } as any,
  )
}

export function listTaskThrottleChanges(
  kind: ThrottleTaskKind,
  taskId: string,
  params?: {
    page?: number
    size?: number
    startAt?: number
    endAt?: number
    eventType?: string
  },
  config?: ThrottleRequestConfig,
) {
  return requestClient.get<TaskThrottleChangeLogEntry[]>(
    `${BASE_URL}/${kind}/${taskId}/changes`,
    {
      params: { page: 0, size: 50, ...params },
      ...config,
    } as any,
  )
}

export function submitTaskThrottleStopEvidence(
  kind: ThrottleTaskKind,
  taskId: string,
  payload: TaskThrottleStopEvidencePayload,
  config?: ThrottleRequestConfig,
) {
  return requestClient.post<any>(
    `${BASE_URL}/${kind}/${taskId}/stop-evidence`,
    payload,
    config as any,
  )
}

export function getTaskThrottleLiveStatuses(
  taskIds: string[],
  config?: ThrottleRequestConfig,
) {
  const validIds = Array.from(
    new Set(
      (taskIds || []).filter((id): id is string => Boolean(id && id.trim())),
    ),
  )
  if (!validIds.length) {
    return Promise.resolve<Record<string, TaskThrottleLiveStatusView>>({})
  }
  const searchParams = new URLSearchParams()
  validIds.forEach((id) => searchParams.append('taskIds', id))
  return requestClient.get<Record<string, TaskThrottleLiveStatusView>>(
    `${BASE_URL}/live-status?${searchParams.toString()}`,
    {
      skipErrorMessage: true,
      skipErrorHandler: true,
      ...config,
    } as any,
  )
}

export function getTaskThrottleRanking(
  params?: {
    direction?: ThrottleDirection
    windowSeconds?: number
    top?: number
  },
  config?: ThrottleRequestConfig,
) {
  return requestClient.get<TaskThrottleRankingResponse>(`${BASE_URL}/ranking`, {
    params: {
      direction: 'OUTPUT',
      windowSeconds: 300,
      top: 5,
      ...params,
    },
    ...config,
  } as any)
}

export function getTaskThrottleSampleConfig(config?: ThrottleRequestConfig) {
  return requestClient.get<TaskThrottleSampleConfigView>(
    `${BASE_URL}/sample-config`,
    config as any,
  )
}

export function updateTaskThrottleSampleConfig(
  intervalSeconds: number,
  config?: ThrottleRequestConfig,
) {
  return requestClient.put<TaskThrottleSampleConfigView>(
    `${BASE_URL}/sample-config`,
    { intervalSeconds },
    config as any,
  )
}

export function getLogCollectorThrottleOverview(
  taskId: string,
  config?: ThrottleRequestConfig,
) {
  return requestClient.get<LogCollectorThrottleOverviewView>(
    `${BASE_URL}/logCollector/${taskId}/overview`,
    {
      skipErrorMessage: true,
      skipErrorHandler: true,
      ...config,
    } as any,
  )
}

export function extractTaskThrottleConflict(
  error: any,
): TaskThrottleConflictDetail | null {
  const status = error?.response?.status ?? error?.status
  const data = error?.response?.data ?? error?.data
  if (status === 409 && data?.code === 'VERSION_CONFLICT') {
    const detail = data?.data || {}
    return {
      errorCode: detail.errorCode || data.code,
      latestVersion: Number(detail.latestVersion ?? 0),
      latestView: detail.latestView ?? null,
    }
  }
  return null
}
