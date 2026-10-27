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

export interface SystemNotificationStatusItem {
  key: string
  open: boolean
  channels: Notify[]
}

export interface SystemNotificationStatus {
  supported: boolean
  items: SystemNotificationStatusItem[]
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

export function getSystemNotificationStatus(
  params: {
    taskId?: string
    inspectId?: string
  } = {},
) {
  return requestClient.get(`${BASE_URL}/system-notification-status`, {
    params,
  })
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

/* ---------- 告警事件（TAP-13052） ---------- */

export type AlarmObjectType =
  | 'TASK'
  | 'NODE'
  | 'CONNECTION'
  | 'AGENT'
  | 'INSPECT'
  | 'API_SERVER'

export interface DeliveryChannelSummary {
  total: number
  success: number
  failed: number
  skipped: number
}

export interface DeliverySummary {
  status: 'NONE' | 'SUCCESS' | 'PARTIAL_FAILED' | 'FAILED' | 'SKIPPED'
  total: number
  success: number
  failed: number
  skipped: number
  channels: Notify[]
  byChannel: Partial<Record<Notify | 'WEBHOOK', DeliveryChannelSummary>>
  latestDeliveryTime?: string
}

export interface AlarmEvent {
  id: string
  level: string
  status: 'ING' | 'RECOVER' | 'CLOESE'
  metric: string
  summary: string
  objectType: AlarmObjectType
  objectId?: string
  objectName?: string
  objectDeleted: boolean
  taskId?: string
  taskName?: string
  syncType?: string
  nodeId?: string
  nodeName?: string
  agentId?: string
  connectionId?: string
  inspectId?: string
  serverId?: string
  apiId?: string
  currentValue?: number
  threshold?: number
  firstOccurrenceTime?: string
  lastOccurrenceTime?: string
  occurrenceCount?: number
  recoveryTime?: string
  closeTime?: string
  closeBy?: string
  /** 任务重新运行时由系统归档 */
  archived?: boolean
  lastNotifyTime?: string
  deliverySummary?: DeliverySummary
}

export interface AlarmEventStats {
  alarming: number
  severe: number
  todayNew: number
  todayRecovered: number
}

/** 数组参数以逗号拼接，服务端按列表绑定 */
export function joinListParams(params: Record<string, any> = {}) {
  const result: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      if (value.length) result[key] = value.join(',')
      return
    }
    result[key] = value
  })
  return result
}

export function listAlarmEvents(params: Record<string, any>) {
  return requestClient.get<{ total: number; items: AlarmEvent[] }>(
    '/api/alarms',
    { params: joinListParams(params) },
  )
}

export function getAlarmEvent(id: string) {
  return requestClient.get<AlarmEvent>(`/api/alarms/${id}`)
}

export function getAlarmEventStats() {
  return requestClient.get<AlarmEventStats>('/api/alarms/stats')
}

/** 关闭告警事件，需要告警关闭权限并写入操作审计 */
export function closeAlarmEvents(ids: string[]) {
  return requestClient.post('/api/alarms/close', ids)
}
