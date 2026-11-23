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
  'keyword',
  // 无输入框，仅兼容旧审计链接；出现时以已生效标签展示
  'eventId',
  'operationId',
] as const

/** 「更多筛选」中的条件；角标只统计这些键中已生效的条件。 */
export const AUDIT_ADVANCED_KEYS = [
  'source',
  'user',
  'sourceIp',
  'action',
  'object',
] as const

/** 已选条件标签展示顺序：非时间条件。 */
export const AUDIT_TAG_KEYS = [
  'keyword',
  'eventType',
  'outcome',
  'source',
  'user',
  'sourceIp',
  'action',
  'object',
  'eventId',
  'operationId',
] as const

/** 查询区条件文案键。 */
export const AUDIT_QUERY_LABEL_KEYS: Record<string, string> = {
  keyword: 'audit_query_keyword',
  eventType: 'audit_query_event_type',
  outcome: 'audit_query_outcome',
  source: 'audit_query_source',
  user: 'audit_query_user',
  sourceIp: 'audit_query_source_ip',
  action: 'audit_query_action',
  object: 'audit_query_object',
  eventId: 'audit_field_event_id',
  operationId: 'audit_field_operation_id',
}

export const AUDIT_QUICK_RANGES = [
  'last7d',
  'today',
  'last24h',
  'custom',
] as const
export type AuditQuickRange = (typeof AUDIT_QUICK_RANGES)[number]
export const AUDIT_DEFAULT_RANGE: AuditQuickRange = 'last7d'

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

/** 与后端 AuditAction 一致的操作枚举，按事件类型分组；新增后端操作时需同步维护。 */
export const AUDIT_ACTIONS_BY_EVENT_TYPE: Record<string, string[]> = {
  AUTH: [
    'auth.login',
    'auth.logout',
    'auth.session_terminate',
    'auth.api_authenticate',
  ],
  ACCESS_CONTROL: ['access.denied'],
  USER: [
    'user.create',
    'user.update',
    'user.enable',
    'user.disable',
    'user.delete',
    'user.change_password',
    'user.reset_password',
    'user.reset_access_code',
    'user.view_access_code',
    'user.update_contact',
    'user.update_tags',
    'user.import',
    'user_group.create',
    'user_group.update',
    'user_group.delete',
  ],
  ROLE: [
    'role.create',
    'role.update',
    'role.delete',
    'role.grant',
    'role.revoke',
    'permission.update',
    'permission.data_update',
  ],
  DATASOURCE: [
    'datasource.create',
    'datasource.update',
    'datasource.copy',
    'datasource.delete',
    'datasource.import',
    'datasource.export',
    'datasource.test',
    'datasource.update_tags',
    'datasource.update_agent',
  ],
  EXTERNAL_STORAGE: [
    'external_storage.create',
    'external_storage.update',
    'external_storage.delete',
    'external_storage.test',
    'external_storage.set_default',
  ],
  TASK: [
    'task.create',
    'task.update',
    'task.rename',
    'task.copy',
    'task.delete',
    'task.start',
    'task.stop',
    'task.force_stop',
    'task.reset',
    'task.import',
    'task.export',
    'task.update_tags',
    'task.update_alarm',
    'task.download_log',
    'task.test_run',
    'data.preview',
  ],
  INSPECT: [
    'inspect.create',
    'inspect.update',
    'inspect.delete',
    'inspect.start',
    'inspect.stop',
    'inspect.import',
    'inspect.repair',
    'inspect.export_result',
    'inspect.update_config',
    'inspect.delete_result',
  ],
  LOG_CACHE: [
    'log_cache.update',
    'log_cache.update_config',
    'log_cache.create',
    'log_cache.stop_tables',
    'log_cache.resume_tables',
    'log_cache.cancel_merge',
  ],
  LIVE_CACHE: [
    'live_cache.create',
    'live_cache.update',
    'live_cache.delete',
    'live_cache.copy',
  ],
  DATA_API: [
    'api_app.create',
    'api_app.update',
    'api_app.delete',
    'api.create',
    'api.update',
    'api.copy',
    'api.delete',
    'api.publish',
    'api.unpublish',
    'api.import',
    'api.export',
    'api.update_security',
    'api.debug',
    'api.export_doc',
    'api_client.create',
    'api_client.update',
    'api_client.delete',
    'api_client.view_secret',
  ],
  SETTINGS: [
    'settings.update',
    'settings.test',
    'sso.update',
    'sso.test',
    'ldap.test',
    'customer.update',
  ],
  NOTIFICATION: [
    'alarm.rule_update',
    'alarm.receiver_update',
    'alarm.close',
    'webhook.create',
    'webhook.update',
    'webhook.enable',
    'webhook.disable',
    'webhook.delete',
    'webhook.test',
    'notification.update',
  ],
  LICENSE: ['license.import'],
  CONNECTOR: ['connector.install', 'connector.update', 'connector.delete'],
  CLUSTER: [
    'agent.create',
    'agent.delete',
    'agent.unbind',
    'agent_group.update',
    'agent_group.delete',
    'cluster.node_remove',
    'cluster.monitor_update',
  ],
  SERVICE: [
    'service.start',
    'service.stop',
    'service.restart',
    'service.upgrade',
    'service.start_failed',
    'service.abnormal_stop',
    'service.disconnect',
    'service.reconnect',
  ],
  AUDIT: ['audit.retention_update', 'audit.export', 'audit.access_denied'],
  MESSAGE: ['message.read', 'message.delete'],
}

