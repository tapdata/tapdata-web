import { isPlainObj } from '@tap/shared'
import {
  requestClient,
  type CountFetchResult,
  type PageFetchResult,
} from '../request'

const BASE_URL = '/api/Messages'

export interface Notification {
  createTime: string
  id: string
  level: string
  msg: string
  read: boolean
  serverName: string
  sourceId: string
  system: string
  title: string
}

export function pageReadNotification(filter: any) {
  return requestClient.post(BASE_URL, filter)
}

export function upsertNotificationWithWhere(filter: any, update: any) {
  return requestClient.post(`${BASE_URL}/update?where=${filter}`, update)
}

export function readAllNotifications(params: any) {
  return requestClient.post(`${BASE_URL}/readAll`, params)
}

export function listNotifications(params: any) {
  const config = { params }
  if (isPlainObj(params)) {
    Object.assign(config, params)
  }
  return requestClient.get<PageFetchResult<Notification>>(
    `${BASE_URL}/list`,
    config,
  )
}

// Base Http methods that are used in the codebase
export function fetchNotifications(filter?: object) {
  const params = { filter: JSON.stringify(filter) }
  return requestClient.get<PageFetchResult<Notification>>(BASE_URL, {
    params,
  })
}

export function countNotifications(params: any) {
  return requestClient.get<CountFetchResult>(`${BASE_URL}/count`, { params })
}

export function patchNotification(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function deleteNotification(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createNotification(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneNotification(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateNotification(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  }
  if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}
