import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  actionMatchesEventType,
  advancedFilterCount,
  appliedFilterTags,
  AUDIT_ACTIONS,
  AUDIT_ACTIONS_BY_EVENT_TYPE,
  AUDIT_EVENT_TYPES,
  AUDIT_QUERY_LABEL_KEYS,
  AUDIT_TAG_KEYS,
  auditActionGroups,
  auditActionLabelKey,
  batchSummary,
  buildAuditQuery,
  changeText,
  createAuditDetailLoader,
  displayValue,
  hasUnresolvedPlaceholder,
  isQueryDirty,
  isRetentionShortened,
  isValidRetention,
  isValidTimeRange,
  nodeText,
  operatorText,
  outcomeView,
  parseQuickRange,
  quickRangeTimes,
  refreshRangeTimes,
  withDefaultTimeRange,
} from '../src/views/audit/audit-log.ts'

const t = (key: string, args?: any[]) =>
  args ? `${key}:${args.join('/')}` : key

test('builds query with known filter keys and drops blanks', () => {
  assert.deepEqual(
    buildAuditQuery({
      start: 1,
      end: 2,
      user: '  ops ',
      source: '',
      keyword: null,
      unknown: 'x',
      operationId: 'op-1',
      eventId: 'ev-1',
      range: 'custom',
    }),
    { start: 1, end: 2, user: 'ops' },
  )
})

test('shows outcome with text and status type', () => {
  assert.deepEqual(outcomeView('PARTIAL', t), {
    text: 'audit_outcome_partial',
    type: 'warning',
  })
  assert.deepEqual(outcomeView('FAILED', t).type, 'danger')
  assert.deepEqual(outcomeView(undefined, t).text, 'audit_value_legacy')
})

test('never shows null, undefined or blank for required fields', () => {
  for (const value of [null, undefined, '', 'null', 'undefined']) {
    assert.equal(displayValue(value, false, t), 'audit_value_unavailable')
    assert.equal(displayValue(value, true, t), 'audit_value_legacy')
  }
  assert.equal(displayValue('UNAVAILABLE', false, t), 'audit_value_unavailable')
  assert.equal(
    displayValue('LOCAL_SYSTEM', false, t),
    'audit_value_local_system',
  )
  assert.equal(displayValue('10.0.0.1', false, t), '10.0.0.1')
})

test('shows unauthenticated operator with masked account and SYSTEM', () => {
  assert.equal(
    operatorText(
      { userId: 'UNAUTHENTICATED', attemptedAccount: 'a***e@x.com' },
      t,
    ),
    'audit_value_unauthenticated (a***e@x.com)',
  )
  assert.equal(operatorText({ userId: 'SYSTEM' }, t), 'SYSTEM')
  assert.equal(operatorText({ userId: 'u1', username: 'ops' }, t), 'ops (u1)')
  assert.equal(operatorText({ userId: 'u1' }, t), 'u1')
  assert.equal(operatorText({ username: 'ops' }, t), 'ops')
  assert.equal(operatorText({ legacy: true }, t), 'audit_value_legacy')
})

test('detail loader ignores stale results and clears stale content on failure', async () => {
  const pending = new Map<string, (value: string) => void>()
  let detail: string | null = 'previous'
  let loading = false
  const loader = createAuditDetailLoader<string>(
    (id) => new Promise((resolve) => pending.set(id, resolve)),
    (value) => (detail = value),
    (value) => (loading = value),
  )
  const first = loader.load('A')
  const second = loader.load('B')
  pending.get('B')!('B')
  await second
  pending.get('A')!('A')
  await first
  assert.equal(detail, 'B')
  assert.equal(loading, false)
  const third = loader.load('C')
  loader.clear()
  pending.get('C')!('C')
  await third
  assert.equal(detail, null)
  assert.equal(loading, false)
  const failing = createAuditDetailLoader<string>(
    () => Promise.reject(new Error('request failed')),
    (value) => (detail = value),
    (value) => (loading = value),
  )
  detail = 'previous'
  await assert.rejects(failing.load('D'), /request failed/)
  assert.equal(detail, null)
  assert.equal(loading, false)
})

test('summarizes batch results and secret changes', () => {
  assert.equal(
    batchSummary({ total: 3, success: 2, failed: 1 }, t),
    'audit_batch_summary:2/1/3',
  )
  assert.equal(batchSummary(undefined, t), '')
  assert.equal(
    changeText({ field: 'smtp.password', secretState: 'REPLACED' }, t),
    'smtp.password: audit_value_replaced',
  )
  assert.equal(
    changeText({ field: 'host', before: 'a', after: null }, t),
    'host: a → audit_value_empty',
  )
})

