import type {
  TaskThrottleChangeLogEntry,
  TaskThrottleLiveStatusView,
  TaskThrottlePolicyUpdateRequest,
  TaskThrottlePolicyView,
  ThrottleDimension,
  ThrottlePhase,
  ThrottlePhaseLimit,
  ThrottleTaskKind,
} from '@tap/api/src/core/task-throttle'

export const THROTTLE_BYTES_PER_MB = 1_000_000
export const THROTTLE_MIN_BYTES_PER_SEC = 1_000
export const THROTTLE_MAX_BYTES_PER_SEC = 10_000_000_000
export const THROTTLE_MIN_MB_PER_SEC = 0.001
export const THROTTLE_MAX_MB_PER_SEC = 10_000
export const THROTTLE_MIN_EVENTS_PER_SEC = 1
export const THROTTLE_MAX_EVENTS_PER_SEC = 10_000_000

export const CDC_SAMPLE_MIN_SECONDS = 5
export const CDC_SAMPLE_MAX_SECONDS = 300
export const CDC_SAMPLE_DEFAULT_SECONDS = 30

export const THROTTLE_METER_VERSION = 'event-v1-full-first-cdc-table-dml-v1'
export const SUPPORTED_THROTTLE_KINDS = [
  'sync',
  'migrate',
  'logCollector',
] as const

export interface ThrottlePhaseDraft {
  enabled: boolean
  bytesEnabled: boolean
  mbPerSecInput: string
  qpsEnabled: boolean
  eventsPerSecInput: string
  originalBytesPerSec?: number | null
  originalMbPerSecInput?: string
}

export type ThrottlePolicyDraft = Record<ThrottlePhase, ThrottlePhaseDraft>

export type ThrottleValidationErrorCode =
  | 'AT_LEAST_ONE_DIMENSION'
  | 'BYTES_REQUIRED'
  | 'BYTES_FORMAT'
  | 'BYTES_PRECISION'
  | 'BYTES_RANGE'
  | 'QPS_REQUIRED'
  | 'QPS_INTEGER'
  | 'QPS_RANGE'

export interface ThrottleValidationError {
  phase: ThrottlePhase
  field: 'phase' | 'bytesPerSec' | 'eventsPerSec'
  code: ThrottleValidationErrorCode
}

export interface ThrottleBadgePhaseLine {
  phase: ThrottlePhase
  dimensions: ThrottleDimension[]
}

export interface ThrottleBadgeState {
  state: 'none' | 'active' | 'unknown'
  phaseLines: ThrottleBadgePhaseLine[]
}

export type TaskThrottleFilterValue =
  | ''
  | 'throttling'
  | 'configured_idle'
  | 'disabled'
  | 'unknown'

export function normalizeThrottleTaskKind(
  syncType?: string | null,
): ThrottleTaskKind | null {
  if (!syncType || typeof syncType !== 'string') {
    return null
  }
  const normalized = syncType.trim().toLowerCase()
  if (normalized === 'sync') {
    return 'sync'
  }
  if (normalized === 'migrate') {
    return 'migrate'
  }
  if (normalized === 'logcollector' || normalized === 'log_collector') {
    return 'logCollector'
  }
  return null
}

export function getApplicableThrottlePhases(
  kind?: string | null,
  syncMode?: string | null,
): ThrottlePhase[] {
  const normalizedKind = normalizeThrottleTaskKind(kind)
  if (!normalizedKind) {
    return []
  }
  if (normalizedKind === 'logCollector') {
    return ['CDC']
  }
  const normalizedMode = (syncMode || 'initial_sync+cdc').trim().toLowerCase()
  if (normalizedMode === 'initial_sync') {
    return ['FULL']
  }
  if (normalizedMode === 'cdc') {
    return ['CDC']
  }
  return ['FULL', 'CDC']
}

