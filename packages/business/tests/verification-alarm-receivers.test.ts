import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialInspectAlarm,
  inspectReceiverPreviewEmailCount,
  inspectReceiverPreviewRequest,
} from '../src/views/verification/alarm-receivers.ts'

test('copies pipeline user and group recipients as an independent initial selection', () => {
  const source = [
    { type: 'USER', id: 'user-1' },
    { type: 'USER_GROUP', id: 'group-1' },
  ]
  const initial = initialInspectAlarm({
    alarmReceivers: source,
    emailReceivers: ['u@example.com'],
  })

  assert.deepEqual(initial.alarmReceivers, source)
  assert.notEqual(initial.alarmReceivers, source)
  assert.deepEqual(initial.emailReceivers, ['u@example.com'])
})

test('preserves an explicit empty custom selection', () => {
  assert.deepEqual(
    initialInspectAlarm({ alarmReceivers: [], emailReceivers: [] }),
    {
      alarmReceivers: [],
      emailReceivers: [],
    },
  )
})

test('converts legacy email snapshots and defaults when the linked task has no custom recipients', () => {
  assert.deepEqual(
    initialInspectAlarm({ emailReceivers: ['legacy@example.com'] }),
    {
      alarmReceivers: [{ type: 'EMAIL', email: 'legacy@example.com' }],
      emailReceivers: ['legacy@example.com'],
    },
  )
  assert.deepEqual(initialInspectAlarm(null), {
    alarmReceivers: null,
    emailReceivers: null,
  })
})

test('builds an Inspect preview request without losing system-default or custom-empty modes', () => {
  assert.deepEqual(
    inspectReceiverPreviewRequest({
      id: 'inspect-1',
      flowId: 'flow-1',
      alarmReceivers: [],
      emailReceivers: [],
    }),
    {
      inspectId: 'inspect-1',
      flowId: 'flow-1',
      alarmReceivers: [],
      emailReceivers: [],
    },
  )
  assert.deepEqual(
    inspectReceiverPreviewRequest({
      alarmReceivers: null,
      emailReceivers: null,
    }),
    {
      inspectId: undefined,
      flowId: undefined,
      alarmReceivers: null,
      emailReceivers: null,
    },
  )
})

test('uses the resolved unique email list length for the preview count', () => {
  assert.equal(
    inspectReceiverPreviewEmailCount({
      emails: [{ email: 'one@example.com' }, { email: 'two@example.com' }],
    }),
    2,
  )
  assert.equal(inspectReceiverPreviewEmailCount({ emails: [] }), 0)
  assert.equal(inspectReceiverPreviewEmailCount(null), 0)
})
