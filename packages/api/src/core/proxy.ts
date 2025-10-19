import { requestClient } from '../request'

const BASE_URL = '/api/proxy'

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
