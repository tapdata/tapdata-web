import type {
  WorkflowRunStatus,
  WorkflowStepType,
  WorkflowTriggerType,
} from '@tap/api/src/core/workflows'

export const DEFAULT_JS_SCRIPT = `function main(ctx) {
  return {
    attempt: ctx.attempt,
    runId: ctx.runId,
    stepId: ctx.stepId
  };
}
`

export const TRIGGER_TYPES: WorkflowTriggerType[] = [
  'MANUAL',
  'SCHEDULE_ONCE',
  'SCHEDULE_INTERVAL',
  'SCHEDULE_DAILY',
  'SCHEDULE_WEEKLY',
  'TASK_STARTED',
  'TASK_STOPPED',
  'TASK_ERROR',
  'SNAPSHOT_COMPLETED',
  'CDC_ENTERED',
  'INCREMENT_DELAY_BREACHED',
  'INSPECT_DIFF_BREACHED',
]

export const STEP_TYPES: WorkflowStepType[] = [
  'TASK_START',
  'TASK_STOP',
  'INSPECT_START',
  'INSPECT_DIFF',
  'INSPECT_REPAIR',
  'WAIT',
  'CONDITION',
  'IF_ELSE',
  'ALARM',
  'WEBHOOK',
  'JAVASCRIPT',
]

export const INSPECT_STEP_TYPES: WorkflowStepType[] = [
  'INSPECT_START',
  'INSPECT_DIFF',
  'INSPECT_REPAIR',
]

export const INSPECT_DIFF_METHODS = ['field', 'jointField'] as const

export const NESTABLE_STEP_TYPES: WorkflowStepType[] = STEP_TYPES.filter(
  (type) => type !== 'IF_ELSE',
)

/** Hidden from the editor palette; existing saved steps still render. */
export const HIDDEN_PALETTE_STEP_TYPES: WorkflowStepType[] = [
  'CONDITION',
  'IF_ELSE',
]

const ALL_PALETTE_GROUPS: {
  key: string
  types: WorkflowStepType[]
}[] = [
  { key: 'task', types: ['TASK_START', 'TASK_STOP', 'WAIT'] },
  {
    key: 'inspect',
    types: ['INSPECT_START', 'INSPECT_DIFF', 'INSPECT_REPAIR'],
  },
  { key: 'control', types: ['CONDITION', 'IF_ELSE'] },
  { key: 'action', types: ['ALARM', 'WEBHOOK', 'JAVASCRIPT'] },
]

export const PALETTE_GROUPS = ALL_PALETTE_GROUPS.map((group) => ({
  ...group,
  types: group.types.filter(
    (type) => !HIDDEN_PALETTE_STEP_TYPES.includes(type),
  ),
})).filter((group) => group.types.length > 0)

export const WORKFLOW_STEP_DRAG_GROUP = 'workflow-steps'

export const RUN_STATUSES: WorkflowRunStatus[] = [
  'CREATED',
  'RUNNING',
  'WAITING',
  'RETRY_WAIT',
  'SUCCEEDED',
  'COMPLETED_WITH_WARNINGS',
  'CONDITION_NOT_MET',
  'FAILED',
  'STOPPED',
]

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]

export const CONDITION_OPERATORS = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
] as const

export const TIMEZONES = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
]

export function triggerLabelKey(type: string) {
  return `packages_business_workflow_trigger_${type}`
}

export function triggerCardTitleKey(type?: string | null) {
  const value = type || 'MANUAL'
  if (value === 'MANUAL' || value === 'MANUAL_TEST') {
    return 'packages_business_workflow_trigger_title_manual'
  }
  if (value.startsWith('SCHEDULE_')) {
    return 'packages_business_workflow_trigger_title_schedule'
  }
  return 'packages_business_workflow_trigger_title_event'
}

export function stepLabelKey(type: string) {
  return `packages_business_workflow_step_${type}`
}

export function runStatusLabelKey(status: string) {
  return `packages_business_workflow_run_${status}`
}

export function runStatusTagType(
  status?: string | null,
): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  switch (status) {
    case 'SUCCEEDED':
      return 'success'
    case 'COMPLETED_WITH_WARNINGS':
    case 'WAITING':
    case 'RETRY_WAIT':
      return 'warning'
    case 'FAILED':
      return 'danger'
    case 'CREATED':
    case 'RUNNING':
      return 'primary'
    default:
      return 'info'
  }
}
