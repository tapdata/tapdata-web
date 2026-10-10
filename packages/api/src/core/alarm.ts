import { requestClient } from '../request'

// Re-export types from the original file
export interface ApifoxModel {
  alarmRules?: AlarmRuleVO[] | null
  alarmSettings?: AlarmSettingVO[] | null
  nodeId?: null | string
  taskId?: null | string
  [property: string]: any
}

export interface AlarmRuleVO {
  equalsFlag?: number | null
  key?: Key
  ms?: number | null
  point?: number | null
  [property: string]: any
}

export enum Key {
  DatanodeAverageHandleConsume = 'DATANODE_AVERAGE_HANDLE_CONSUME',
  DatanodeCannotConnect = 'DATANODE_CANNOT_CONNECT',
  DatanodeHTTPConnectConsume = 'DATANODE_HTTP_CONNECT_CONSUME',
  DatanodeTCPConnectConsume = 'DATANODE_TCP_CONNECT_CONSUME',
  InspectCountError = 'INSPECT_COUNT_ERROR',
  InspectTaskError = 'INSPECT_TASK_ERROR',
  InspectValueError = 'INSPECT_VALUE_ERROR',
  ProcessnodeAverageHandleConsume = 'PROCESSNODE_AVERAGE_HANDLE_CONSUME',
  SystemFlowEgingeDown = 'SYSTEM_FLOW_EGINGE_DOWN',
  SystemFlowEgingeUp = 'SYSTEM_FLOW_EGINGE_UP',
  TaskFullComplete = 'TASK_FULL_COMPLETE',
  TaskIncrementDelay = 'TASK_INCREMENT_DELAY',
  TaskIncrementStart = 'TASK_INCREMENT_START',
  TaskDdlWarning = 'TASK_DDL_WARNING',
  TaskDataIntegrityRisk = 'TASK_DATA_INTEGRITY_RISK',
  TaskInspectError = 'TASK_INSPECT_ERROR',
  TaskStatusError = 'TASK_STATUS_ERROR',
  TaskStatusStop = 'TASK_STATUS_STOP',
}

export interface AlarmSettingVO {
  interval?: number | null
  key?: Key
  notify?: Notify[] | null
  open?: boolean | null
  params?: MapObject
  sort?: number | null
  type?: Type
  unit?: Unit
  [property: string]: any
}

export enum Notify {
  Email = 'EMAIL',
  SMS = 'SMS',
  System = 'SYSTEM',
  Wechat = 'WECHAT',
}

export interface MapObject {
  key?: { [key: string]: any }
  [property: string]: any
}

export enum Type {
  Datanode = 'DATANODE',
  Inspect = 'INSPECT',
  Processnode = 'PROCESSNODE',
  System = 'SYSTEM',
  Task = 'TASK',
}

export enum Unit {
  Day = 'DAY',
  Hour = 'HOUR',
  MS = 'MS',
  Minute = 'MINUTE',
  Second = 'SECOND',
  Week = 'WEEK',
}

const BASE_URL = '/api/alarm'

export function listAlarmTasks() {
  return requestClient.get(`${BASE_URL}/list_task`)
}

export function listAlarms(params: any) {
  return requestClient.get(`${BASE_URL}/list`, { params })
}

export function closeAlarms(ids: string) {
  return requestClient.post(`${BASE_URL}/close?ids=${ids}`)
}

export function getAlarmChannels() {
  return requestClient.get(`${BASE_URL}/channels`)
}

export type AlarmReceiverType = 'USER' | 'USER_GROUP' | 'EMAIL'

export type AlarmReceiverStatus = 'SYSTEM_DEFAULT' | 'CUSTOM' | 'NONE'

export type AlarmReceiverMode = 'APPEND' | 'REPLACE' | 'REMOVE'

export interface AlarmReceiver {
  type: AlarmReceiverType
  id?: string
  email?: string
}

export interface AlarmReceiverCandidateUser {
  id: string
  username: string
  email?: string
}

export interface AlarmReceiverCandidateGroup {
  id: string
  name: string
  gid?: string
  parentId?: string
  validEmailCount?: number
}

export interface AlarmReceiverCandidates {
  users?: AlarmReceiverCandidateUser[]
  groups?: AlarmReceiverCandidateGroup[]
}

export interface AlarmReceiverPreviewEmail {
  email: string
  sources?: string[]
}

export interface AlarmReceiverPreviewInvalid {
  type?: string
  id?: string
  reason?: string
}

export interface AlarmReceiverPreview {
  mode?: string
  status?: AlarmReceiverStatus
  emails?: AlarmReceiverPreviewEmail[]
  invalid?: AlarmReceiverPreviewInvalid[]
}

export interface BatchUpdateTaskAlarmDetail {
  id: string
  name?: string
  code: string
  message?: string
}

export interface BatchUpdateTaskAlarmResult {
  succeeded?: number
  failed?: number
  skipped?: number
  details?: BatchUpdateTaskAlarmDetail[]
}

export function updateTaskAlarm(params: {
  alarmRules?: AlarmRuleVO[] | null
  alarmSettings?: AlarmSettingVO[] | null
  alarmReceivers?: AlarmReceiver[] | null
  useSystemDefaultReceivers?: boolean
  nodeId?: null | string
  taskId?: null | string
}) {
  return requestClient.post(`${BASE_URL}/updateTaskAlarm`, params)
}

export function batchUpdateTaskAlarm(params: {
  taskIds: string[]
  alarmRules?: AlarmRuleVO[] | null
  alarmSettings?: AlarmSettingVO[] | null
  alarmReceivers?: AlarmReceiver[] | null
  receiverMode?: AlarmReceiverMode
}) {
  return requestClient.post<BatchUpdateTaskAlarmResult>(
    '/api/task/alarm/batch-update',
    params,
  )
}

export function fetchAlarmReceiverCandidates(params?: {
  taskId?: string
  taskIds?: string[] | string
}) {
  const query: Record<string, string> = {}
  if (params?.taskId) query.taskId = params.taskId
  if (params?.taskIds) {
    query.taskIds = Array.isArray(params.taskIds)
      ? params.taskIds.filter(Boolean).join(',')
      : params.taskIds
  }
  return requestClient.get<AlarmReceiverCandidates>(
    `${BASE_URL}/receiverCandidates`,
    { params: query },
  )
}

export function fetchAlarmReceiverPreview(taskId: string) {
  return requestClient.get<AlarmReceiverPreview>(
    `${BASE_URL}/receiverPreview`,
    { params: { taskId } },
  )
}
