import type { DqlEventStatus } from '@tap/api/src/core/dql-event'

export const dqlEventStatusLabelKeys: Record<DqlEventStatus, string> = {
  PENDING: 'packages_business_exception_events_status_pending',
  REPROCESSING: 'packages_business_exception_events_status_reprocessing',
  RECOVERED: 'packages_business_exception_events_status_recovered',
  RECOVERY_FAILED: 'packages_business_exception_events_status_recovery_failed',
  NOT_REPROCESSABLE:
    'packages_business_exception_events_status_not_reprocessable',
}

export function getDqlEventStatusWarning(
  status: DqlEventStatus,
  reason?: string,
) {
  return status === 'NOT_REPROCESSABLE' ? reason : undefined
}
