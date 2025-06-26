import { requestClient } from '../request'
import { isPlainObj } from '@tap/shared'

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
  TaskInspectError = 'TASK_INSPECT_ERROR',
  TaskStatusError = 'TASK_STATUS_ERROR',
  TaskStatusStop = 'TASK_STATUS_STOP'
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
  Wechat = 'WECHAT'
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
  Task = 'TASK'
}

export enum Unit {
  Day = 'DAY',
  Hour = 'HOUR',
  MS = 'MS',
  Minute = 'MINUTE',
  Second = 'SECOND',
  Week = 'WEEK'
}

const BASE_URL = '/api/alarm'

export function listAlarmTasks() {
  return requestClient.get(`${BASE_URL}/list_task`)
}

export function listAlarms(params: any) {
  const config = { params }
  if (isPlainObj(params)) {
    Object.assign(config, params)
  }
  return requestClient.get(`${BASE_URL}/list`, config)
}

export function closeAlarms(ids: string) {
  return requestClient.post(`${BASE_URL}/close?ids=${ids}`)
}

export function getAlarmChannels() {
  return requestClient.get(`${BASE_URL}/channels`)
}

export function updateTaskAlarm(params: {
  alarmRules?: AlarmRuleVO[] | null
  alarmSettings?: AlarmSettingVO[] | null
  emailReceivers?: string[] | null
  nodeId?: null | string
  taskId?: null | string
}) {
  return requestClient.post(`${BASE_URL}/updateTaskAlarm`, params)
}
