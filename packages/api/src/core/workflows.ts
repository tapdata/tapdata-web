import { requestClient, type Filter, type Page } from '../request'

const WORKFLOW_URL = '/api/workflows'
const RUN_URL = '/api/workflow-runs'
const TRIGGER_RECORD_URL = '/api/workflow-trigger-records'

export type WorkflowTriggerType =
  | 'MANUAL'
  | 'MANUAL_TEST'
  | 'SCHEDULE_ONCE'
  | 'SCHEDULE_INTERVAL'
  | 'SCHEDULE_DAILY'
  | 'SCHEDULE_WEEKLY'
  | 'TASK_STARTED'
  | 'TASK_STOPPED'
  | 'TASK_ERROR'
  | 'SNAPSHOT_COMPLETED'
  | 'CDC_ENTERED'
  | 'INCREMENT_DELAY_BREACHED'
  | 'INSPECT_DIFF_BREACHED'

export type WorkflowStepType =
  | 'TASK_START'
  | 'TASK_STOP'
  | 'INSPECT_START'
  | 'INSPECT_DIFF'
  | 'INSPECT_REPAIR'
  | 'WAIT'
  | 'CONDITION'
  | 'IF_ELSE'
  | 'ALARM'
  | 'WEBHOOK'
  | 'JAVASCRIPT'

export type WorkflowRunStatus =
  | 'CREATED'
  | 'RUNNING'
  | 'WAITING'
  | 'RETRY_WAIT'
  | 'SUCCEEDED'
  | 'COMPLETED_WITH_WARNINGS'
  | 'CONDITION_NOT_MET'
  | 'FAILED'
  | 'STOPPED'

export type TriggerDecisionKind =
  | 'ACCEPTED'
  | 'SUPPRESSED'
  | 'MISSED'
  | 'IGNORED_WORKFLOW_ORIGIN'

export type WorkflowConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | '=='
  | '!='

export interface WorkflowConditionSpec {
  variable: string
  operator: WorkflowConditionOperator
  valueType: 'string' | 'number' | 'boolean'
  value: unknown
}

export interface WorkflowTriggerSpec {
  type: WorkflowTriggerType
  timezone?: string
  fireAtEpochMs?: number
  intervalMs?: number
  hour?: number
  minute?: number
  daysOfWeek?: number[]
  taskIds?: string[]
  inspectIds?: string[]
  thresholdMs?: number
  thresholdCount?: number
  /** Event triggers with 2+ sources. Default ANY. ALL waits until every source is active. */
  join?: 'ALL' | 'ANY'
}

export interface WorkflowStepSpec extends Partial<WorkflowConditionSpec> {
  stepId: string
  name?: string
  type: WorkflowStepType
  taskIds?: string[]
  inspectIds?: string[]
  connectionIds?: string[]
  join?: 'ALL' | 'ANY'
  predicate?: 'RUNNING' | 'SNAPSHOT_DONE' | 'CDC_ENTERED'
  timeoutMs?: number
  maxRetries?: number
  retryIntervalMs?: number
  exhaustedPolicy?: 'SKIP' | 'STOP_WORKFLOW'
  logic?: 'AND' | 'OR'
  conditions?: WorkflowConditionSpec[]
  thenSteps?: WorkflowStepSpec[]
  elseSteps?: WorkflowStepSpec[]
  webhookId?: string
  webhookUrl?: string
  webhookMethod?: string
  webhookToken?: string
  webhookBody?: string
  webhookHeaders?: Record<string, string>
  script?: string
  alarmTitle?: string
  alarmMessage?: string
}

export interface WorkflowSpec {
  name: string
  description?: string
  trigger: WorkflowTriggerSpec
  steps: WorkflowStepSpec[]
}

export interface WorkflowDefinitionDto {
  id: string
  name: string
  description?: string
  enabled: boolean
  deleted?: boolean
  currentVersion: number
  currentVersionId: string
  currentDefinitionHash: string
  triggerSummary?: WorkflowTriggerType
  nextFireAt?: string | null
  lastScheduledAt?: string | null
  runAsUserId?: string
  enabledBy?: string
  enabledAt?: string
  spec?: WorkflowSpec
  compiledPlan?: unknown
  expectedVersion?: number
  expectedDefinitionHash?: string
  createTime?: string
  last_updated?: string
  user_id?: string
  hasActiveRun?: boolean
  activeRunId?: string | null
  lastRunId?: string | null
  lastRunStatus?: WorkflowRunStatus | null
  lastRunTriggerType?: WorkflowTriggerType | null
  lastRunStartedAt?: string | null
  lastRunEndedAt?: string | null
  lastRunDurationMs?: number | null
  lastRunErrorCode?: string | null
}

