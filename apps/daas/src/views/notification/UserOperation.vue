<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'

interface UserOperationRecord {
  email?: string
  i18nMessage?: string
  modular?: string
  operation?: string
  parameter1?: unknown
  sourceId?: number | string
  sourceName?: unknown
  user?: unknown
  username?: unknown
  [key: string]: unknown
}

const SOURCE_ROUTE_MAP: Record<string, string> = {
  sync: 'TaskMonitor',
  dataflow: 'TaskMonitor',
  migrate: 'MigrationMonitor',
  migration: 'MigrationMonitor',
  connection: 'connectionsEdit',
  LogCoLLector: 'SharedMiningMonitor',
  LogCollector: 'SharedMiningMonitor',
  logCollector: 'SharedMiningMonitor',
  mem_cache: 'SharedCacheMonitor',
  shareCache: 'SharedCacheMonitor',
  connHeartbeat: 'HeartbeatMonitor',
}

const props = defineProps<{
  record: UserOperationRecord
}>()

const router = useRouter()
const { t } = useI18n()

const sourceId = computed(() => props.record.sourceId)
const hasSourceId = computed(
  () =>
    sourceId.value !== undefined &&
    sourceId.value !== null &&
    sourceId.value !== '',
)

const sourceRouteName = computed(() => {
  const modular = toText(props.record.modular)
  return modular ? SOURCE_ROUTE_MAP[modular] : ''
})

const canOpenSource = computed(
  () => hasSourceId.value && !!sourceRouteName.value,
)

const RECEIVER_MODE_KEYS: Record<string, string> = {
  APPEND: 'packages_business_task_batch_alarm_mode_append',
  REPLACE: 'packages_business_task_batch_alarm_mode_replace',
  REMOVE: 'packages_business_task_batch_alarm_mode_remove',
}

const message = computed(() => {
  if (props.record.i18nMessage) {
    return props.record.i18nMessage
  }

  const modular =
    props.record.modular === 'migrate' ? 'migration' : props.record.modular
  const specialMessage = buildSpecialMessage(modular)
  if (specialMessage) return specialMessage

  return [
    `${t('notification_account')} `,
    '{user}',
    t(`notification_operation_${props.record.operation}`),
    `${t(`notification_modular_${modular}`)} `,
    '{sourceName}',
  ].join('')
})

function buildSpecialMessage(modular: unknown) {
  const operation = toText(props.record.operation)
  const hasMode = toText(props.record.parameter2) !== ''
  const hasChange = formatChange(props.record.parameter3) !== ''

  if (modular === 'alarmReceiver' && operation === 'update') {
    if (hasMode && hasChange) {
      return t('notification_alarm_receiver_update_mode_change')
    }
    if (hasMode) return t('notification_alarm_receiver_update_mode')
    if (hasChange) return t('notification_alarm_receiver_update_change')
    return t('notification_alarm_receiver_update')
  }

  if (modular === 'alarmReceiver' && operation === 'batch_update') {
    if (hasChange) return t('notification_alarm_receiver_batch_update_change')
    return t('notification_alarm_receiver_batch_update')
  }

  if (modular === 'userGroup' && operation === 'delete') {
    if (hasMode && hasChange) {
      return t('notification_user_group_delete_mode_change')
    }
    if (hasMode) return t('notification_user_group_delete_mode')
    if (hasChange) return t('notification_user_group_delete_change')
    return t('notification_user_group_delete')
  }

  return ''
}

function formatMode(value: unknown) {
  const text = toText(value)
  const key = RECEIVER_MODE_KEYS[text]
  return key ? t(key) : text
}

function stringifyChange(value: unknown): string {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' || typeof value === 'number')
    return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatChange(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return formatChange(JSON.parse(trimmed))
      } catch {
        return value
      }
    }
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const before = record.before ?? record.beforeValue ?? record.old
    const after = record.after ?? record.afterValue ?? record.new
    if (before !== undefined || after !== undefined) {
      return t('notification_alarm_receiver_before_after', {
        before: stringifyChange(before),
        after: stringifyChange(after),
      })
    }
  }
  return stringifyChange(value)
}

const UserOperationContent = () => renderMessage()

function renderMessage() {
  return message.value.split(/(\{[^{}]+\})/g).map((chunk) => {
    const key = chunk.match(/^\{([^{}]+)\}$/)?.[1]?.trim()
    if (!key) return chunk

    const text = getPlaceholderText(key)
    return renderPlaceholder(key, text || chunk, !!text)
  })
}

function renderPlaceholder(key: string, text: string, replaced: boolean) {
  if (key === 'parameter1' && replaced && canOpenSource.value) {
    return h(
      ElLink,
      {
        class: 'user-operation-link color-primary',
        underline: true,
        type: 'primary',
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          openSource()
        },
      },
      () => [
        text,
        h(
          ElIcon,
          {
            class: 'user-operation-link-icon ml-1',
            size: 16,
          },
          () => h(IconLucideExternalLink),
        ),
      ],
    )
  }

  return h('span', { class: replaced ? 'color-primary' : '' }, text)
}

function toText(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value)
}

function getPlaceholderText(key: string) {
  if (key === 'user') {
    return toText(props.record.username) || toText(props.record.email)
  }

  if (key === 'parameter2' && props.record.modular === 'alarmReceiver') {
    return formatMode(props.record.parameter2)
  }

  if (
    key === 'parameter3' &&
    (props.record.modular === 'alarmReceiver' ||
      props.record.modular === 'userGroup')
  ) {
    return formatChange(props.record.parameter3) || ' '
  }

  return toText(props.record[key])
}

function openSource() {
  if (!canOpenSource.value) return

  const route = router.resolve({
    name: sourceRouteName.value,
    params: {
      id: sourceId.value,
    },
  })

  window.open(route.href, '_blank')
}
</script>

<template>
  <div
    class="user-operation-wrap flex flex-wrap align-center text-prewrap lh-bae min-w-0 break-all"
  >
    <UserOperationContent />
  </div>
</template>
