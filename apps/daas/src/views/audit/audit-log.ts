/** 审计日志页面的纯逻辑：查询参数、展示值与保留期判定，便于 node --test 覆盖。 */

export const AUDIT_FILTER_KEYS = [
  'start',
  'end',
  'eventType',
  'user',
  'source',
  'sourceIp',
  'action',
  'object',
  'outcome',
  'eventId',
  'operationId',
  'keyword',
] as const

export const AUDIT_EVENT_TYPES = [
  'AUTH',
  'ACCESS_CONTROL',
  'USER',
  'ROLE',
  'DATASOURCE',
  'EXTERNAL_STORAGE',
  'TASK',
  'INSPECT',
  'LOG_CACHE',
  'LIVE_CACHE',
  'DATA_API',
  'SETTINGS',
  'NOTIFICATION',
  'LICENSE',
  'CONNECTOR',
  'CLUSTER',
  'SERVICE',
  'AUDIT',
  'MESSAGE',
]
export const AUDIT_OUTCOMES = ['SUCCESS', 'FAILED', 'ACCEPTED', 'PARTIAL']
export const AUDIT_SOURCES = ['UI', 'OPENAPI', 'SYSTEM']

export const RETENTION_MIN = 30
export const RETENTION_MAX = 3650
export const RETENTION_KEY = 'audit.log.retention.days'

export type Translate = (key: string, args?: any) => string

/** 只保留已知筛选键，去掉空值，保证路由与请求参数一致。 */
export function buildAuditQuery(params: Record<string, any> = {}) {
  const query: Record<string, any> = {}
  for (const key of AUDIT_FILTER_KEYS) {
    const value = params[key]
    if (value === undefined || value === null) continue
    const text = typeof value === 'string' ? value.trim() : value
    if (text === '') continue
    query[key] = text
  }
  return query
}

/** 结果文字与状态色：结果同时用文字和颜色表达，不只依赖颜色。 */
export function outcomeView(outcome: string | undefined, t: Translate) {
  if (!outcome) return { text: t('audit_value_legacy'), type: 'info' }
  const type =
    {
      SUCCESS: 'success',
      FAILED: 'danger',
      ACCEPTED: 'primary',
      PARTIAL: 'warning',
    }[outcome] || 'info'
  return { text: t(`audit_outcome_${outcome.toLowerCase()}`), type }
}

/** 必填字段展示值：特殊替代值翻译为明确文案，历史记录缺失显示历史说明，绝不显示空值、null 或 undefined。 */
export function displayValue(
  value: string | null | undefined,
  legacy: boolean,
  t: Translate,
): string {
  if (value === 'UNAUTHENTICATED') return t('audit_value_unauthenticated')
  if (value === 'UNAVAILABLE') return t('audit_value_unavailable')
  if (value === 'LOCAL_SYSTEM') return t('audit_value_local_system')
  if (value === 'SYSTEM') return 'SYSTEM'
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'null' ||
    value === 'undefined'
  ) {
    return legacy ? t('audit_value_legacy') : t('audit_value_unavailable')
  }
  return value
}

/** 操作人：失败登录显示未认证与脱敏尝试账号，系统事件显示 SYSTEM。 */
export function operatorText(
  event: {
    userId?: string
    username?: string
    attemptedAccount?: string
    legacy?: boolean
  },
  t: Translate,
) {
  if (event.userId === 'UNAUTHENTICATED') {
    const base = t('audit_value_unauthenticated')
    return event.attemptedAccount ? `${base} (${event.attemptedAccount})` : base
  }
  if (event.userId === 'SYSTEM') return 'SYSTEM'
  return displayValue(event.username || event.userId, !!event.legacy, t)
}

/** 批量结果摘要，如「2 成功、1 失败」。 */
export function batchSummary(
  batch: { total: number; success: number; failed: number } | undefined,
  t: Translate,
) {
  if (!batch) return ''
  return t('audit_batch_summary', [batch.success, batch.failed, batch.total])
}

/** 字段变更展示：秘密字段只显示设置/替换/清除状态。 */
export function changeText(
  change: {
    field: string
    label?: string | null
    before?: string | null
    after?: string | null
    secretState?: string | null
  },
  t: Translate,
  label?: string,
) {
  // 设置项优先显示译文（setting_<key_label 空格转下划线>，保留大小写），缺译文时回退 key_label，再回退内部键
  const labelKey =
    label || change.label || ''
      ? `setting_${(label || change.label || '').split(' ').join('_')}`
      : ''
  const translated = labelKey ? t(labelKey) : ''
  const field =
    translated && translated !== labelKey
      ? translated
      : label || change.label || change.field
  if (change.secretState) {
    return `${field}: ${t(`audit_value_${change.secretState.toLowerCase()}`)}`
  }
  const empty = t('audit_value_empty')
  return `${field}: ${change.before ?? empty} → ${change.after ?? empty}`
}

/** 保留期输入校验：30–3650 的整数。 */
export function isValidRetention(value: unknown) {
  const n = Number(value)
  return Number.isInteger(n) && n >= RETENTION_MIN && n <= RETENTION_MAX
}

/** 保存前判断是否缩短了保留时间（需要二次确认）。 */
export function isRetentionShortened(before: unknown, after: unknown) {
  const b = Number(before)
  const a = Number(after)
  return Number.isFinite(b) && Number.isFinite(a) && a < b
}

/** 消除未替换变量：文案中残留的 {xxx} 视为缺值。 */
export function hasUnresolvedPlaceholder(text: string | undefined) {
  return !!text && /\{[a-z_]\w*\}/i.test(text)
}