export const AUDIT_ACTIONS = Object.values(AUDIT_ACTIONS_BY_EVENT_TYPE).flat()

/** 操作文案键：auth.login → audit_action_auth_login。 */
export function auditActionLabelKey(action: string) {
  return `audit_action_${action.replaceAll('.', '_')}`
}

/** 操作内容下拉分组：已选事件类型时只返回该类型的操作。 */
export function auditActionGroups(eventType?: string) {
  return AUDIT_EVENT_TYPES.filter(
    (type) => !eventType || type === eventType,
  ).map((type) => ({
    eventType: type,
    actions: AUDIT_ACTIONS_BY_EVENT_TYPE[type] || [],
  }))
}

/** 操作内容是否属于事件类型；切换事件类型后不匹配的操作内容应清空。 */
export function actionMatchesEventType(action?: string, eventType?: string) {
  if (!action || !eventType) return true
  return (AUDIT_ACTIONS_BY_EVENT_TYPE[eventType] || []).includes(action)
}

/** 快捷范围按传入的当前时间计算毫秒时间戳；自定义返回 null。 */
export function quickRangeTimes(
  range: string,
  now: number = Date.now(),
): [number, number] | null {
  const day = new Date(now)
  const startOfDay = (offsetDays: number) =>
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() - offsetDays,
      0,
      0,
      0,
      0,
    ).getTime()
  const endOfToday = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    23,
    59,
    59,
    999,
  ).getTime()
  if (range === 'last7d') return [startOfDay(6), endOfToday]
  if (range === 'today') return [startOfDay(0), endOfToday]
  if (range === 'last24h') return [now - 24 * 60 * 60 * 1000, now]
  return null
}

/** 路由中的快捷范围；缺失时有起止时间视为自定义，否则为默认最近 7 天。 */
export function parseQuickRange(query: Record<string, any> = {}) {
  if ((AUDIT_QUICK_RANGES as readonly string[]).includes(query.range)) {
    return query.range as AuditQuickRange
  }
  return query.start || query.end || hasIdFilter(query)
    ? 'custom'
    : AUDIT_DEFAULT_RANGE
}

/** 旧审计链接按事件 ID / 操作 ID 定位。 */
export function hasIdFilter(query: Record<string, any> = {}) {
  return !!(query.eventId || query.operationId)
}

/** 仅带 ID 的旧链接不限定时间：用最长保留期覆盖全部可查日志。 */
export function retentionRangeTimes(
  now: number = Date.now(),
): [number, number] {
  const day = new Date(now)
  return [
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() - RETENTION_MAX,
      0,
      0,
      0,
      0,
    ).getTime(),
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      23,
      59,
      59,
      999,
    ).getTime(),
  ]
}

/** 起止时间必填，且开始时间不能晚于结束时间。 */
export function isValidTimeRange(start: unknown, end: unknown) {
  if (start === '' || end === '' || start == null || end == null) return false
  const s = Number(start)
  const e = Number(end)
  return Number.isFinite(s) && Number.isFinite(e) && s <= e
}

