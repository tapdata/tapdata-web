import assert from 'node:assert/strict'
import test from 'node:test'
import {
  batchSummary,
  buildAuditQuery,
  changeText,
  displayValue,
  hasUnresolvedPlaceholder,
  isRetentionShortened,
  isValidRetention,
  operatorText,
  outcomeView,
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
    }),
    { start: 1, end: 2, user: 'ops', operationId: 'op-1' },
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
  assert.equal(operatorText({ userId: 'u1', username: 'ops' }, t), 'ops')
  assert.equal(operatorText({ legacy: true }, t), 'audit_value_legacy')
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
