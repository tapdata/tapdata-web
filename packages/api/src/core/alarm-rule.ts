import { requestClient } from '../request'

const BASE_URL = '/api/alarm_rule'

/**
 * 获取告警规则列表 - 获取系统告警规则配置
 */
export function fetchAlarmRules() {
  return requestClient.get(`${BASE_URL}/find`)
}

/**
 * 保存告警规则配置 - 保存系统告警规则设置
 */
export function saveAlarmRules(params: object) {
  return requestClient.post(`${BASE_URL}/save`, params)
}
