import { calcUnit } from '@tap/shared'
import { isNumber } from 'lodash-es'
import { requestClient } from '../request'

const BASE_URL = '/api/monitor/server'
const API_BASE_URL = '/api/monitor/api'

/**
 * 格式化响应时间
 * @param val 毫秒值
 * @returns 格式化后的字符串，小于1s显示ms，否则显示s，保留2位小数
 */
export function formatResponseTime(val: number | string | undefined) {
  if (!isNumber(val)) return val

  if (val < 1000) {
    return `${Math.round(val)}ms`
  } else {
    return `${Number((val / 1000).toFixed(2))}s`
  }
}

export interface Params {
  /**
   * 秒级时间戳
   */
  endAt?: number
  /**
   * 秒级时间戳
   */
  startAt?: number
  orderBy?: string // 'field DESC'
  [property: string]: any
}

export interface MonitorServer {
  queryFrom: number
  queryEnd: number
  granularity: number
  totalRequestCount: number
  errorCount: number
  totalErrorRate: number
  responseTime: number
  responseTimeAvg?: number | string
  p95?: number | string
  p99?: number | string
  notHealthyApiCount: number
  notHealthyServerCount: number
}

export interface ServerItem {
  queryFrom: number
  queryEnd: number
  granularity: number
  serverPingStatus: string
  serverPingTime: number
  serverName: string
  serverId: string
  cpuUsage: number[]
  memoryUsage: number[]
  ts: number[]
  requestCount: number
  errorRate: number
  p95?: number | string
  p99?: number | string
  deleted: boolean
}

export interface ApiOverview {
  queryFrom: number
  queryEnd: number
  granularity: number
  totalRequestCount: number
  apiCount: number
  totalBytes: number
  totalDelayMs: number
  totalRps: number | string
  responseTimeAvg: number | string
  p95?: number | string
  p99?: number | string
}

export interface ServerDetail {
  queryFrom: number
  queryEnd: number
  granularity: number
  serverName: string
  serverId: string
  cpuUsage: number
  memoryUsage: number
  usagePingTime: number
  requestCount: number
  errorRate: number
  errorCount: number
  responseTimeAvg: number | string
  maxDelay: number
  minDelay: number
  p95?: number | string
  p99?: number | string
}

export interface ServerChart {
  queryFrom: number
  queryEnd: number
  granularity: number
  usage: {
    cpuUsage: number[]
    memoryUsage: number[]
    maxCpuUsage: number[]
    minCpuUsage: number[]
    maxMemoryUsage: number[]
    minMemoryUsage: number[]
    ts: number[]
  }
  request: {
    requestCount: number[]
    errorRate: number[]
    ts: number[]
  }
  delay: {
    avg: number[]
    p95: number[]
    p99: number[]
    minDelay: number[]
    ts: number[]
  }
}

export interface ServerApiItem {
  queryFrom: number
  queryEnd: number
  granularity: number
  apiId: string
  apiName: string
  requestCount: number
  errorRate: number
  avg?: number | string
  p99?: number | string
  avgTime: string
  p99Time: string
}

export interface ServerWorker {
  queryFrom: number
  queryEnd: number
  granularity: number
  cpuUsageMax: number
  cpuUsageMin: number
  workerList: {
    workerId: string
    workerName: string
    errorRate?: number
    requestCount?: number
    usage: {
      cpuUsage: number[]
      minCpuUsage: number[]
      maxCpuUsage: number[]
      memoryUsage: number[]
      minMemoryUsage: number[]
      maxMemoryUsage: number[]
      ts: number[]
    }
  }[]
}

export interface ApiItem {
  queryFrom: number
  queryEnd: number
  granularity: number
  apiId: string
  apiPath: string
  apiName: string
  requestCount: number
  requestCostAvg: number | string
  p95?: number | string
  p99?: number | string
  maxDelay: number
  minDelay: number
  errorRate: number
  totalRps: number | string
}

