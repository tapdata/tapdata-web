import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canSubmitRecoveryPreview,
  getRecoveryPreviewIssueGroups,
  partitionRecoveryBlockedEvents,
  removeRecoveryPreviewEvent,
} from './recovery-preview-presentation.ts'

test('separates missing business key events into risk items', () => {
  const events = [
    {
      eventId: 'business-key-missing',
      message: '事件缺少业务键',
      messageCode: 'DlqRecovery.Preview.EventNoBusinessKey',
    },
    {
      eventId: 'payload-incomplete',
      message: 'payload is incomplete',
    },
  ]

  const result = partitionRecoveryBlockedEvents(events)

  assert.deepEqual(
    result.riskyEvents.map((event) => event.eventId),
    ['business-key-missing'],
  )
  assert.deepEqual(
    result.blockedEvents.map((event) => event.eventId),
    ['payload-incomplete'],
  )
})

test('recognizes the business key risk by the backend message code', () => {
  const result = partitionRecoveryBlockedEvents([
    {
      eventId: 'business-key-missing',
      message: '事件缺少业务键',
      messageCode: 'DlqRecovery.Preview.EventNoBusinessKey',
    },
  ])

  assert.equal(result.riskyEvents.length, 1)
  assert.equal(result.blockedEvents.length, 0)
})

test('does not infer a risk from a localized message without a backend message code', () => {
  const result = partitionRecoveryBlockedEvents([
    {
      eventId: 'business-key-missing',
      message: '事件缺少业务键',
    },
  ])

  assert.equal(result.riskyEvents.length, 0)
  assert.equal(result.blockedEvents.length, 1)
})

test('keeps backend risk items separate from truly blocked items', () => {
  const result = getRecoveryPreviewIssueGroups({
    riskyEvents: [
      {
        eventId: 'business-key-missing',
        message: '事件缺少业务键',
        messageCode: 'DlqRecovery.Preview.EventNoBusinessKey',
      },
    ],
    blockedEvents: [
      {
        eventId: 'payload-incomplete',
        message: 'payload is incomplete',
      },
    ],
  })

  assert.deepEqual(
    result.riskyEvents.map((event) => event.eventId),
    ['business-key-missing'],
  )
  assert.deepEqual(
    result.blockedEvents.map((event) => event.eventId),
    ['payload-incomplete'],
  )
})

test('allows submission when the preview contains only risk items', () => {
  assert.equal(
    canSubmitRecoveryPreview({
      canSubmit: true,
      orderedEvents: [{ eventId: 'business-key-missing' }],
      blockedEvents: [],
    }),
    true,
  )
})

test('requires removing every blocked event before submission', () => {
  assert.equal(
    canSubmitRecoveryPreview({
      canSubmit: false,
      orderedEvents: [{ eventId: 'recoverable' }],
      blockedEvents: [{ eventId: 'payload-incomplete', message: 'blocked' }],
    }),
    false,
  )
})

test('removes an event from the preview selection without mutating the original ids', () => {
  const eventIds = ['recoverable', 'payload-incomplete']

  assert.deepEqual(removeRecoveryPreviewEvent(eventIds, 'payload-incomplete'), [
    'recoverable',
  ])
  assert.deepEqual(eventIds, ['recoverable', 'payload-incomplete'])
})
