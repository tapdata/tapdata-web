import {
  WORKFLOW_EVENT_TRIGGER_TYPES,
  type WorkflowConditionSpec,
  type WorkflowDefinitionDto,
  type WorkflowSpec,
  type WorkflowStepRunDto,
  type WorkflowStepSpec,
  type WorkflowStepType,
  type WorkflowTriggerSpec,
  type WorkflowTriggerType,
  type WorkflowValidationIssue,
} from '@tap/api/src/core/workflows'
import dayjs from 'dayjs'
import { DEFAULT_ALARM_HTML, DEFAULT_ALARM_TITLE } from './alarmTemplate'
import { DEFAULT_WEBHOOK_BODY } from './webhookTemplate'
import { DEFAULT_JS_SCRIPT } from './constants'

export function createStepId() {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function emptyCondition(): WorkflowConditionSpec {
  return {
    variable: '',
    operator: 'eq',
    valueType: 'string',
    value: '',
  }
}

const UNUSED_DEFAULT_VARIABLES = new Set([
  '',
  'run.triggerType',
  'run.id',
  'run.startedAt',
])

export function isUnusedConditionDefault(item?: WorkflowConditionSpec | null) {
  if (!item) return true
  const emptyValue = item.value === '' || item.value == null
  return UNUSED_DEFAULT_VARIABLES.has(item.variable || '') && emptyValue
}

export function sanitizeConditions(list?: WorkflowConditionSpec[] | null) {
  const kept = (list || []).filter((item) => !isUnusedConditionDefault(item))
  return kept.length ? kept : [emptyCondition()]
}

export function createEmptyTrigger(): WorkflowTriggerSpec {
  return { type: 'MANUAL' }
}

export function createEmptyStep(type: WorkflowStepType): WorkflowStepSpec {
  const step: WorkflowStepSpec = {
    stepId: createStepId(),
    name: '',
    type,
  }
  switch (type) {
    case 'TASK_START':
    case 'TASK_STOP':
      step.taskIds = []
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
    case 'INSPECT_START':
    case 'INSPECT_DIFF':
    case 'INSPECT_REPAIR':
      step.inspectIds = []
      step.timeoutMs = 3_600_000
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
    case 'WAIT':
      step.taskIds = []
      step.predicate = 'CDC_ENTERED'
      step.join = 'ALL'
      step.timeoutMs = 3_600_000
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
    case 'CONDITION':
      step.logic = 'AND'
      step.conditions = [emptyCondition()]
      break
    case 'IF_ELSE':
      step.logic = 'AND'
      step.conditions = [emptyCondition()]
      step.thenSteps = []
      step.elseSteps = []
      break
    case 'ALARM':
      step.alarmTitle = DEFAULT_ALARM_TITLE
      step.alarmMessage = DEFAULT_ALARM_HTML
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
    case 'WEBHOOK':
      step.webhookUrl = ''
      step.webhookMethod = 'POST'
      step.webhookToken = ''
      step.webhookBody = DEFAULT_WEBHOOK_BODY
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
    case 'JAVASCRIPT':
      step.script = DEFAULT_JS_SCRIPT
      step.connectionIds = []
      step.maxRetries = 0
      step.retryIntervalMs = 10_000
      step.exhaustedPolicy = 'STOP_WORKFLOW'
      break
  }
  return step
}

export function normalizeSpec(spec: WorkflowSpec): WorkflowSpec {
  spec.trigger = spec.trigger || createEmptyTrigger()
  spec.steps = spec.steps || []
  const visit = (list: WorkflowStepSpec[] = []) => {
    for (const step of list) {
      if (step.type === 'CONDITION' || step.type === 'IF_ELSE') {
        step.conditions = sanitizeConditions(step.conditions)
      }
      if (step.type === 'IF_ELSE') {
        step.thenSteps = step.thenSteps || []
        step.elseSteps = step.elseSteps || []
        visit(step.thenSteps)
        visit(step.elseSteps)
      }
    }
  }
  visit(spec.steps)
  return spec
}

export function createEmptySpec(name = ''): WorkflowSpec {
  return normalizeSpec({
    name,
    description: '',
    trigger: createEmptyTrigger(),
    steps: [],
  })
}

export function isEventTrigger(type?: WorkflowTriggerType | string | null) {
  return (
    !!type && WORKFLOW_EVENT_TRIGGER_TYPES.includes(type as WorkflowTriggerType)
  )
}

export function triggerContextIds(trigger?: WorkflowTriggerSpec) {
  if (!trigger) return []
  return [...(trigger.taskIds || []), ...(trigger.inspectIds || [])]
}

export function canEditDefinition(row?: Partial<WorkflowDefinitionDto> | null) {
  return !!row && row.enabled !== true && !row.hasActiveRun
}

export function canDeleteDefinition(
  row?: Partial<WorkflowDefinitionDto> | null,
) {
  return !!row && row.enabled !== true && !row.hasActiveRun
}

export function canRunDefinition(row?: Partial<WorkflowDefinitionDto> | null) {
  return !!row && row.enabled === true && !row.hasActiveRun
}

export function canTestDefinition(row?: Partial<WorkflowDefinitionDto> | null) {
  return !!row && !row.hasActiveRun
}

export function formatDateTime(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-'
}

export function formatDuration(ms?: number | null) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`
}

export function msToUnit(ms?: number | null, unit: 's' | 'm' = 's') {
  if (!ms) return undefined
  return unit === 'm' ? ms / 60_000 : ms / 1000
}

export function unitToMs(
  value?: number | string | null,
  unit: 's' | 'm' = 's',
) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return unit === 'm' ? n * 60_000 : n * 1000
}

export function issuesByStep(issues: WorkflowValidationIssue[] = []) {
  const map: Record<string, WorkflowValidationIssue[]> = {}
  for (const issue of issues) {
    const key = issue.stepId || '_trigger'
    if (!map[key]) map[key] = []
    map[key].push(issue)
  }
  return map
}

export function collectTaskIds(spec?: WorkflowSpec | null) {
  const ids = new Set<string>()
  const visit = (steps: WorkflowStepSpec[] = []) => {
    for (const step of steps) {
      step.taskIds?.forEach((id) => ids.add(id))
      visit(step.thenSteps)
      visit(step.elseSteps)
    }
  }
  spec?.trigger?.taskIds?.forEach((id) => ids.add(id))
  visit(spec?.steps)
  return [...ids]
}

export function cloneSpec(spec: WorkflowSpec): WorkflowSpec {
  return JSON.parse(JSON.stringify(spec)) as WorkflowSpec
}

export function stepTimelineHeading(
  step: WorkflowStepRunDto | undefined,
  stepId: string,
  typeLabel: (type: string) => string,
) {
  if (!step) return stepId
  if (step.summary) return step.summary
  if (step.stepName) return step.stepName
  if (step.title) return step.title
  if (step.stepType) return typeLabel(step.stepType)
  return stepId
}

export function unmetTaskLabel(
  taskId: string,
  targets?: { id?: string; name?: string }[] | null,
) {
  const hit = targets?.find((item) => item.id === taskId)
  return hit?.name || taskId
}

export function formatStepOutput(step: WorkflowStepRunDto): string | null {
  const output = step.output
  if (!output || Object.keys(output).length === 0) return null
  if (step.stepType === 'WEBHOOK') {
    const view: Record<string, unknown> = {}
    if (output.statusCode != null) view.statusCode = output.statusCode
    const body = parseJsonish(output.body)
    if (body !== undefined) view.body = body
    if (Object.keys(view).length === 0) return stringifyOutput(output)
    return stringifyOutput(view)
  }
  return stringifyOutput(output)
}

function parseJsonish(value: unknown) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function stringifyOutput(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
