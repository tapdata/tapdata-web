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
  const modular =
    props.record.modular === 'migrate' ? 'migration' : props.record.modular
  const specialMessage = buildSpecialMessage(modular)
  if (specialMessage) return specialMessage

  if (props.record.i18nMessage) {
    return props.record.i18nMessage
  }

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

  const params = {
    parameter1: '{parameter1}',
    parameter2: '{parameter2}',
    parameter3: '{parameter3}',
  }

  if (modular === 'alarmReceiver' && operation === 'update') {
    if (hasMode && hasChange) {
      return t('notification_alarm_receiver_update_mode_change', params)
    }
    if (hasMode) return t('notification_alarm_receiver_update_mode', params)
    if (hasChange) return t('notification_alarm_receiver_update_change', params)
    return t('notification_alarm_receiver_update', params)
  }

  if (modular === 'alarmReceiver' && operation === 'batch_update') {
    if (hasChange)
      return t('notification_alarm_receiver_batch_update_change', params)
    return t('notification_alarm_receiver_batch_update', params)
  }

  if (modular === 'userGroup' && operation === 'delete') {
    return t('notification_user_group_delete', params)
  }

  return ''
}

function formatMode(value: unknown) {
  const text = toText(value)
  const key = RECEIVER_MODE_KEYS[text]
  return key ? t(key) : text
}

function resolveRef(item: unknown, rootObj: any): unknown {
  if (item && typeof item === 'object' && '$ref' in item) {
    const ref = (item as any)['$ref']
    if (typeof ref === 'string') {
      const beforeMatch = ref.match(/^\$\.before\[(\d+)\]$/)
      if (beforeMatch && Array.isArray(rootObj?.before)) {
        const idx = Number.parseInt(beforeMatch[1], 10)
        return rootObj.before[idx] ?? item
      }
      const afterMatch = ref.match(/^\$\.after\[(\d+)\]$/)
      if (afterMatch && Array.isArray(rootObj?.after)) {
        const idx = Number.parseInt(afterMatch[1], 10)
        return rootObj.after[idx] ?? item
      }
    }
  }
  return item
}

function formatSingleReceiver(receiver: unknown): string {
  if (receiver == null) return ''
  if (typeof receiver === 'string') return receiver
  if (typeof receiver === 'object') {
    const r = receiver as Record<string, any>
    const type = r.type
    if (type === 'EMAIL' || (!type && r.email && !r.id)) {
      return r.name ? `${r.name} (${r.email})` : String(r.email)
    }
    if (type === 'USER_GROUP') {
      const groupLabel = t('notification_alarm_receiver_user_group') || '用户组'
      const name = r.name || r.label
      if (name) return `${groupLabel}「${name}」`
      const id = String(r.id || '')
      return id
        ? `${groupLabel}（${id.length > 8 ? id.slice(-6) : id}）`
        : groupLabel
    }
    if (type === 'USER') {
      const userLabel = t('notification_alarm_receiver_user') || '用户'
      const name = r.username || r.name
      if (name) return `${userLabel}「${name}」`
      if (r.email) return `${userLabel}「${r.email}」`
      const id = String(r.id || '')
      return id
        ? `${userLabel}（${id.length > 8 ? id.slice(-6) : id}）`
        : userLabel
    }
    if (r.name) return String(r.name)
    if (r.username) return String(r.username)
    if (r.email) return String(r.email)
    if (r.id) return String(r.id)
  }
  return String(receiver)
}

function formatReceiverList(value: unknown, rootObj?: any): string {
  if (value === null || value === undefined) {
    return t('notification_alarm_receiver_system_default') || '系统默认'
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return t('notification_alarm_receiver_none') || '无'
    }
    return value
      .map((item) => {
        const resolved = resolveRef(item, rootObj)
        return formatSingleReceiver(resolved)
      })
      .filter(Boolean)
      .join('、')
  }
  return stringifyChange(value)
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
  let parsed = value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        parsed = JSON.parse(trimmed)
      } catch {
        return value
      }
    } else {
      return value
    }
  }

  if (typeof parsed === 'number' || typeof parsed === 'boolean') {
    return String(parsed)
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>
    const hasBefore =
      'before' in record || 'beforeValue' in record || 'old' in record
    const hasAfter =
      'after' in record || 'afterValue' in record || 'new' in record
    if (hasBefore || hasAfter) {
      const before = record.before ?? record.beforeValue ?? record.old
      const after = record.after ?? record.afterValue ?? record.new
      return t('notification_alarm_receiver_before_after', {
        before: formatReceiverList(before, record),
        after: formatReceiverList(after, record),
      })
    }
    if ('affectedTasks' in record || 'descendantGroupCount' in record) {
      return ''
    }
  }
  return stringifyChange(parsed)
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

  if (key === 'parameter3') {
    if (props.record.modular === 'alarmReceiver') {
      return formatChange(props.record.parameter3) || ' '
    }
    return ''
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