test('validates retention range and detects shortening', () => {
  assert.equal(isValidRetention(30), true)
  assert.equal(isValidRetention('3650'), true)
  assert.equal(isValidRetention(29), false)
  assert.equal(isValidRetention(3651), false)
  assert.equal(isValidRetention(45.5), false)
  assert.equal(isRetentionShortened(90, 60), true)
  assert.equal(isRetentionShortened(90, 180), false)
  assert.equal(isRetentionShortened(90, 90), false)
})

test('detects unresolved placeholders', () => {
  assert.equal(hasUnresolvedPlaceholder('created {sourceName}'), true)
  assert.equal(hasUnresolvedPlaceholder('created orders'), false)
})

test('prefers the readable field label provided by the backend', () => {
  const t = (key: string) => key
  const change = {
    field: 'SMTP.smtp.server.host',
    before: '192.168.1.46',
    after: '192.168.1.48',
    label: 'SMTP 服务Host',
  }
  assert.equal(
    changeText(change, t, change.label),
    'SMTP 服务Host: 192.168.1.46 → 192.168.1.48',
  )
  assert.equal(
    changeText(
      { field: 'x', secretState: 'REPLACED', label: '密码' },
      t,
      '密码',
    ),
    '密码: audit_value_replaced',
  )
  assert.equal(
    changeText({ field: 'objectName', before: 'a', after: 'b' }, t),
    'objectName: a → b',
  )
})

test('translates the setting label and falls back when translations are missing', () => {
  const dict: Record<string, string> = {
    setting_SMTP_Server_Host: 'SMTP 服务Host',
  }
  const t = (key: string) => dict[key] ?? key
  const change = {
    field: 'SMTP.smtp.server.host',
    before: 'a',
    after: 'b',
    label: 'SMTP Server Host',
  }
  assert.equal(changeText(change, t), 'SMTP 服务Host: a → b')
  // 缺译文时回退 key_label
  assert.equal(
    changeText({ ...change, label: 'Unknown Label' }, t),
    'Unknown Label: a → b',
  )
  // 没有 label 时回退到内部键
  assert.equal(
    changeText({ field: 'SMTP.smtp.server.host', before: 'a', after: 'b' }, t),
    'SMTP.smtp.server.host: a → b',
  )
})

test('renders service node with instance and ip so same-host instances differ', () => {
  // TAP-13018 F-10：只显示 service/host 时同主机多实例无法区分
  assert.equal(
    nodeText({
      service: 'Engine',
      instance: 'ffbb68d1',
      host: 'node-1',
      ip: '172.17.0.2',
    }),
    'Engine / ffbb68d1 / node-1 / 172.17.0.2',
  )
  assert.equal(
    nodeText({ service: 'Engine', host: 'node-1' }),
    'Engine / node-1',
  )
  assert.equal(nodeText(undefined), '')
})

test('quick ranges use the real current time', () => {
  const now = new Date(2026, 10, 19, 15, 30, 45, 123).getTime()
  assert.deepEqual(quickRangeTimes('last7d', now), [
    new Date(2026, 10, 13, 0, 0, 0, 0).getTime(),
    new Date(2026, 10, 19, 23, 59, 59, 999).getTime(),
  ])
  assert.deepEqual(quickRangeTimes('today', now), [
    new Date(2026, 10, 19, 0, 0, 0, 0).getTime(),
    new Date(2026, 10, 19, 23, 59, 59, 999).getTime(),
  ])
  assert.deepEqual(quickRangeTimes('last24h', now), [
    now - 24 * 60 * 60 * 1000,
    now,
  ])
  assert.equal(quickRangeTimes('custom', now), null)
})

test('quick range across a month boundary keeps seven calendar days', () => {
  const now = new Date(2026, 2, 3, 8, 0, 0).getTime()
  const [start] = quickRangeTimes('last7d', now)
  assert.equal(start, new Date(2026, 1, 25, 0, 0, 0, 0).getTime())
})

test('parses quick range from route query', () => {
  assert.equal(parseQuickRange({}), 'last7d')
  assert.equal(parseQuickRange({ range: 'today', start: '1' }), 'today')
  assert.equal(parseQuickRange({ start: '1', end: '2' }), 'custom')
  assert.equal(parseQuickRange({ range: 'bogus', start: '1' }), 'custom')
})

test('validates required time range and start not later than end', () => {
  assert.equal(isValidTimeRange(1, 2), true)
  assert.equal(isValidTimeRange('5', '5'), true)
  assert.equal(isValidTimeRange(3, 2), false)
  assert.equal(isValidTimeRange('', 2), false)
  assert.equal(isValidTimeRange(1, null), false)
  assert.equal(isValidTimeRange('x', 2), false)
})

