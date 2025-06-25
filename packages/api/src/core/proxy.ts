import { requestClient } from '../request'

const BASE_URL = '/api/proxy'

// 类型定义
export interface ProxyCommandParams {
  className?: string
  method?: string
  args?: any[]
  pdkHash?: string
  connectionId?: string
  connectionConfig?: any
  nodeConfig?: any
  command?: string
  type?: string
  action?: string
  argMap?: any
  subscribeIds?: string[]
  time?: number
  _?: string
}

export interface ProxyCallParams {
  className: string
  method: string
  args: any[]
  _?: string
}

export interface ProxySubscribeParams {
  subscribeId?: string
  service?: string
  expireSeconds?: number
  [key: string]: any
}

export interface ProxyTokenParams {
  [key: string]: any
}

export function getProxyId() {
  return requestClient.get(`${BASE_URL}/id`)
}

export function subscribeProxy(params: ProxySubscribeParams) {
  return requestClient.post(`${BASE_URL}/subscribe`, params)
}

export function executeProxyCommand(params: ProxyCommandParams) {
  return requestClient.post(`${BASE_URL}/command`, params)
}

export function callProxyMethod(params: ProxyCallParams) {
  return requestClient.post(`${BASE_URL}/call`, params)
}

export function getProxySupervisor(pid: string) {
  return requestClient.get(`${BASE_URL}/supervisor?pid=${pid}`)
}

export function getProxyConnectors(pid: string) {
  return requestClient.get(`${BASE_URL}/memory/connectors?pid=${pid}`)
}

export function getProxyCallHistory(params: any) {
  return requestClient.get(`${BASE_URL}/call/history`, { params })
}

export function generateProxyRefreshToken(params: ProxyTokenParams) {
  return requestClient.post(`${BASE_URL}/generate/refresh-token`, params)
}

export function getProxyHost() {
  return requestClient.get(`${BASE_URL}/host`)
}

// Base Http methods that are used in the codebase
export function fetchProxyData(params?: any, filter?: any) {
  if (Array.isArray(params)) {
    let queryStr = ''
    if (typeof filter === 'object') {
      queryStr = JSON.stringify(filter)
    } else if (typeof filter === 'string') {
      queryStr = filter
    }
    const qs = queryStr ? `?filter=${encodeURIComponent(queryStr)}` : ''
    return requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
  } else if (typeof params === 'string') {
    return requestClient.get(`${BASE_URL}/${params}`, { params: filter })
  }
  params = params || {}
  return requestClient.get(BASE_URL, { params })
}

export function countProxyData(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function patchProxyData(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function deleteProxyData(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createProxyData(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneProxyData(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}
