import type {
  AlarmReceiver,
  AlarmReceiverPreview,
  InspectReceiverPreviewRequest,
} from '@tap/api/src/core/alarm'

type SyncTaskAlarm = {
  alarmReceivers?: unknown
  emailReceivers?: unknown
}

// The preview API returns these fixed source labels around already-masked names.
const SYSTEM_SOURCE = '系统默认' // i18n-ignore: legacy API label
const EMAIL_SOURCE = '邮箱' // i18n-ignore: legacy API label
const USER_SOURCE_PREFIX = '用户' // i18n-ignore: legacy API prefix
const GROUP_USER_SEPARATOR = ' / 用户' // i18n-ignore: legacy API separator

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

export function formatInspectReceiverPreviewSource(
  source: string,
  t: (key: string, params: Record<string, string>) => string,
) {
  if (source === SYSTEM_SOURCE) {
    return t('packages_dag_alarm_receiver_status_system', {})
  }
  if (source === EMAIL_SOURCE) {
    return t('packages_dag_alarm_receiver_type_email', {})
  }

  const groupEnd = source.lastIndexOf(GROUP_USER_SEPARATOR)
  if (groupEnd > 0 && groupEnd + GROUP_USER_SEPARATOR.length < source.length) {
    return t('packages_business_verification_form_preview_source_group_user', {
      group: source.slice(0, groupEnd),
      name: source.slice(groupEnd + GROUP_USER_SEPARATOR.length),
    })
  }
  if (
    source.startsWith(USER_SOURCE_PREFIX) &&
    source.length > USER_SOURCE_PREFIX.length
  ) {
    return t('packages_business_verification_form_preview_source_user', {
      name: source.slice(USER_SOURCE_PREFIX.length),
    })
  }
  return source
}

export function shouldResetInspectReceivers(
  isEditing: boolean,
  explicitlySelectedSystemDefault: boolean,
  alarmReceivers: AlarmReceiver[] | null,
) {
  // Creates must opt out of server-side inheritance when the form shows defaults.
  // An unchanged edit must preserve legacy recipients hidden by the read API.
  return (
    alarmReceivers === null && (!isEditing || explicitlySelectedSystemDefault)
  )
}
