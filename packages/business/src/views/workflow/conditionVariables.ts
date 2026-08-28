import type {
  WorkflowConditionSpec,
  WorkflowSpec,
  WorkflowStepSpec,
  WorkflowStepType,
  WorkflowVariableSchemaItem,
} from '@tap/api/src/core/workflows'
import { INSPECT_STEP_TYPES, TRIGGER_TYPES } from './constants'

export type ConditionVarGroup =
  | 'trigger'
  | 'task'
  | 'inspect'
  | 'step'
  | 'run'
  | 'workflow'

export type ConditionEnumKey =
  | 'triggerType'
  | 'taskStatus'
  | 'inspectStatus'
  | 'inspectResult'
  | 'stepStatus'

export interface ConditionRef {
  id: string
  name?: string
  type?: WorkflowStepType
}

export interface ConditionVariableOption {
  path: string
  group: ConditionVarGroup
  label: string
  description: string
  valueType: WorkflowConditionSpec['valueType']
  enumKey?: ConditionEnumKey
  searchText: string
}

export interface ConditionVariableGroup {
  key: ConditionVarGroup
  label: string
  options: ConditionVariableOption[]
  emptyHint?: string
}

type Translate = (key: string) => string

const ALARM_ALIAS_PATHS = new Set([
  'workflowName',
  'taskName',
  'inspectName',
  'taskDesc',
  'alarmTime',
  'details',
  'errorTime',
  'errorLog',
])

const HIDDEN_CONDITION_PATHS = new Set([
  ...ALARM_ALIAS_PATHS,
  'step.id',
  'step.name',
  'step.type',
  'run.id',
  'run.triggerType',
  'run.startedAt',
  'workflow.id',
  'workflow.name',
  'workflow.version',
  'tasks.<taskId>.name',
  'inspects.<inspectId>.name',
])

const GROUP_ORDER: ConditionVarGroup[] = [
  'trigger',
  'task',
  'inspect',
  'step',
  'run',
  'workflow',
]

const FIELD_META: Record<
  string,
  {
    group: ConditionVarGroup
    labelKey: string
    tipKey: string
    enumKey?: ConditionEnumKey
    appliesTo?: WorkflowStepType[]
  }
