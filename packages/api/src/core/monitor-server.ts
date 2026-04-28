import { calcUnit } from '@tap/shared'
import { isNumber } from 'lodash-es'
import { requestClient, type PageFetchResult } from '../request'

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

export function formatErrorRate(val: number | string) {
  if (!isNumber(val)) return val

  if (val >= 1) {
    return `${Number(val.toFixed(2))}%`
  } else if (val >= 0.01) {
    return `${Number(val.toFixed(2))}%`
  } else if (val >= 0.001) {
    return `${Number(val.toFixed(3))}%`
  } else if (val > 0) {
    return `< 0.001%`
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
  totalErrorRate: number | string
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
  errorRate: number | string
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

export interface ConnectionWithName {
  id: string,
  name: string
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
  errorRate: number | string
  errorCount: number
  responseTimeAvg: number | string
  maxDelay: number
  minDelay: number
  p95?: number | string
  p99?: number | string
  workerInfo: ServerWorker
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
    poolUsedConnections: number[]
    poolMaxConnections: number[]
    poolQueueSize: number[]
    ts: number[]
  }
  poolUsage: {
    poolUsedConnections: number[]
    poolMaxConnections: number[]
    poolQueueSize: number[]
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
    errorRate?: number | string
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
  errorRate: number | string
  totalRps: number | string
}

export interface ApiDetail {
  queryFrom: number
  queryEnd: number
  granularity: number
  requestCount: number
  errorRate: number | string
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
  errorRate: number | string
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
  dbCostAvg: number[]
  dbCostMax: number[]
  dbCostMin: number[]
  dbCostP95: number[]
  dbCostP99: number[]
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

  data.totalErrorRate = formatErrorRate(data.totalErrorRate)
  ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach((key) => {
    data[key] = formatResponseTime(data[key])
  })

  return data
}

export async function fetchMonitorServerList(params?: Params) {
  const data = await requestClient.get<ServerItem[]>(`${BASE_URL}/list`, {
    params,
  })

  data.forEach((item) => {
    item.errorRate = formatErrorRate(item.errorRate)
    ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach(
      (key) => {
        item[key] = formatResponseTime(item[key])
      },
    )
  })

  return data
}

export async function fetchConnectionWithName(serverId: string) {
  return await requestClient.get<ConnectionWithName>(`api/Connections/allConnections/${serverId}`, {})
}

export async function fetchMonitorServerDetail(params?: Params) {
  const data = await requestClient.get<ServerDetail>(`${BASE_URL}/detail`, {
    params,
  })

  data.errorRate = formatErrorRate(data.errorRate)
  ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach((key) => {
    data[key] = formatResponseTime(data[key])
  })

  data.workerInfo?.workerList?.forEach((worker) => {
    worker.errorRate = formatErrorRate(worker.errorRate)
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
        poolUsedConnections: [],
        poolMaxConnections: [],
        poolQueueSize: [],
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
  const data = await requestClient.get<PageFetchResult<ServerApiItem>>(
    `${BASE_URL}/api`,
    {
      params,
    },
  )

  data.items.forEach((item) => {
    item.errorRate = formatErrorRate(item.errorRate)
    ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach(
      (key) => {
        item[key] = formatResponseTime(item[key])
      },
    )
  })

  return data
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

  ;['responseTimeAvg', 'p95', 'p99'].forEach((key) => {
    data[key] = formatResponseTime(data[key])
  })

  if (isNumber(data.totalRps)) {
    data.totalRps = `${calcUnit(data.totalRps, 'b')}/s`
  }

  return data
}

export async function fetchMonitorApiList(params?: Params) {
  const data = await requestClient.get<PageFetchResult<ApiItem>>(
    `${API_BASE_URL}/list`,
    {
      params,
    },
  )

  data.items.forEach((item) => {
    item.errorRate = formatErrorRate(item.errorRate)
    ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach(
      (key) => {
        item[key] = formatResponseTime(item[key])
      },
    )

    if (isNumber(item.totalRps)) {
      item.totalRps = `${calcUnit(item.totalRps, 'b')}/s`
    }
  })

  return data
}

export async function fetchMonitorApiDetail(params?: Params) {
  const data = await requestClient.get<ApiDetail>(`${API_BASE_URL}/detail`, {
    params,
  })

  data.errorRate = formatErrorRate(data.errorRate)
  ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach((key) => {
    data[key] = formatResponseTime(data[key])
  })

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
    item.errorRate = formatErrorRate(item.errorRate)
    ;['responseTimeAvg', 'p95', 'p99', 'minDelay', 'maxDelay'].forEach(
      (key) => {
        item[key] = formatResponseTime(item[key])
      },
    )
  })

  return data
}

export function fetchMonitorApiChart(params?: Params) {
  return requestClient.get<ApiChart>(`${API_BASE_URL}/chart`, {
    params,
  })
}