export function mbPerSecToBytesPerSec(
  mbStrOrNum: string | number | null | undefined,
): number | null {
  if (
    mbStrOrNum === null ||
    mbStrOrNum === undefined ||
    typeof mbStrOrNum === 'boolean'
  ) {
    return null
  }
  const raw =
    typeof mbStrOrNum === 'number' ? String(mbStrOrNum) : mbStrOrNum.trim()
  if (!raw || !/^[+-]?\d+(?:\.\d+)?$/.test(raw)) {
    return null
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return Math.round(parsed * THROTTLE_BYTES_PER_MB)
}

export function bytesPerSecToMbPerSec(
  bytes: number | null | undefined,
): number | null {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) {
    return null
  }
  const mb = Math.round(bytes) / THROTTLE_BYTES_PER_MB
  return Number(mb.toFixed(3))
}

export function formatMbPerSec(bytes: number | null | undefined): string {
  const mb = bytesPerSecToMbPerSec(bytes)
  return mb === null ? '' : String(mb)
}

function createEmptyPhaseDraft(
  limit?: ThrottlePhaseLimit | null,
): ThrottlePhaseDraft {
  const bytesVal = limit?.bytesPerSec ?? null
  const qpsVal = limit?.eventsPerSec ?? null
  const hasBytes =
    typeof bytesVal === 'number' && Number.isFinite(bytesVal) && bytesVal > 0
  const hasQps =
    typeof qpsVal === 'number' && Number.isFinite(qpsVal) && qpsVal > 0
  const formattedBytes = hasBytes ? formatMbPerSec(bytesVal) : ''
  return {
    enabled: Boolean(limit?.enabled),
    bytesEnabled: hasBytes,
    mbPerSecInput: formattedBytes,
    qpsEnabled: hasQps,
    eventsPerSecInput: hasQps ? String(Math.round(qpsVal)) : '',
    originalBytesPerSec: hasBytes ? Math.round(bytesVal) : null,
    originalMbPerSecInput: formattedBytes,
  }
}

export function createDefaultThrottleDraft(): ThrottlePolicyDraft {
  return {
    FULL: createEmptyPhaseDraft(),
    CDC: createEmptyPhaseDraft(),
  }
}

export function policyViewToDraft(
  view?: TaskThrottlePolicyView | null,
): ThrottlePolicyDraft {
  return {
    FULL: createEmptyPhaseDraft(view?.desiredPhases?.FULL),
    CDC: createEmptyPhaseDraft(view?.desiredPhases?.CDC),
  }
}

function validatePositiveBytesMbInput(
  rawInput: string,
): ThrottleValidationErrorCode | null {
  const trimmed = (rawInput || '').trim()
  if (!trimmed) {
    return 'BYTES_REQUIRED'
  }
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
    return 'BYTES_FORMAT'
  }
  const num = Number(trimmed)
  if (!Number.isFinite(num)) {
    return 'BYTES_FORMAT'
  }
  if (num < THROTTLE_MIN_MB_PER_SEC || num > THROTTLE_MAX_MB_PER_SEC) {
    return 'BYTES_RANGE'
  }
  if (!/^\d+(?:\.\d{1,3})?$/.test(trimmed)) {
    return 'BYTES_PRECISION'
  }
  return null
}

function validatePositiveEventsInput(
  rawInput: string,
): ThrottleValidationErrorCode | null {
  const trimmed = (rawInput || '').trim()
  if (!trimmed) {
    return 'QPS_REQUIRED'
  }
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
    return 'QPS_INTEGER'
  }
  if (trimmed.includes('.')) {
    return 'QPS_INTEGER'
  }
  const num = Number(trimmed)
  if (!Number.isSafeInteger(num)) {
    return 'QPS_INTEGER'
  }
  if (num < THROTTLE_MIN_EVENTS_PER_SEC || num > THROTTLE_MAX_EVENTS_PER_SEC) {
    return 'QPS_RANGE'
  }
  return null
}

