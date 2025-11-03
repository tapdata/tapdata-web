import Cookie from '@tap/shared/src/cookie'
import { requestClient } from '../request'

const BASE_URL = '/api/proxy'
const IS_DAAS = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

export function getProxyId() {
  return requestClient.get(`${BASE_URL}/id`)
}

export function subscribeProxy(params: any) {
  return requestClient.post(`${BASE_URL}/subscribe`, params)
}

export function callProxy(params: any) {
  return requestClient.post(`${BASE_URL}/call`, params)
}

export function commandProxy(params: any) {
  return requestClient.post(`${BASE_URL}/command`, params)
}

export function getSupervisor(pid: string) {
  return requestClient.get(`${BASE_URL}/supervisor?pid=${pid}`)
}

export function getConnectors(pid: string) {
  return requestClient.get(`${BASE_URL}/memory/connectors?pid=${pid}`)
}

export function getCallHistory(params: any) {
  return requestClient.get(`${BASE_URL}/call/history`, { params })
}

export function generateRefreshToken(params: any) {
  return requestClient.post(`${BASE_URL}/generate/refresh-token`, params)
}

export function getProxyHost() {
  return requestClient.get(`${BASE_URL}/host`)
}

export function downloadInspectRecoverSql(
  inspectId: string,
  inspectResultId: string,
) {
  let url = `${BASE_URL}/download/inspect-recover-sql?inspectId=${inspectId}&inspectResultId=${inspectResultId}`

  if (IS_DAAS) {
    const accessToken = Cookie.get('access_token')
    url += `&access_token=${accessToken}`
  } else if (TAP_ACCESS_TOKEN) {
    url += `&__token=${TAP_ACCESS_TOKEN}`
  }

  window.open(url)
}

export function downloadTaskInspectRecoverSql(
  taskId: string,
  manualId: string,
) {
  return requestClient.get(`${BASE_URL}/download/task-inspect-recover-sql`, {
    params: {
      taskId,
      manualId,
    },
    responseType: 'blob',
    responseReturn: 'raw',
  })
}