> = {
  'run.id': {
    group: 'run',
    labelKey: 'packages_business_workflow_var_run_id',
    tipKey: 'packages_business_workflow_var_run_id_tip',
  },
  'run.triggerType': {
    group: 'run',
    labelKey: 'packages_business_workflow_var_run_triggerType',
    tipKey: 'packages_business_workflow_var_run_triggerType_tip',
    enumKey: 'triggerType',
  },
  'run.startedAt': {
    group: 'run',
    labelKey: 'packages_business_workflow_var_run_startedAt',
    tipKey: 'packages_business_workflow_var_run_startedAt_tip',
  },
  'workflow.id': {
    group: 'workflow',
    labelKey: 'packages_business_workflow_var_workflow_id',
    tipKey: 'packages_business_workflow_var_workflow_id_tip',
  },
  'workflow.name': {
    group: 'workflow',
    labelKey: 'packages_business_workflow_var_workflow_name',
    tipKey: 'packages_business_workflow_var_workflow_name_tip',
  },
  'workflow.version': {
    group: 'workflow',
    labelKey: 'packages_business_workflow_var_workflow_version',
    tipKey: 'packages_business_workflow_var_workflow_version_tip',
  },
  'trigger.taskId': {
    group: 'trigger',
    labelKey: 'packages_business_workflow_var_trigger_taskId',
    tipKey: 'packages_business_workflow_var_trigger_taskId_tip',
  },
  'trigger.inspectId': {
    group: 'trigger',
    labelKey: 'packages_business_workflow_var_trigger_inspectId',
    tipKey: 'packages_business_workflow_var_trigger_inspectId_tip',
  },
  'trigger.observedValue': {
    group: 'trigger',
    labelKey: 'packages_business_workflow_var_trigger_observedValue',
    tipKey: 'packages_business_workflow_var_trigger_observedValue_tip',
  },
  'trigger.delayTime': {
    group: 'trigger',
    labelKey: 'packages_business_workflow_var_trigger_delayTime',
    tipKey: 'packages_business_workflow_var_trigger_delayTime_tip',
  },
  'trigger.differenceNumber': {
    group: 'trigger',
    labelKey: 'packages_business_workflow_var_trigger_differenceNumber',
    tipKey: 'packages_business_workflow_var_trigger_differenceNumber_tip',
  },
  'tasks.<taskId>.name': {
    group: 'task',
    labelKey: 'packages_business_workflow_var_tasks_name',
    tipKey: 'packages_business_workflow_var_tasks_name_tip',
  },
  'tasks.<taskId>.delayTime': {
    group: 'task',
    labelKey: 'packages_business_workflow_var_tasks_delayTime',
    tipKey: 'packages_business_workflow_var_tasks_delayTime_tip',
  },
  'tasks.<taskId>.status': {
    group: 'task',
    labelKey: 'packages_business_workflow_var_tasks_status',
    tipKey: 'packages_business_workflow_var_tasks_status_tip',
    enumKey: 'taskStatus',
  },
  'tasks.<taskId>.cdcEntered': {
    group: 'task',
    labelKey: 'packages_business_workflow_var_tasks_cdcEntered',
    tipKey: 'packages_business_workflow_var_tasks_cdcEntered_tip',
  },
  'inspects.<inspectId>.name': {
    group: 'inspect',
    labelKey: 'packages_business_workflow_var_inspects_name',
    tipKey: 'packages_business_workflow_var_inspects_name_tip',
  },
  'inspects.<inspectId>.differenceNumber': {
    group: 'inspect',
    labelKey: 'packages_business_workflow_var_inspects_differenceNumber',
    tipKey: 'packages_business_workflow_var_inspects_differenceNumber_tip',
  },
  'inspects.<inspectId>.status': {
    group: 'inspect',
    labelKey: 'packages_business_workflow_var_inspects_status',
    tipKey: 'packages_business_workflow_var_inspects_status_tip',
    enumKey: 'inspectStatus',
  },
  'inspects.<inspectId>.result': {
    group: 'inspect',
    labelKey: 'packages_business_workflow_var_inspects_result',
    tipKey: 'packages_business_workflow_var_inspects_result_tip',
    enumKey: 'inspectResult',
  },
  'steps.<stepId>.status': {
    group: 'step',
    labelKey: 'packages_business_workflow_var_steps_status',
    tipKey: 'packages_business_workflow_var_steps_status_tip',
    enumKey: 'stepStatus',
  },
  'steps.<stepId>.output.differenceNumber': {
    group: 'step',
    labelKey: 'packages_business_workflow_var_steps_output_differenceNumber',
    tipKey: 'packages_business_workflow_var_steps_output_differenceNumber_tip',
    appliesTo: INSPECT_STEP_TYPES,
  },
  'steps.<stepId>.errorCode': {
    group: 'step',
    labelKey: 'packages_business_workflow_var_steps_errorCode',
    tipKey: 'packages_business_workflow_var_steps_errorCode_tip',
  },
}

export const TASK_STATUS_VALUES = [
  'running',
  'error',
  'stop',
  'complete',
  'wait_run',
  'scheduling',
  'stopping',
  'edit',
  'Retrying',
] as const

export const INSPECT_STATUS_VALUES = [
  'scheduling',
  'running',
  'done',
  'error',
  'stopping',
  'waiting',
] as const

export const INSPECT_RESULT_VALUES = ['passed', 'failed'] as const

export const STEP_STATUS_VALUES = [
  'SUCCEEDED',
  'FAILED',
  'CONDITION_NOT_MET',
  'WAITING',
  'RETRYABLE',
] as const

export const TRIGGER_TYPE_VALUES = [...TRIGGER_TYPES, 'MANUAL_TEST'] as const

const EMPTY_HINT: Record<ConditionVarGroup, string | undefined> = {
  trigger: undefined,
  task: 'packages_business_workflow_condition_empty_task',
  inspect: 'packages_business_workflow_condition_empty_inspect',
  step: 'packages_business_workflow_condition_empty_step',
  run: undefined,
  workflow: undefined,
}

