import { requestClient, type Filter } from '../request'

const BASE_URL = '/api/modules'

/**
 * 获取API监控预览统计数据 - 用于API监控页面的总览数据
 */
export function fetchApiMonitorPreview() {
  return requestClient.get(`${BASE_URL}/preview`)
}

/**
 * 获取API排行榜数据 - 用于失败率和响应时间排行榜
 */
export function fetchApiRankLists(filter?: Filter) {
  return requestClient.get(`${BASE_URL}/rankLists`, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

/**
 * 获取API列表数据 - 用于API监控页面的API列表
 */
export function fetchApiList(filter?: Filter) {
  return requestClient.get(`${BASE_URL}/apiList`, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

/**
 * 获取API详情数据 - 用于API监控详情页面
 */
export function fetchApiDetail(params: unknown) {
  return requestClient.post(`${BASE_URL}/apiDetail`, params)
}