export function validateThrottleDraft(
  draft: ThrottlePolicyDraft,
  applicablePhases: ThrottlePhase[],
): ThrottleValidationError[] {
  const errors: ThrottleValidationError[] = []
  for (const phase of applicablePhases) {
    const phaseDraft = draft?.[phase]
    if (!phaseDraft?.enabled) {
      continue
    }
    if (!phaseDraft.bytesEnabled && !phaseDraft.qpsEnabled) {
      errors.push({
        phase,
        field: 'phase',
        code: 'AT_LEAST_ONE_DIMENSION',
      })
      continue
    }
    if (phaseDraft.bytesEnabled) {
      const code = validatePositiveBytesMbInput(phaseDraft.mbPerSecInput)
      if (code) {
        errors.push({
          phase,
          field: 'bytesPerSec',
          code,
        })
      }
    }
    if (phaseDraft.qpsEnabled) {
      const code = validatePositiveEventsInput(phaseDraft.eventsPerSecInput)
      if (code) {
        errors.push({
          phase,
          field: 'eventsPerSec',
          code,
        })
      }
    }
  }
  return errors
}

function parsePreservedBytesOrNull(
  phaseDraft: ThrottlePhaseDraft,
): number | null {
  const rawInput = phaseDraft.mbPerSecInput
  if (
    typeof phaseDraft.originalBytesPerSec === 'number' &&
    Number.isFinite(phaseDraft.originalBytesPerSec) &&
    phaseDraft.originalBytesPerSec >= THROTTLE_MIN_BYTES_PER_SEC &&
    phaseDraft.originalBytesPerSec <= THROTTLE_MAX_BYTES_PER_SEC &&
    (rawInput || '').trim() === (phaseDraft.originalMbPerSecInput ?? '').trim()
  ) {
    return Math.round(phaseDraft.originalBytesPerSec)
  }
  if (validatePositiveBytesMbInput(rawInput) !== null) {
    return null
  }
  const bytes = mbPerSecToBytesPerSec(rawInput)
  if (
    bytes === null ||
    bytes < THROTTLE_MIN_BYTES_PER_SEC ||
    bytes > THROTTLE_MAX_BYTES_PER_SEC
  ) {
    return null
  }
  return bytes
}

function parsePreservedEventsOrNull(rawInput: string): number | null {
  if (validatePositiveEventsInput(rawInput) !== null) {
    return null
  }
  return Number(rawInput.trim())
}

export function draftToUpdateRequest(
  draft: ThrottlePolicyDraft,
  applicablePhases: ThrottlePhase[],
  expectedVersion: number,
): TaskThrottlePolicyUpdateRequest {
  const phases: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> = {}
  const allPhases: ThrottlePhase[] = ['FULL', 'CDC']

  for (const phase of allPhases) {
    const phaseDraft = draft[phase]
    const isApplicable = applicablePhases.includes(phase)
    if (isApplicable && phaseDraft.enabled) {
      phases[phase] = {
        enabled: true,
        bytesPerSec: phaseDraft.bytesEnabled
          ? parsePreservedBytesOrNull(phaseDraft)
          : null,
        eventsPerSec: phaseDraft.qpsEnabled
          ? parsePreservedEventsOrNull(phaseDraft.eventsPerSecInput)
          : null,
      }
    } else {
      phases[phase] = {
        enabled: false,
        bytesPerSec: parsePreservedBytesOrNull(phaseDraft),
        eventsPerSec: parsePreservedEventsOrNull(phaseDraft.eventsPerSecInput),
      }
    }
  }

  return {
    expectedVersion,
    phases,
  }
}

export function hasEnabledApplicablePhase(
  draft: ThrottlePolicyDraft,
  applicablePhases: ThrottlePhase[],
): boolean {
  return applicablePhases.some((phase) => Boolean(draft?.[phase]?.enabled))
}

