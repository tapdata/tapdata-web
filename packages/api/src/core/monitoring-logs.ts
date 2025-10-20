import { requestClient } from '../request'

const BASE_URL = '/api/MonitoringLogs'

export function queryMonitoringLogs(params: any) {
  return requestClient.post(`${BASE_URL}/query`, params)
}

export function exportMonitoringLogs(params: any) {
  return requestClient.post(`${BASE_URL}/export`, params, {
    responseType: 'blob',
  })
}
