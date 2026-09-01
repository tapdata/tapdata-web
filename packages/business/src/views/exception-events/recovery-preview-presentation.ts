export interface RecoveryPreviewBlockedEvent {
  eventId: string
  message: string
  messageCode?: string
}

export interface RecoveryPreviewIssueGroups<
  T extends RecoveryPreviewBlockedEvent,
> {
  riskyEvents: T[]
  blockedEvents: T[]
}

export interface RecoveryPreviewWithIssues<
  T extends RecoveryPreviewBlockedEvent,
> {
  riskyEvents?: readonly T[]
  blockedEvents?: readonly T[]
}

export interface RecoveryPreviewSubmissionState {
  canSubmit: boolean
  orderedEvents: readonly { eventId: string }[]
  blockedEvents: readonly RecoveryPreviewBlockedEvent[]
}

const BUSINESS_KEY_MISSING_CODE = 'DlqRecovery.Preview.EventNoBusinessKey'

export function isBusinessKeyRisk(event: RecoveryPreviewBlockedEvent) {
  return event.messageCode === BUSINESS_KEY_MISSING_CODE
}

export function partitionRecoveryBlockedEvents<
  T extends RecoveryPreviewBlockedEvent,
>(events: readonly T[]): RecoveryPreviewIssueGroups<T> {
  return events.reduce<RecoveryPreviewIssueGroups<T>>(
    (groups, event) => {
      if (isBusinessKeyRisk(event)) {
        groups.riskyEvents.push(event)
      } else {
        groups.blockedEvents.push(event)
      }

      return groups
    },
    { riskyEvents: [], blockedEvents: [] },
  )
}

export function getRecoveryPreviewIssueGroups<
  T extends RecoveryPreviewBlockedEvent,
>(preview: RecoveryPreviewWithIssues<T>): RecoveryPreviewIssueGroups<T> {
  const legacyGroups = partitionRecoveryBlockedEvents(
    preview.blockedEvents ?? [],
  )

  return {
    riskyEvents: [...(preview.riskyEvents ?? []), ...legacyGroups.riskyEvents],
    blockedEvents: legacyGroups.blockedEvents,
  }
}

export function canSubmitRecoveryPreview(
  preview: RecoveryPreviewSubmissionState,
) {
  return (
    preview.canSubmit &&
    preview.orderedEvents.length > 0 &&
    preview.blockedEvents.length === 0
  )
}

export function removeRecoveryPreviewEvent(
  eventIds: readonly string[],
  eventId: string,
) {
  return eventIds.filter((currentEventId) => currentEventId !== eventId)
}
