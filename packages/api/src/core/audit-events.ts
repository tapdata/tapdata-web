import { downloadBlob } from '@tap/shared'
import axios from 'axios'
import { joinListParams } from './alarm'
import { requestClient } from '../request'

const BASE_URL = '/api/audit-events'

export type AuditOutcome = 'SUCCESS' | 'FAILED' | 'ACCEPTED' | 'PARTIAL'
export type AuditSource = 'UI' | 'OPENAPI' | 'SYSTEM'

export interface AuditChange {
  field: string
  before?: string | null
  after?: string | null
  secretState?: 'SET' | 'REPLACED' | 'CLEARED' | 'UNCHANGED' | null
}

export interface AuditBatchItem {
  objectId?: string
  objectName?: string
  outcome: AuditOutcome
  reason?: string
}

export interface AuditBatch {
  total: number
  success: number
  failed: number
  items: AuditBatchItem[]
}

export interface AuditNode {
  service?: string
  instance?: string
  host?: string
  ip?: string
}

export interface AuditEvent {
  legacy: boolean
  eventId: string
  operationId?: string
  phase?: 'SINGLE' | 'REQUEST' | 'FINAL'
  timestamp?: string
  eventType?: string
  action?: string
  actionName?: string
  outcome?: AuditOutcome
  source?: AuditSource
  userId?: string
  username?: string
  authType?: string
  attemptedAccount?: string
  credentialRef?: string
  sourceIp?: string
  sourceIpNote?: string
  forwardedFor?: string
  userAgent?: string
  objectType?: string
  objectId?: string
  objectName?: string
  reason?: string
  detailLevel?: 'BASIC' | 'SUMMARY' | 'DIFF'
  summary?: string
  changes?: AuditChange[]
  batch?: AuditBatch
  node?: AuditNode
  context?: Record<string, string>
  legacyMessage?: string
}

export interface AuditOperation {
  operationId?: string
  initiator: AuditEvent
  outcome?: AuditOutcome
  timestamp?: string
  finalTimestamp?: string
  pending: boolean
  events: AuditEvent[]
}

export interface AuditStatus {
  retentionDays: number
  maxExport: number
  exportAllowed: boolean
  writeFailures?: number
  lastWriteFailureAt?: string
}

export function listAuditOperations(params: Record<string, any>) {
  return requestClient.get<{ total: number; items: AuditOperation[] }>(
    BASE_URL,
    { params: joinListParams(params) },
  )
}

export function fetchAuditOperation(id: string) {
  return requestClient.get<AuditOperation[]>(
    `${BASE_URL}/${encodeURIComponent(id)}`,
  )
}

export function fetchAuditStatus() {
  return requestClient.get<AuditStatus>(`${BASE_URL}/status`)
}

/**
 * 导出当前查询条件命中的原始事件（CSV）。服务端拒绝时返回 JSON 错误体，此时抛出其错误信息而不是保存为文件。
 */
export async function exportAuditEvents(params: Record<string, any>) {
  const query = new URLSearchParams(
    joinListParams({
      ...params,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  )
  const res = await axios.get(`${BASE_URL}/export?${query.toString()}`, {
    responseType: 'blob',
  })
  const type = String(res.headers?.['content-type'] || '')
  if (type.includes('application/json')) {
    const body = JSON.parse(await (res.data as Blob).text())
    throw new Error(body?.message || body?.code || 'export failed')
  }
  downloadBlob(res)
}

/** 显示或复制当前用户访问码：经服务端接口读取以便记录敏感读取审计。 */
export function revealAccessCode() {
  return requestClient.post<string>('/api/users/access-code/reveal')
}

/** 显示或复制 API 客户端密钥：经服务端接口读取以便记录敏感读取审计。 */
export function revealClientSecret(id: string) {
  return requestClient.post<string>(
    `/api/Applications/${encodeURIComponent(id)}/secret/reveal`,
  )
}
