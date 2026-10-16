import { isPlainObj } from '@tap/shared'
import { joinListParams, type DeliverySummary } from './alarm'
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

/* ---------- 通知记录（TAP-13052） ---------- */

const RECORD_URL = '/api/notifications'

export interface NotificationRecord {
  id: string
  alarmEventId?: string
  legacy: boolean
  messageIds: string[]
  title: string
  level: string
  metric?: string
  alarmStatus?: string
  objectType?: string
  taskId?: string
  taskName?: string
  firstOccurrenceTime?: string
  lastOccurrenceTime?: string
  occurrenceCount?: number
  notificationCount: number
  unread: boolean
  latestNotifyTime?: string
  deliverySummary?: DeliverySummary
}

export interface NotificationRecipient {
  channel: string
  address?: string
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED'
  sentAt?: string
  failureMessage?: string
  skipReason?: string
}

export interface NotificationBatch {
  batchId: string
  time?: string
  occurrenceCountSnapshot?: number
  recipients: NotificationRecipient[]
}

export interface NotificationRecordDetail extends NotificationRecord {
  content: string
  readAt?: string
  batches: NotificationBatch[]
}

export function listNotificationRecords(params: Record<string, any>) {
  return requestClient.get<{ total: number; items: NotificationRecord[] }>(
    RECORD_URL,
    { params: joinListParams(params) },
  )
}

export function getNotificationRecord(id: string) {
  return requestClient.get<NotificationRecordDetail>(
    `${RECORD_URL}/${encodeURIComponent(id)}`,
  )
}

export function getUnreadNotificationCount() {
  return requestClient.get<number>(`${RECORD_URL}/unread-count`)
}

export function previewNotificationReadState(
  params: Record<string, any>,
  read: boolean,
) {
  return requestClient.get<{
    count: number
    ids: string[]
    truncated: boolean
  }>(`${RECORD_URL}/read-state/preview`, {
    params: { ...joinListParams(params), read },
  })
}

export function updateNotificationReadState(ids: string[], read: boolean) {
  return requestClient.patch<number>(`${RECORD_URL}/read-state`, { ids, read })
}

export function updateOneNotificationReadState(id: string, read: boolean) {
  return requestClient.patch<number>(
    `${RECORD_URL}/${encodeURIComponent(id)}/read-state`,
    { read },
  )
}
