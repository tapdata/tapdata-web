import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/app'

export interface App {
  id: string
  value: string
  desc?: string
  objCount?: number
  apiCount?: number
  publishedApiCount?: number
  item_type: string[]
  readOnly?: boolean
  createTime?: string
  last_updated?: string
  user_id?: string
}

/**
 * 获取应用列表 - 支持多种查询方式，主要用于获取 API 应用列表
 * 支持按类型、只读状态等过滤
 */
export function fetchApps(filter?: Filter) {
  return requestClient.get<PageFetchResult<App>>(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

/**
 * 获取应用详情 - 根据ID获取应用的详细信息
 */
export function getAppDetail(id: string) {
  return requestClient.get<App>(`${BASE_URL}/detail/${id}`)
}

/**
 * 移动应用 - 将应用移动到另一个位置或分组
 * @param id 要移动的应用ID
 * @param moveId 目标位置ID
 */
export function moveApp(id: string, moveId: string) {
  return requestClient.put(`${BASE_URL}/move/${id}?moveId=${moveId}`)
}

/**
 * 创建应用 - 创建新的 API 应用
 */
export function createApp(params: Partial<App>) {
  return requestClient.post<App>(BASE_URL, params)
}

/**
 * 更新应用 - 批量更新应用信息
 */
export function updateApp(params: Partial<App>) {
  return requestClient.patch<App>(BASE_URL, params)
}

/**
 * 根据ID更新应用 - 更新指定应用的信息
 */
export function updateAppById(id: string, attributes: any) {
  return requestClient.patch<App>(`${BASE_URL}/${id}`, attributes)
}

/**
 * 删除应用 - 删除指定的 API 应用
 */
export function deleteApp(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * 统计应用数量 - 获取符合条件的应用总数
 */
export function countApps(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

/**
 * 查找单个应用 - 根据条件查找第一个匹配的应用
 */
export function findOneApp(params?: any) {
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

/**
 * 批量更新应用 - 根据条件批量更新多个应用
 */
export function batchUpdateApps(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  } else if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}
