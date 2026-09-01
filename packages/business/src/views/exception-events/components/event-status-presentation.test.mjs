import assert from 'node:assert/strict'
import test from 'node:test'

import {
  dlqEventStatusLabelKeys,
  getDlqEventStatusWarning,
} from './event-status-presentation.ts'

test('provides a localized label key for every DLQ event status', () => {
  assert.deepEqual(dlqEventStatusLabelKeys, {
    PENDING: 'packages_business_exception_events_status_pending',
    REPROCESSING: 'packages_business_exception_events_status_reprocessing',
    RECOVERED: 'packages_business_exception_events_status_recovered',
    RECOVERY_FAILED:
      'packages_business_exception_events_status_recovery_failed',
    NOT_REPROCESSABLE:
      'packages_business_exception_events_status_not_reprocessable',
  })
})

test('shows the backend-provided warning only for non-reprocessable details', () => {
  assert.equal(
    getDlqEventStatusWarning(
      'NOT_REPROCESSABLE',
      'Payload 不完整，当前事件不可重处理。',
    ),
    'Payload 不完整，当前事件不可重处理。',
  )
  assert.equal(
    getDlqEventStatusWarning('PENDING', 'should not be shown'),
    undefined,
  )
})
