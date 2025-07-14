import { requestClient } from '../request'

const BASE_URL = '/api/alarmMail'

export interface AlarmMailConfig {
  type: 'EMAIL'
  emailAddressList: string[]
  [key: string]: any
}

export interface AlarmMailResponse {
  emailAddressList?: string[]
  [key: string]: any
}

/**
 * 获取告警邮件配置 - 获取当前的邮件接收者列表
 */
export function fetchAlarmMails() {
  return requestClient.get<AlarmMailResponse>(BASE_URL)
}

/**
 * 保存告警邮件配置 - 设置告警邮件接收者列表
 */
export function saveAlarmMailConfig(params: AlarmMailConfig) {
  return requestClient.post(`${BASE_URL}/save`, params)
}
