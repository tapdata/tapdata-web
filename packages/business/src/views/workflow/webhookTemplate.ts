import { ALARM_TEMPLATE_VARIABLES } from './alarmTemplate'

export const DEFAULT_WEBHOOK_BODY = `{
  "workflowName": "{workflowName}",
  "workflowId": "{workflowId}",
  "runId": "{runId}",
  "stepName": "{stepName}",
  "triggerType": "{triggerType}",
  "taskName": "{taskName}",
  "inspectName": "{inspectName}",
  "taskDesc": "{taskDesc}",
  "alarmTime": "{alarmTime}",
  "details": "{details}",
  "delayTime": "{delayTime}"
}
`

export const WEBHOOK_METHODS = ['POST', 'PUT', 'PATCH', 'GET'] as const

export const WEBHOOK_TEMPLATE_VARIABLES = [
  { name: 'workflowId', labelKey: 'packages_business_workflow_id', icon: 'hash' },
  ...ALARM_TEMPLATE_VARIABLES,
] as const
