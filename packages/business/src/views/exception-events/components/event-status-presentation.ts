import type { DlqEventStatus } from '@tap/api/src/core/dlq-event'

export const dlqEventStatusLabelKeys: Record<DlqEventStatus, string> = {
  PENDING: 'packages_business_exception_events_status_pending',
  REPROCESSING: 'packages_business_exception_events_status_reprocessing',
  RECOVERED: 'packages_business_exception_events_status_recovered',
  RECOVERY_FAILED: 'packages_business_exception_events_status_recovery_failed',
  NOT_REPROCESSABLE:
    'packages_business_exception_events_status_not_reprocessable',
}

export function getDlqEventStatusWarning(
  status: DlqEventStatus,
  reason?: string,
) {
  return status === 'NOT_REPROCESSABLE' ? reason : undefined
}