export interface WorkflowSavePayload {
  name: string
  description?: string
  spec: WorkflowSpec
  expectedVersion?: number
  expectedDefinitionHash?: string
}

export interface TriggerDecision {
  decision: TriggerDecisionKind
  runId: string | null
  activeRunId: string | null
  triggerRecordId: string | null
  reason: string | null
}

export interface WorkflowWaitUnmetTask {
  taskId: string
  status?: string
  snapshotMilestone?: string | null
  cdcMilestone?: string | null
  reason?: string
}

export interface WorkflowWaitProgress {
  join?: 'ALL' | 'ANY'
  predicate?: string
  unmetTasks?: WorkflowWaitUnmetTask[]
  [key: string]: unknown
}

export interface WorkflowStepTargetDto {
  kind: 'TASK' | 'INSPECT' | 'WEBHOOK' | 'ALARM'
  id?: string
  name?: string
}

export interface WorkflowStepRunDto {
  id: string
  runId: string
  workflowId: string
  stepId: string
  stepName?: string
  stepType: WorkflowStepType
  title?: string
  summary?: string
  targets?: WorkflowStepTargetDto[]
  attempt: number
  status: 'WAITING' | 'RETRYABLE' | 'SUCCEEDED' | 'CONDITION_NOT_MET' | 'FAILED'
  startedAt?: string
  endedAt?: string
  durationMs?: number
  output?: Record<string, unknown>
  errorCode?: string | null
  errorSummary?: string | null
  retryable?: boolean | null
}

export interface WorkflowTriggerRecordDto {
  id: string
  workflowId: string
  triggerType: WorkflowTriggerType
  triggerAt: string
  sourceTaskId?: string | null
  sourceMetric?: string | null
  observedValue?: unknown
  threshold?: unknown
  decision: TriggerDecisionKind
  runId?: string | null
  activeRunId?: string | null
  reason?: string | null
}

export interface WorkflowRunDto {
  id: string
  workflowId: string
  workflowName?: string
  workflowVersionId?: string
  workflowVersion?: number
  definitionHash: string
  triggerType: WorkflowTriggerType
  triggerContext?: Record<string, unknown>
  status: WorkflowRunStatus
  active: boolean
  programCounter?: string
  currentStepId?: string
  currentAttempt?: number
  nextWakeAt?: string | null
  waitDeadline?: string | null
  stopRequestedAt?: string | null
  /** Username of the operator who requested stop. */
  stoppedBy?: string | null
  resumeCount?: number
  startedAt?: string
  endedAt?: string | null
  durationMs?: number
  warningCount?: number
  errorCode?: string | null
  errorSummary?: string | null
  rerunOfRunId?: string | null
  /** Username of the operator who started this run. */
  startedBy?: string
  /** Username of the operator who last resumed; null if never resumed. */
  lastResumedBy?: string | null
  lastResumedAt?: string | null
  selectedBranches?: Record<string, 'then' | 'else'>
  triggerRecordId?: string
  steps?: WorkflowStepRunDto[]
  suppressedTriggers?: WorkflowTriggerRecordDto[]
  waitProgress?: WorkflowWaitProgress | null
}

export interface WorkflowVersionDto {
  id: string
  workflowId: string
  version: number
  definitionHash: string
  createTime?: string
  spec?: WorkflowSpec
  compiledPlan?: unknown
}

export interface WorkflowValidationIssue {
  stepId: string | null
  fieldPath: string | null
  errorCode: string
  localizedArgs?: unknown[]
}

export interface WorkflowValidateResultDto {
  valid: boolean
  issues: WorkflowValidationIssue[]
  compiledPlan?: unknown
  definitionHash?: string | null
}

export interface WorkflowTaskCapability {
  taskId: string
  syncType?: string
  inspect: boolean
  heartbeat: boolean
  triggerSupported: boolean
  conditionSupported: boolean
  waitSupported: boolean
  startStopSupported: boolean
  cdcMilestoneSupported: boolean
  snapshotMilestoneSupported: boolean
  delayMetricSupported: boolean
}

export interface WorkflowVariableSchemaItem {
  path: string
  type: string
  availableAtCompileTime?: boolean
  description?: string
}

export interface WorkflowRunQuery {
  workflowId?: string
  triggerType?: WorkflowTriggerType
  status?: WorkflowRunStatus
  from?: number
  to?: number
  skip?: number
  limit?: number
}

