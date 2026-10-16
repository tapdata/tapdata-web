<script setup lang="ts">
import type { DeliverySummary } from '@tap/api/src/core/alarm'
import { computed } from 'vue'
import { useI18n } from '@tap/i18n'

const props = defineProps<{ summary?: DeliverySummary | null }>()
const { t } = useI18n()

const CHANNEL_KEYS: Record<string, string> = {
  SYSTEM: 'delivery_channel_system',
  EMAIL: 'delivery_channel_email',
  SMS: 'delivery_channel_sms',
  WECHAT: 'delivery_channel_wechat',
  WEBHOOK: 'delivery_channel_webhook',
}

const STATUS_TYPES: Record<string, string> = {
  SUCCESS: 'success',
  PARTIAL_FAILED: 'warning',
  FAILED: 'danger',
  SKIPPED: 'info',
  NONE: 'info',
}

const status = computed(() => props.summary?.status || 'NONE')

// 例如“站内 1/1 · 邮件 2/3”，成功数/总数
const text = computed(() => {
  const byChannel = props.summary?.byChannel || {}
  return (props.summary?.channels || [])
    .map((channel) => {
      const item = byChannel[channel]
      return item
        ? `${t(CHANNEL_KEYS[channel] || channel)} ${item.success}/${item.total}`
        : t(CHANNEL_KEYS[channel] || channel)
    })
    .join(' · ')
})
</script>

<template>
  <el-tooltip
    v-if="status !== 'NONE'"
    :content="t(`delivery_status_${status.toLowerCase()}`)"
    placement="top"
  >
    <el-tag :type="STATUS_TYPES[status]" size="small" disable-transitions>
      {{ text }}
    </el-tag>
  </el-tooltip>
  <span v-else class="color-info">{{ t('delivery_status_none') }}</span>
</template>
