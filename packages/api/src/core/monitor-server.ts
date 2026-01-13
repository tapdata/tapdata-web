import { calcTimeUnit, calcUnit } from '@tap/shared'
import { requestClient } from '../request'

const BASE_URL = '/api/monitor/server'
const API_BASE_URL = '/api/monitor/api'

export interface Params {
  /**
   * 秒级时间戳
   */
  endAt?: number
  /**
   * 秒级时间戳
   */
  startAt?: number
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
  responseTimeAvg: number | string
  p95: number | string
  p99: number | string
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
  p95: number | string
  p99: number | string
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
  responseTimeAvg: number
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
  errorRate: string
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
  avg: number
  p99: number
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
    usage: {
      cpuUsage: number[]
      memoryUsage: number[]
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
  requestCostAvg: number
  maxDelay: number
  minDelay: number
  errorRate: number
  totalRps: number
}

export interface ApiDetail {
  queryFrom: number
  queryEnd: number
  granularity: number
  requestCount: number
  errorRate: number
  requestCostAvg: number
  p99: number
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
  requestCostAvg: number
  p99: number
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
    .catch(() => ({
      queryFrom: 1767865320,
      queryEnd: 1767868920,
      granularity: 1,
      totalRequestCount: 0,
      totalErrorRate: 0,
      responseTimeAvg: 0,
      notHealthyApiCount: 0,
      notHealthyServerCount: 0,
    }))
  data.totalErrorRate = Number(data.totalErrorRate.toFixed(2))
  data.responseTimeAvg = calcTimeUnit(data.responseTimeAvg)
  data.p95 = calcTimeUnit(data.p95)
  data.p99 = calcTimeUnit(data.p99)

