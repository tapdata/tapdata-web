import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/ApiCalls'
const DEBUG_BASE_URL = '/api/debug'

export interface ApiCall {
  id: string
  method: string
  url: string
  statusCode: number
  responseTime: number
  createTime: string
  createTimeFmt: string
  createBy: string
  createByName: string
  updateTime: string
  updateTimeFmt: string
}

/**
 * 获取所有HTTP方法 - 用于API审计页面的方法筛选
 */
export function fetchAllMethods(params?: unknown) {
  return requestClient.get(`${BASE_URL}/getAllMethod`, { params })
}

/**
 * 获取所有响应状态码 - 用于API审计页面的状态码筛选
 */
export function fetchAllResponseCodes(params?: unknown) {
  return requestClient.get(`${BASE_URL}/getAllResponseCode`, { params })
}

// Base Http methods that are used in the codebase
export function fetchApiCalls(filter?: Filter) {
  return requestClient.get<PageFetchResult<ApiCall>>(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function fetchApiCall(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

/**d
 * 获取API客户端名称列表 - 用于筛选条件
 */
export function fetchApiClientNames() {
  return requestClient.get(`${BASE_URL}/findClients`)
}

export function debug(data: Record<string, any>) {
  return requestClient.post(String(DEBUG_BASE_URL), data)
}

export interface ApiCallPercentileData {
  p50: number
  p95: number
  p99: number
  [property: string]: any
}

export function fetchApiCallPercentile(apiId: string, params?: unknown) {
  return requestClient.get<ApiCallPercentileData>(
    `${BASE_URL}/percentile/${apiId}`,
    { params },
  )
}