export interface ApiDetail {
  queryFrom: number
  queryEnd: number
  granularity: number
  requestCount: number
  errorRate: number
  requestCostAvg: number | string
  p95?: number | string
  p99?: number | string
  maxDelay: number
  minDelay: number
}

export interface ApiInServerItem {
  queryFrom: number
  queryEnd: number
  granularity: number
  serverId: string
  serverName: string
  requestCount: number
  requestCostAvg: number | string
  p95?: number | string
  p99?: number | string
  maxDelay: number
  minDelay: number
  errorRate: number
}

export interface ApiChart {
  queryFrom: 1767510000
  queryEnd: 1767510600
  granularity: 0
  ts: number[]
  rps: number[]
  errorRate: number[]
  requestCostAvg: number[]
  p95: number[]
  p99: number[]
  minDelay: number[]
  maxDelay: number[]
}

export async function fetchMonitorServer(params?: Params) {
  const data = await requestClient
    .get<MonitorServer>(BASE_URL, { params })
    .catch(() => {
      return {
        totalErrorRate: 0,
        errorCount: 0,
        responseTimeAvg: 100,
        minDelay: 0,
        maxDelay: 200,
        notHealthyApiCount: 0,
        notHealthyServerCount: 0,
        queryEnd: 0,
        queryFrom: 0,
        responseTime: 0,
        totalRequestCount: 0,
      }
    })

  if (isNumber(data.totalErrorRate)) {
    data.totalErrorRate = Number(data.totalErrorRate.toFixed(2))
  }

  data.responseTimeAvg = formatResponseTime(data.responseTimeAvg)

  data.p95 = formatResponseTime(data.p95)

  data.p99 = formatResponseTime(data.p99)

  return data
}

export async function fetchMonitorServerList(params?: Params) {
  const data = await requestClient.get<ServerItem[]>(`${BASE_URL}/list`, {
    params,
  })

  data.forEach((item) => {
    if (isNumber(item.errorRate)) {
      item.errorRate = Number(item.errorRate.toFixed(2))
    }
    if (isNumber(item.p95)) {
      item.p95 = formatResponseTime(item.p95)
    }
    if (isNumber(item.p99)) {
      item.p99 = formatResponseTime(item.p99)
    }
  })

  return data
}

export async function fetchMonitorServerDetail(params?: Params) {
  const data = await requestClient.get<ServerDetail>(`${BASE_URL}/detail`, {
    params,
  })

  if (isNumber(data.errorRate)) {
    data.errorRate = Number(data.errorRate.toFixed(2))
  }

  ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach((key) => {
    data[key] = formatResponseTime(data[key])
  })

  return data
}

export function fetchMonitorServerChart(params?: Params) {
  return requestClient
    .get<ServerChart>(`${BASE_URL}/chart`, { params })
    .catch(() => ({
      queryFrom: 1765209600,
      queryEnd: 1767801600,
      granularity: 2,
      usage: {
        cpuUsage: [],
        memoryUsage: [],
        maxCpuUsage: [],
        minCpuUsage: [],
        minMemoryUsage: [],
        ts: [],
      },
      request: {
        requestCount: [],
        errorRate: [],
        ts: [],
      },
      delay: {
        avg: [],
        p95: [],
        p99: [],
        minDelay: [],
        ts: [],
      },
    }))
}

export async function fetchMonitorServerApi(params?: Params) {
  const data = await requestClient.get<ServerApiItem[]>(`${BASE_URL}/api`, {
    params,
  })

  data.forEach((item) => {
    item.errorRate = Number(item.errorRate.toFixed(2))
    item.avg = formatResponseTime(item.avg)
    item.p99 = formatResponseTime(item.p99)
  })

  return data
}

export function fetchMonitorServerWorker(params?: Params) {
  return requestClient.get<ServerWorker>(`${BASE_URL}/worker`, {
    params,
  })
}