export function isDraftEqual(
  a: ThrottlePolicyDraft,
  b: ThrottlePolicyDraft,
  applicablePhases: ThrottlePhase[],
): boolean {
  const phasesToCompare: ThrottlePhase[] =
    applicablePhases.length > 0 ? applicablePhases : ['FULL', 'CDC']
  for (const phase of phasesToCompare) {
    const pa = a[phase]
    const pb = b[phase]
    if (
      Boolean(pa.enabled) !== Boolean(pb.enabled) ||
      Boolean(pa.bytesEnabled) !== Boolean(pb.bytesEnabled) ||
      Boolean(pa.qpsEnabled) !== Boolean(pb.qpsEnabled) ||
      (pa.mbPerSecInput || '').trim() !== (pb.mbPerSecInput || '').trim() ||
      (pa.eventsPerSecInput || '').trim() !==
        (pb.eventsPerSecInput || '').trim()
    ) {
      return false
    }
  }
  return true
}

const PHASE_ORDER: ThrottlePhase[] = ['FULL', 'CDC']
const DIMENSION_ORDER: ThrottleDimension[] = ['BYTES', 'QPS']

export function resolveThrottleBadgeState(
  taskStatus?: string | null,
  liveStatus?: TaskThrottleLiveStatusView | null,
): ThrottleBadgeState {
  if (String(taskStatus || '').toLowerCase() !== 'running') {
    return { state: 'none', phaseLines: [] }
  }
  if (!liveStatus) {
    return { state: 'none', phaseLines: [] }
  }
  if (liveStatus.statusUnknown) {
    return { state: 'unknown', phaseLines: [] }
  }
  if (!liveStatus.throttlingActive) {
    return { state: 'none', phaseLines: [] }
  }
  const byPhase = liveStatus.activeDimensionsByPhase || {}
  const phaseLines: ThrottleBadgePhaseLine[] = []
  for (const phase of PHASE_ORDER) {
    const rawDims = byPhase[phase]
    if (!Array.isArray(rawDims) || rawDims.length === 0) {
      continue
    }
    const dims = DIMENSION_ORDER.filter((d) => rawDims.includes(d))
    if (dims.length > 0) {
      phaseLines.push({ phase, dimensions: dims })
    }
  }
  if (phaseLines.length === 0) {
    return { state: 'none', phaseLines: [] }
  }
  return { state: 'active', phaseLines }
}

export function classifyTaskThrottleFilter(
  task: {
    status?: string | null
    type?: string | null
    syncType?: string | null
  },
  liveStatus?: TaskThrottleLiveStatusView | null,
): Exclude<TaskThrottleFilterValue, ''> {
  const badge = resolveThrottleBadgeState(task?.status, liveStatus)
  if (badge.state === 'unknown') {
    return 'unknown'
  }
  if (badge.state === 'active') {
    return 'throttling'
  }
  const applicablePhases = getApplicableThrottlePhases(
    task?.syncType,
    task?.type,
  )
  if (applicablePhases.length === 0) {
    return 'disabled'
  }
  if (Array.isArray(liveStatus?.configuredPhases)) {
    const hasConfiguredApplicable = liveStatus.configuredPhases.some((phase) =>
      applicablePhases.includes(phase),
    )
    return hasConfiguredApplicable ? 'configured_idle' : 'disabled'
  }
  return liveStatus?.policyConfigured ? 'configured_idle' : 'disabled'
}

interface AppliedSegment {
  occurredAt: number
  runEpoch: number
  policyVersion: number
  phases: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>>
}

