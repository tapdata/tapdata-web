import Http from './Http'
import { isPlainObj } from '@tap/shared'

/**
 * AlarmVO
 */
export interface ApifoxModel {
  alarmRules?: AlarmRuleVO[] | null
  alarmSettings?: AlarmSettingVO[] | null
  nodeId?: null | string
  taskId?: null | string
  [property: string]: any
}

/**
 * AlarmRuleVO
 */
export interface AlarmRuleVO {
  /**
   * -1 小于等于 <= ; 0; 1 大于等于 >=
   */
  equalsFlag?: number | null
  key?: Key
  /**
   * 毫秒
   */
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

/**
 * AlarmSettingVO
 */
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

/**
 * Map«Object»
 */
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
export default class AlarmAPI extends Http {
  constructor() {
    super('/api/alarm')
  }
  listTask() {
    return this.axios.get(`${this.url}/list_task`)
  }

  list(params) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get(`${this.url}/list`, config)
  }
  close(ids) {
    return this.axios.post(`${this.url}/close?ids=${ids}`)
  }
  channels() {
    return this.axios.get(`${this.url}/channels`)
  }
  updateTaskAlarm(params: {
    alarmRules?: AlarmRuleVO[] | null
    alarmSettings?: AlarmSettingVO[] | null
    nodeId?: null | string
    taskId?: null | string
  }) {
    return this.axios.post(`${this.url}/updateTaskAlarm`, params)
  }
}
export { AlarmAPI }