test('detects changes not applied regardless of value types', () => {
  const applied = { start: 1, end: 2, keyword: 'ops', source: '' }
  assert.equal(
    isQueryDirty({ start: '1', end: '2', keyword: ' ops ' }, applied),
    false,
  )
  assert.equal(isQueryDirty({ ...applied, outcome: 'FAILED' }, applied), true)
  assert.equal(isQueryDirty({ ...applied, start: 0 }, applied), true)
})

test('counts only applied advanced filters', () => {
  assert.equal(
    advancedFilterCount({
      keyword: 'k',
      eventType: 'TASK',
      source: 'UI',
      user: ' ',
      sourceIp: '10.0.0.1',
      action: 'task.start',
    }),
    3,
  )
  assert.equal(advancedFilterCount({}), 0)
})

test('builds applied filter tags without time conditions', () => {
  assert.deepEqual(
    appliedFilterTags({
      start: 1,
      end: 2,
      object: 'orders',
      keyword: 'sync',
      outcome: 'FAILED',
      user: '',
    }),
    [
      { key: 'keyword', value: 'sync' },
      { key: 'outcome', value: 'FAILED' },
      { key: 'object', value: 'orders' },
    ],
  )
  for (const key of AUDIT_TAG_KEYS) {
    assert.ok(AUDIT_QUERY_LABEL_KEYS[key], key)
  }
})

test('groups actions by event type and narrows by selected type', () => {
  assert.equal(AUDIT_ACTIONS.length, 135)
  assert.equal(new Set(AUDIT_ACTIONS).size, AUDIT_ACTIONS.length)
  assert.deepEqual(
    Object.keys(AUDIT_ACTIONS_BY_EVENT_TYPE).sort(),
    [...AUDIT_EVENT_TYPES].sort(),
  )
  const all = auditActionGroups()
  assert.equal(all.length, AUDIT_EVENT_TYPES.length)
  const task = auditActionGroups('TASK')
  assert.equal(task.length, 1)
  assert.ok(task[0].actions.includes('task.start'))
  assert.equal(auditActionLabelKey('auth.login'), 'audit_action_auth_login')
})

test('clears action that does not belong to the selected event type', () => {
  assert.equal(actionMatchesEventType('task.start', 'TASK'), true)
  assert.equal(actionMatchesEventType('auth.login', 'TASK'), false)
  assert.equal(actionMatchesEventType('auth.login', ''), true)
  assert.equal(actionMatchesEventType('', 'TASK'), true)
})

test('every action and query label is translated in all languages', () => {
  const keys = [
    ...AUDIT_ACTIONS.map(auditActionLabelKey),
    ...Object.values(AUDIT_QUERY_LABEL_KEYS),
    'audit_query_range_last7d',
    'audit_query_range_today',
    'audit_query_range_last24h',
    'audit_query_range_custom',
    'audit_query_pending',
    'audit_query_more_count',
    'audit_query_tag',
    'audit_query_remove_tag',
  ]
  for (const lang of ['en', 'zh-CN', 'zh-TW']) {
    const text = readFileSync(
      new URL(`../src/i18n/langs/${lang}.js`, import.meta.url),
      'utf8',
    )
    for (const key of keys) {
      assert.match(text, new RegExp(`^  ${key}:\\s`, 'm'), `${lang} ${key}`)
    }
  }
})

test('fills the default range when route time is missing and keeps other filters', () => {
  const now = new Date(2026, 10, 19, 15, 30, 0).getTime()
  const [start, end] = quickRangeTimes('last7d', now)
  assert.deepEqual(
    withDefaultTimeRange({ start: '', end: '', eventType: 'TASK' }, now),
    { start, end, eventType: 'TASK' },
  )
  assert.deepEqual(
    withDefaultTimeRange({ start: 5, end: 1, outcome: 'FAILED' }, now),
    { start, end, outcome: 'FAILED' },
  )
  const valid = { start: 1, end: 2, keyword: 'k' }
  assert.equal(withDefaultTimeRange(valid, now), valid)
})

test('moves relative quick ranges to the current time and keeps custom ranges', () => {
  const later = new Date(2026, 10, 19, 11, 1, 0).getTime()
  const params = { start: 1, end: 2, keyword: 'k' }
  assert.deepEqual(refreshRangeTimes(params, 'last24h', later), {
    start: later - 24 * 60 * 60 * 1000,
    end: later,
    keyword: 'k',
  })
  const [start, end] = quickRangeTimes('today', later)
  assert.deepEqual(refreshRangeTimes(params, 'today', later), {
    start,
    end,
    keyword: 'k',
  })
  assert.equal(refreshRangeTimes(params, 'custom', later), params)
})