export interface WorkflowTriggerRecordQuery {
  workflowId?: string
  runId?: string
  decision?: TriggerDecisionKind
  skip?: number
  limit?: number
}

export const WORKFLOW_ACTIVE_STATUSES: WorkflowRunStatus[] = [
  'CREATED',
  'RUNNING',
  'WAITING',
  'RETRY_WAIT',
]

export const WORKFLOW_EVENT_TRIGGER_TYPES: WorkflowTriggerType[] = [
  'TASK_STARTED',
  'TASK_STOPPED',
  'TASK_ERROR',
  'SNAPSHOT_COMPLETED',
  'CDC_ENTERED',
  'INCREMENT_DELAY_BREACHED',
  'INSPECT_DIFF_BREACHED',
]

export function fetchWorkflows(filter?: Filter) {
  return requestClient.get<Page<WorkflowDefinitionDto>>(WORKFLOW_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function getWorkflow(id: string) {
  return requestClient.get<WorkflowDefinitionDto>(`${WORKFLOW_URL}/${id}`)
}

export function createWorkflow(payload: WorkflowSavePayload) {
  return requestClient.post<WorkflowDefinitionDto>(WORKFLOW_URL, payload)
}

export function updateWorkflow(id: string, payload: WorkflowSavePayload) {
  return requestClient.put<WorkflowDefinitionDto>(
    `${WORKFLOW_URL}/${id}`,
    payload,
  )
}

export function deleteWorkflow(id: string) {
  return requestClient.delete(`${WORKFLOW_URL}/${id}`)
}

export function validateWorkflowSpec(spec: WorkflowSpec) {
  return requestClient.post<WorkflowValidateResultDto>(
    `${WORKFLOW_URL}/validate`,
    spec,
  )
}

export function validateWorkflowById(id: string) {
  return requestClient.post<WorkflowValidateResultDto>(
    `${WORKFLOW_URL}/${id}/validate`,
  )
}

export function getWorkflowVariableSchema() {
  return requestClient.get<WorkflowVariableSchemaItem[]>(
    `${WORKFLOW_URL}/variable-schema`,
  )
}

export function getWorkflowCapabilities(taskIds: string[]) {
  return requestClient.get<WorkflowTaskCapability[]>(
    `${WORKFLOW_URL}/capabilities`,
    {
      params: { taskIds: taskIds.join(',') },
    },
  )
}

export function enableWorkflow(id: string) {
  return requestClient.post<WorkflowDefinitionDto>(
    `${WORKFLOW_URL}/${id}/enable`,
  )
}

export function disableWorkflow(id: string) {
  return requestClient.post<WorkflowDefinitionDto>(
    `${WORKFLOW_URL}/${id}/disable`,
  )
}

export function runWorkflow(id: string, body?: { contextTaskId?: string }) {
  return requestClient.post<TriggerDecision>(`${WORKFLOW_URL}/${id}/run`, body)
}

export function testWorkflow(id: string, body?: { contextTaskId?: string }) {
  return requestClient.post<TriggerDecision>(`${WORKFLOW_URL}/${id}/test`, body)
}

export function getWorkflowVersions(id: string) {
  return requestClient.get<WorkflowVersionDto[]>(
    `${WORKFLOW_URL}/${id}/versions`,
  )
}

export function fetchWorkflowRuns(query: WorkflowRunQuery = {}) {
  return requestClient.get<Page<WorkflowRunDto>>(RUN_URL, { params: query })
}

export function getWorkflowRun(runId: string) {
  return requestClient.get<WorkflowRunDto>(`${RUN_URL}/${runId}`)
}

export function stopWorkflowRun(runId: string) {
  return requestClient.post(`${RUN_URL}/${runId}/stop`)
}

export function resumeWorkflowRun(runId: string) {
  return requestClient.post(`${RUN_URL}/${runId}/resume`)
}

export function rerunWorkflowRun(runId: string) {
  return requestClient.post<TriggerDecision>(`${RUN_URL}/${runId}/rerun`)
}

export function fetchWorkflowTriggerRecords(
  query: WorkflowTriggerRecordQuery = {},
) {
  return requestClient.get<Page<WorkflowTriggerRecordDto>>(TRIGGER_RECORD_URL, {
    params: query,
  })
}

export function getWorkflowErrorPayload(error: unknown): {
  code?: string
  message?: string
  data?: unknown
} {
  const body = (error as { response?: { data?: any } })?.response?.data
  if (!body || typeof body !== 'object') return {}
  return {
    code: body.code,
    message: body.message,
    data: body.data,
  }
}
