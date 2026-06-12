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

const message = computed(() => {
  if (props.record.i18nMessage) {
    return props.record.i18nMessage
  }

  const modular =
    props.record.modular === 'migrate' ? 'migration' : props.record.modular

  return [
    `${t('notification_account')} `,
    '{user}',
    t(`notification_operation_${props.record.operation}`),
    `${t(`notification_modular_${modular}`)} `,
    '{sourceName}',
  ].join('')
})

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
