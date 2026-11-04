import type {
  AlarmReceiver,
  AlarmReceiverPreview,
  InspectReceiverPreviewRequest,
} from '@tap/api/src/core/alarm'

type SyncTaskAlarm = {
  alarmReceivers?: unknown
  emailReceivers?: unknown
}

export function initialInspectAlarm(task?: SyncTaskAlarm | null): {
  alarmReceivers: AlarmReceiver[] | null
  emailReceivers: string[] | null
} {
  if (Array.isArray(task?.alarmReceivers)) {
    return {
      // An empty array is a deliberate custom selection; do not turn it into default.
      alarmReceivers: (task.alarmReceivers as AlarmReceiver[]).map(
        (receiver) => ({
          ...receiver,
        }),
      ),
      emailReceivers: Array.isArray(task.emailReceivers)
        ? task.emailReceivers.filter(
            (email): email is string => typeof email === 'string',
          )
        : [],
    }
  }

  if (Array.isArray(task?.emailReceivers) && task.emailReceivers.length) {
    const emails = task.emailReceivers.filter(
      (email): email is string => typeof email === 'string' && !!email.trim(),
    )
    return {
      alarmReceivers: emails.map((email) => ({ type: 'EMAIL', email })),
      emailReceivers: [...emails],
    }
  }

  return { alarmReceivers: null, emailReceivers: null }
}

export function inspectReceiverPreviewRequest(form: {
  id?: string
  flowId?: string
  alarmReceivers?: AlarmReceiver[] | null
  emailReceivers?: string[] | null
}): InspectReceiverPreviewRequest {
  return {
    inspectId: form.id ? String(form.id) : undefined,
    flowId: form.flowId || undefined,
    alarmReceivers: form.alarmReceivers ?? null,
    emailReceivers: form.emailReceivers ?? null,
  }
}

export function inspectReceiverPreviewEmailCount(
  preview?: AlarmReceiverPreview | null,
) {
  return Array.isArray(preview?.emails) ? preview.emails.length : 0
}