/** 起止时间缺失或无效时补默认快捷范围；其它条件保持不变。 */
export function withDefaultTimeRange<T extends Record<string, any>>(
  params: T,
  now: number = Date.now(),
): T {
  if (isValidTimeRange(params.start, params.end)) return params
  const [start, end] = hasIdFilter(params)
    ? retentionRangeTimes(now)
    : (quickRangeTimes(AUDIT_DEFAULT_RANGE, now) as [number, number])
  return { ...params, start, end }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 毫秒时间戳 → datetime-local 值（本地时间，精确到秒）。 */
export function toDateTimeInput(value: unknown) {
  const n = Number(value)
  if (value === '' || value == null || !Number.isFinite(n)) return ''
  const d = new Date(n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** datetime-local 值 → 毫秒；结束时间取该秒末尾，与快捷范围的 .999 一致。 */
export function parseDateTimeInput(value: string, edge: 'start' | 'end') {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value || '',
  )
  if (!m) return null
  const [y, mo, d, h, mi, sec] = m.slice(1).map((part) => Number(part ?? 0))
  const date = new Date(
    y ?? 0,
    (mo ?? 1) - 1,
    d,
    h,
    mi,
    sec,
    edge === 'end' ? 999 : 0,
  )
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

/** 日期面板确认：起止必填且开始不晚于结束，否则不接受本次范围。 */
export function confirmRangeInput(start: string, end: string) {
  const s = parseDateTimeInput(start, 'start')
  const e = parseDateTimeInput(end, 'end')
  if (s === null || e === null || s > e) return null
  return [s, e] as [number, number]
}

/** 相对快捷范围按当前时间重算；自定义范围保持原起止时间。 */
export function refreshRangeTimes<T extends Record<string, any>>(
  params: T,
  range: string,
  now: number = Date.now(),
): T {
  const times = quickRangeTimes(range, now)
  if (!times) return params
  return { ...params, start: times[0], end: times[1] }
}

function normalizedQuery(params: Record<string, any> = {}) {
  return Object.fromEntries(
    Object.entries(buildAuditQuery(params)).map(([key, value]) => [
      key,
      String(value),
    ]),
  )
}

/** 编辑中的条件与已生效条件是否不同（用于「条件已修改，待查询」）。 */
export function isQueryDirty(
  draft: Record<string, any> = {},
  applied: Record<string, any> = {},
) {
  return (
    JSON.stringify(normalizedQuery(draft)) !==
    JSON.stringify(normalizedQuery(applied))
  )
}

/** 已生效的更多筛选条件数量。 */
export function advancedFilterCount(applied: Record<string, any> = {}) {
  const query = buildAuditQuery(applied)
  return AUDIT_ADVANCED_KEYS.filter((key) => key in query).length
}

/** 已生效的非时间条件，按固定顺序生成标签。 */
export function appliedFilterTags(applied: Record<string, any> = {}) {
  const query = buildAuditQuery(applied)
  return AUDIT_TAG_KEYS.filter((key) => key in query).map((key) => ({
    key,
    value: String(query[key]),
  }))
}

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

type OutcomeType = 'success' | 'danger' | 'primary' | 'warning' | 'info'

/** 结果文字与状态色：结果同时用文字和颜色表达，不只依赖颜色。 */
export function outcomeView(
  outcome: string | undefined,
  t: Translate,
): { text: string; type: OutcomeType } {
  if (!outcome) return { text: t('audit_value_legacy'), type: 'info' }
  const types: Record<string, OutcomeType> = {
    SUCCESS: 'success',
    FAILED: 'danger',
    ACCEPTED: 'primary',
    PARTIAL: 'warning',
  }
  const type = types[outcome] || 'info'
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
  if (event.username && event.userId && event.username !== event.userId) {
    return `${event.username} (${event.userId})`
  }
  return displayValue(event.userId || event.username, !!event.legacy, t)
}

/** Only the latest open detail request may change the displayed operation. */
export function createAuditDetailLoader<T>(
  fetchDetail: (id: string) => Promise<T | null>,
  setDetail: (value: T | null) => void,
  setLoading: (value: boolean) => void,
) {
  let version = 0
  return {
    clear() {
      version++
      setDetail(null)
      setLoading(false)
    },
    async load(id: string) {
      const requestVersion = ++version
      setDetail(null)
      setLoading(true)
      try {
        const detail = await fetchDetail(id)
        if (version === requestVersion) setDetail(detail)
      } finally {
        if (version === requestVersion) setLoading(false)
      }
    },
  }
}

/** 服务节点展示：服务 / 实例 / 主机 / IP，便于同主机多实例定位；缺失项不显示占位。 */
export function nodeText(
  node:
    | { service?: string; instance?: string; host?: string; ip?: string }
    | undefined,
) {
  if (!node) return ''
  return [node.service, node.instance, node.host, node.ip]
    .filter(Boolean)
    .join(' / ')
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
  label?: string | null,
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