export async function fetchMonitorApi(params?: Params) {
  const data = await requestClient
    .get<ApiOverview>(API_BASE_URL, { params })
    .catch(() => ({
      queryFrom: 1767517619535,
      queryEnd: 1767517919535,
      granularity: 2,
      apiCount: 0,
      totalBytes: 0,
      totalDelayMs: 0,
      totalRps: 0,
      responseTimeAvg: 0,
    }))

  if (isNumber(data.responseTimeAvg)) {
    data.responseTimeAvg = formatResponseTime(data.responseTimeAvg)
  }

  if (isNumber(data.p95)) {
    data.p95 = formatResponseTime(data.p95)
  }

  if (isNumber(data.p99)) {
    data.p99 = formatResponseTime(data.p99)
  }

  if (isNumber(data.totalRps)) {
    data.totalRps = `${calcUnit(data.totalRps, 'b')}/s`
  }

  return data
}

export async function fetchMonitorApiList(params?: Params) {
  const data = await requestClient
    .get<ApiItem[]>(`${API_BASE_URL}/list`, {
      params,
    })
    .catch(() => [
      {
        queryFrom: 1767510000,
        queryEnd: 1767510600,
        granularity: 0,
        apiId: '694b92121a818d0270a1b913',
        apiPath: '/v1/tjq7duqpvs7',
        apiName: 'MDM1_copy_tjq7duqpvs7',
        requestCount: 6,
        requestCostAvg: 0,
        maxDelay: 60,
        minDelay: 34,
        errorRate: 0,
        totalRps: 1.2,
      },
      {
        queryFrom: 1767510000,
        queryEnd: 1767510600,
        granularity: 0,
        apiId: '694b52e6a40d9d8479f447d6',
        apiPath: '/v1/aslw80no7ze',
        apiName: 'MDM',
        requestCount: 19,
        requestCostAvg: 0,
        p99: 134,
        maxDelay: 134,
        minDelay: 17,
        errorRate: 0,
        totalRps: 3.8,
      },
    ])
  data.forEach((item) => {
    item.errorRate = Number(item.errorRate.toFixed(2))
    item.requestCostAvg = formatResponseTime(item.requestCostAvg)
    item.p95 = item.p95 ? formatResponseTime(item.p95) : item.p95
    item.p99 = item.p99 ? formatResponseTime(item.p99) : item.p99
    item.totalRps = item.totalRps
      ? `${calcUnit(item.totalRps, 'b')}/s`
      : item.totalRps
  })

  return data
}

export async function fetchMonitorApiDetail(params?: Params) {
  const data = await requestClient.get<ApiDetail>(`${API_BASE_URL}/detail`, {
    params,
  })

  if (isNumber(data.errorRate)) {
    data.errorRate = Number(data.errorRate.toFixed(2))
  }

  if (isNumber(data.requestCostAvg)) {
    data.requestCostAvg = formatResponseTime(data.requestCostAvg)
  }

  if (isNumber(data.p95)) {
    data.p95 = formatResponseTime(data.p95)
  }

  if (isNumber(data.p99)) {
    data.p99 = formatResponseTime(data.p99)
  }

  return data
}

export async function fetchMonitorApiServer(params?: Params) {
  const data = await requestClient.get<ApiInServerItem[]>(
    `${API_BASE_URL}/server`,
    {
      params,
    },
  )

  data.forEach((item) => {
    if (isNumber(item.errorRate)) {
      item.errorRate = Number(item.errorRate.toFixed(2))
    }
    if (isNumber(item.requestCostAvg)) {
      item.requestCostAvg = formatResponseTime(item.requestCostAvg)
    }
    if (isNumber(item.p95)) {
      item.p95 = formatResponseTime(item.p95)
    }
    if (isNumber(item.p99)) {
      item.p99 = formatResponseTime(item.p99)
    }
  })

  return data
}

export function fetchMonitorApiChart(params?: Params) {
  return requestClient.get<ApiChart>(`${API_BASE_URL}/chart`, {
    params,
  })
}