  return data
}

export async function fetchMonitorServerList(params?: Params) {
  const data = await requestClient
    .get<ServerItem[]>(`${BASE_URL}/list`, { params })
    .catch(() => {
      return [
        {
          queryFrom: 1767865320,
          queryEnd: 1767868920,
          granularity: 1,
          serverPingStatus: 'running',
          serverPingTime: 1767868925069,
          serverName: 'GavinXiaodeMacBook-Pro.local',
          serverId: 'f3ebe1b88623ca4f933af4e27f4075a0',
          cpuUsage: [
            44.83,
            1.27,
            0.96,
            0.74,
            0.71,
            0.77,
            0.76,
            0.71,
            0.85,
            0.81,
            0.8,
            0.71,
            0.77,
            0.66,
            0.74,
            0.91,
            0.84,
            0.74,
            0.86,
            0.97,
            1.68,
            1.21,
            1.02,
            1.88,
            1.58,
            1.36,
            1.35,
            1.29,
            1.4,
            0.9,
            0.8,
            1.01,
            1.2,
            1.08,
            0.93,
            1.59,
            1.61,
            1.03,
            0.89,
            null,
            0.98,
            1.34,
            1.09,
            0.78,
            1.02,
            1.34,
            1.53,
            1.52,
            0.97,
            0.96,
            0.8,
            0.97,
            1.38,
            1.08,
            null,
            1.27,
            1.13,
            1.17,
            null,
            null,
          ],
          memoryUsage: [
            26.52,
            16.7,
            18.39,
            18.33,
            15.44,
            18.84,
            18.1,
            17.88,
            16.73,
            18.48,
            17.9,
            18.66,
            17.56,
            18.4,
            18.3,
            18.09,
            17.41,
            18.08,
            18.43,
            19.65,
            22.58,
            14.35,
            14.77,
            20.39,
            17.25,
            14.43,
            15.78,
            18.07,
            16.42,
            17.41,
            17.29,
            14.09,
            17.06,
            17.75,
            17.99,
            14.46,
            15.19,
            18.2,
            17.3,
            null,
            16.49,
            21.46,
            19.07,
            20.44,
            18.83,
            18.35,
            18.07,
            10.57,
            16.28,
            11.26,
            15.35,
            10.65,
            18.21,
            15.07,
            null,
            21.28,
            22.66,
            12.05,
            null,
            null,
          ],
          ts: [
            1767865320, 1767865380, 1767865440, 1767865500, 1767865560,
            1767865620, 1767865680, 1767865740, 1767865800, 1767865860,
            1767865920, 1767865980, 1767866040, 1767866100, 1767866160,
            1767866220, 1767866280, 1767866340, 1767866400, 1767866460,
            1767866520, 1767866580, 1767866640, 1767866700, 1767866760,
            1767866820, 1767866880, 1767866940, 1767867000, 1767867060,
            1767867120, 1767867180, 1767867240, 1767867300, 1767867360,
            1767867420, 1767867480, 1767867540, 1767867600, 1767867660,
            1767867720, 1767867780, 1767867840, 1767867900, 1767867960,
            1767868020, 1767868080, 1767868140, 1767868200, 1767868260,
            1767868320, 1767868380, 1767868440, 1767868500, 1767868560,
            1767868620, 1767868680, 1767868740, 1767868800, 1767868860,
          ],
          requestCount: 0,
          errorRate: 0,
          p95: 0,
          p99: 0,
          deleted: false,
        },
      ]
    })

  data.forEach((item) => {
    item.errorRate = Number(item.errorRate.toFixed(2))
    item.p95 = calcTimeUnit(item.p95)
    item.p99 = calcTimeUnit(item.p99)
  })

  return data
}

export function fetchMonitorServerDetail(serverId: string, params?: Params) {
  return requestClient
    .get<ServerDetail>(`${BASE_URL}/detail/${serverId}`, {
      params,
    })
    .catch(() => ({
      queryFrom: 1767509965,
      queryEnd: 1767510265,
      granularity: 0,
      serverName: 'GavinXiaodeMacBook-Pro.local',
      serverId: 'f3ebe1b88623ca4f933af4e27f4075a0',
      cpuUsage: 40.06666666666666,
      memoryUsage: 864305152,
      usagePingTime: 1767445635295,
      requestCount: 0,
      errorRate: 'NaN',
    }))
}

export function fetchMonitorServerChart(serverId: string, params?: Params) {
  return requestClient
    .get<ServerChart>(`${BASE_URL}/chart/${serverId}`, { params })
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

export async function fetchMonitorServerApi(serverId: string, params?: Params) {
  const data = await requestClient.get<ServerApiItem[]>(
    `${BASE_URL}/api/${serverId}`,
    {
      params,
    },
  )

  data.forEach((item) => {
    item.errorRate = Number(item.errorRate.toFixed(2))
    item.avgTime = calcTimeUnit(item.avg)
    item.p99Time = calcTimeUnit(item.p99)
  })

  return data
}

export function fetchMonitorServerWorker(serverId: string, params?: Params) {
  return requestClient.get<ServerWorker>(`${BASE_URL}/worker/${serverId}`, {
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

  data.responseTimeAvg = calcTimeUnit(data.responseTimeAvg)

  data.totalRps = data.totalRps
    ? `${calcUnit(data.totalRps, 'b')}/s`
    : data.totalRps

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
    item.requestCostAvg = calcTimeUnit(item.requestCostAvg)
    item.p95 = item.p95 ? calcTimeUnit(item.p95) : item.p95
    item.p99 = item.p99 ? calcTimeUnit(item.p99) : item.p99
    item.totalRps = item.totalRps
      ? `${calcUnit(item.totalRps, 'b')}/s`
      : item.totalRps
  })

  return data
}

export function fetchMonitorApiDetail(params?: Params) {
  return requestClient.get<ApiDetail>(`${API_BASE_URL}/detail`, {
    params,
  })
}

export function fetchMonitorApiServer(params?: Params) {
  return requestClient.get<ApiInServerItem[]>(
    `${API_BASE_URL}/server`,
    { params },
  )
}

export function fetchMonitorApiChart(params?: Params) {
  return requestClient.get<ApiChart>(`${API_BASE_URL}/chart`, {
    params,
  })
}