function toValueType(type?: string): WorkflowConditionSpec['valueType'] {
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  return 'string'
}

function refsFor(
  template: string,
  args: { tasks: ConditionRef[]; inspects: ConditionRef[]; steps: ConditionRef[] },
) {
  if (template.includes('<taskId>')) return args.tasks
  if (template.includes('<inspectId>')) return args.inspects
  if (template.includes('<stepId>')) return args.steps
  return null
}

function expandPath(template: string, id: string) {
  return template
    .replace('<taskId>', id)
    .replace('<inspectId>', id)
    .replace('<stepId>', id)
}

export function buildConditionVariableGroups(args: {
  schema: WorkflowVariableSchemaItem[]
  tasks: ConditionRef[]
  inspects: ConditionRef[]
  steps: ConditionRef[]
  t: Translate
}): ConditionVariableGroup[] {
  const byGroup = new Map<ConditionVarGroup, ConditionVariableOption[]>()
  for (const key of GROUP_ORDER) byGroup.set(key, [])

  for (const item of args.schema || []) {
    const template = item.path
    if (!template || HIDDEN_CONDITION_PATHS.has(template)) {
      continue
    }
    if (item.type === 'object') continue
    const meta = FIELD_META[template]
    if (!meta) continue
    const fieldLabel = args.t(meta.labelKey)
    const description = args.t(meta.tipKey)
    const valueType = toValueType(item.type)
    const refs = refsFor(template, args)
    if (refs) {
      for (const ref of refs) {
        if (!ref.id) continue
        if (meta.appliesTo?.length && ref.type && !meta.appliesTo.includes(ref.type)) {
          continue
        }
        const path = expandPath(template, ref.id)
        const owner = ref.name || ref.id
        const label = `${owner} · ${fieldLabel}`
        byGroup.get(meta.group)?.push({
          path,
          group: meta.group,
          label,
          description,
          valueType,
          enumKey: meta.enumKey,
          searchText: `${label} ${path} ${description} ${owner}`,
        })
      }
      continue
    }
    byGroup.get(meta.group)?.push({
      path: template,
      group: meta.group,
      label: fieldLabel,
      description,
      valueType,
      enumKey: meta.enumKey,
      searchText: `${fieldLabel} ${template} ${description}`,
    })
  }

  return GROUP_ORDER.map((key) => {
    const options = byGroup.get(key) || []
    const emptyKey = EMPTY_HINT[key]
    return {
      key,
      label: args.t(`packages_business_workflow_var_group_${key}`),
      options,
      emptyHint: !options.length && emptyKey ? args.t(emptyKey) : undefined,
    }
  }).filter((group) => group.options.length || group.emptyHint)
}

export function findConditionVariableOption(
  groups: ConditionVariableGroup[],
  path?: string | null,
) {
  if (!path) return null
  for (const group of groups) {
    const hit = group.options.find((item) => item.path === path)
    if (hit) return hit
  }
  return null
}

export function collectInspectIds(spec?: WorkflowSpec | null) {
  const ids = new Set<string>()
  const visit = (steps: WorkflowStepSpec[] = []) => {
    for (const step of steps) {
      step.inspectIds?.forEach((id) => ids.add(id))
      visit(step.thenSteps)
      visit(step.elseSteps)
    }
  }
  spec?.trigger?.inspectIds?.forEach((id) => ids.add(id))
  visit(spec?.steps)
  return [...ids]
}

export function previousStepsForCondition(
  spec?: WorkflowSpec | null,
  currentStepId?: string | null,
) {
  const found: WorkflowStepSpec[] = []
  if (!spec?.steps?.length || !currentStepId) return found
  const walk = (steps: WorkflowStepSpec[] = []) => {
    for (const step of steps) {
      if (step.stepId === currentStepId) return true
      found.push(step)
      if (walk(step.thenSteps)) return true
      if (walk(step.elseSteps)) return true
    }
    return false
  }
  return walk(spec.steps) ? found : []
}