export function buildThrottleLimitSeries(
  times: number[],
  changes: TaskThrottleChangeLogEntry[],
  policyView: TaskThrottlePolicyView | null | undefined,
  chartType: 'count' | 'size',
  phaseOrResolver: ThrottlePhase | ((ts: number) => ThrottlePhase),
): (number | null)[] {
  if (!Array.isArray(times) || times.length === 0) {
    return []
  }

  const phasesByVersion = new Map<
    number,
    Partial<Record<ThrottlePhase, ThrottlePhaseLimit>>
  >()
  for (const entry of changes || []) {
    if (entry?.afterPhases && typeof entry.policyVersion === 'number') {
      phasesByVersion.set(entry.policyVersion, entry.afterPhases)
    }
  }
  if (policyView && policyView.appliedVersion > 0 && policyView.appliedPhases) {
    phasesByVersion.set(policyView.appliedVersion, policyView.appliedPhases)
  }

  const rawSegments: AppliedSegment[] = []
  for (const entry of changes || []) {
    if (
      entry?.eventType === 'APPLY_RECEIPT' &&
      String(entry.outcome || '').toUpperCase() === 'APPLIED' &&
      typeof entry.occurredAt === 'number' &&
      Number.isFinite(entry.occurredAt)
    ) {
      const resolvedPhases =
        entry.afterPhases ??
        phasesByVersion.get(entry.policyVersion) ??
        (policyView?.appliedVersion === entry.policyVersion
          ? policyView.appliedPhases
          : undefined)
      if (resolvedPhases) {
        rawSegments.push({
          occurredAt: entry.occurredAt,
          runEpoch: entry.runEpoch ?? 0,
          policyVersion: entry.policyVersion ?? 0,
          phases: resolvedPhases,
        })
      }
    }
  }

  rawSegments.sort(
    (a, b) =>
      a.occurredAt - b.occurredAt ||
      a.runEpoch - b.runEpoch ||
      a.policyVersion - b.policyVersion,
  )

  const segments: AppliedSegment[] = []
  let maxVersionForEpoch = -1
  let activeEpoch = -1
  for (const seg of rawSegments) {
    if (seg.runEpoch > activeEpoch) {
      activeEpoch = seg.runEpoch
      maxVersionForEpoch = seg.policyVersion
      segments.push(seg)
    } else if (
      seg.runEpoch === activeEpoch &&
      seg.policyVersion > maxVersionForEpoch
    ) {
      maxVersionForEpoch = seg.policyVersion
      segments.push(seg)
    }
  }

  if (
    segments.length === 0 &&
    policyView &&
    policyView.appliedVersion > 0 &&
    typeof policyView.appliedAt === 'number' &&
    policyView.appliedPhases
  ) {
    segments.push({
      occurredAt: policyView.appliedAt,
      runEpoch: policyView.currentRunEpoch ?? 0,
      policyVersion: policyView.appliedVersion,
      phases: policyView.appliedPhases,
    })
  }

  if (segments.length === 0) {
    return times.map(() => null)
  }

  let segIdx = -1
  return times.map((ts) => {
    while (
      segIdx + 1 < segments.length &&
      segments[segIdx + 1].occurredAt <= ts
    ) {
      segIdx++
    }
    if (segIdx < 0) {
      return null
    }
    const phase =
      typeof phaseOrResolver === 'function'
        ? phaseOrResolver(ts)
        : phaseOrResolver
    const limit = segments[segIdx].phases?.[phase]
    if (!limit?.enabled) {
      return null
    }
    const value = chartType === 'size' ? limit.bytesPerSec : limit.eventsPerSec
    return typeof value === 'number' && Number.isFinite(value) && value > 0
      ? value
      : null
  })
}

export function validateCdcSampleInterval(raw: unknown): {
  valid: boolean
  value?: number
  errorCode?: 'REQUIRED' | 'INTEGER' | 'RANGE'
} {
  if (raw === null || raw === undefined || typeof raw === 'boolean') {
    return { valid: false, errorCode: 'REQUIRED' }
  }
  const str = typeof raw === 'number' ? String(raw) : String(raw).trim()
  if (!str) {
    return { valid: false, errorCode: 'REQUIRED' }
  }
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(str) || str.includes('.')) {
    return { valid: false, errorCode: 'INTEGER' }
  }
  const num = Number(str)
  if (!Number.isSafeInteger(num)) {
    return { valid: false, errorCode: 'INTEGER' }
  }
  if (num < CDC_SAMPLE_MIN_SECONDS || num > CDC_SAMPLE_MAX_SECONDS) {
    return { valid: false, errorCode: 'RANGE' }
  }
  return { valid: true, value: num }
}
