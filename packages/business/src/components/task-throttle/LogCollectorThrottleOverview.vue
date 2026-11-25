<script setup lang="ts">
import type {
  LogPositionStatus,
  LogCollectorThrottleOverviewView,
  ThrottleWaitReason,
} from '@tap/api/src/core/task-throttle'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import dayjs from 'dayjs'
import TaskThrottleBadge from './TaskThrottleBadge.vue'

defineProps<{
  overview: LogCollectorThrottleOverviewView | null
  loading?: boolean
}>()

const { t } = useI18n()

function waitReasonText(reason?: ThrottleWaitReason | null): string {
  switch (reason) {
    case 'RATE_WAIT':
      return t('packages_business_task_throttle_wait_rate')
    case 'SAMPLE_WAIT':
      return t('packages_business_task_throttle_wait_sample')
    case 'BUFFER_WAIT':
      return t('packages_business_task_throttle_wait_buffer')
    case 'WRITE_IO_WAIT':
      return t('packages_business_task_throttle_wait_write_io')
    case 'LOG_RISK_WAIT':
      return t('packages_business_task_throttle_wait_log_risk')
    case 'BACKPRESSURE_WAIT':
      return t('packages_business_task_throttle_wait_backpressure')
    default:
      return t('packages_business_task_throttle_wait_none')
  }
}

function logPositionText(status?: LogPositionStatus | null): string {
  switch (status) {
    case 'WARN_70':
      return t('packages_business_task_throttle_log_warn_70')
    case 'CRITICAL_90':
      return t('packages_business_task_throttle_log_critical_90')
    case 'UNKNOWN':
      return t('packages_business_task_throttle_log_unknown')
    case 'EXPIRED':
      return t('packages_business_task_throttle_log_expired')
    default:
      return t('packages_business_task_throttle_log_normal')
  }
}

function logPositionTagType(
  status?: LogPositionStatus | null,
): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'EXPIRED' || status === 'CRITICAL_90') return 'danger'
  if (status === 'WARN_70') return 'warning'
  if (status === 'UNKNOWN') return 'info'
  return 'success'
}

function formatRate(val?: number | null): string {
  if (typeof val !== 'number' || !Number.isFinite(val)) return '-'
  return `${val.toFixed(3)} MB/s`
}

function formatQps(val?: number | null): string {
  if (typeof val !== 'number' || !Number.isFinite(val)) return '-'
  return `${Math.round(val).toLocaleString()}/s`
}

function formatTs(ts?: number | null): string {
  return ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<template>
  <div
    v-if="overview"
    v-loading="loading"
    class="info-box logcollector-throttle-overview"
  >
    <div class="flex justify-content-between align-center mb-2">
      <span class="fw-sub fs-7 font-color-normal">
        {{ t('packages_business_task_throttle_lc_overview_title') }}
      </span>
      <el-tag size="small" type="info" effect="plain">
        {{
          t('packages_business_task_throttle_lc_retention_days', {
            days: overview.storageTimeDays,
          })
        }}
      </el-tag>
    </div>

    <div class="flex flex-column gap-2 fs-8 mb-3">
      <div class="p-2 rounded bg-subtle">
        <div class="flex justify-content-between align-center mb-1">
          <span class="fw-sub font-color-dark">
            {{ t('packages_business_task_throttle_lc_source_capture') }}
          </span>
          <el-tag
            size="small"
            :type="
              logPositionTagType(overview.sourceCapture?.logPositionStatus)
            "
          >
            {{ logPositionText(overview.sourceCapture?.logPositionStatus) }}
          </el-tag>
        </div>
        <div class="flex justify-content-between font-color-light">
          <span>
            {{ formatRate(overview.sourceCapture?.estimatedMbPerSec) }} /
            {{ formatQps(overview.sourceCapture?.qps) }}
          </span>
          <span>{{ waitReasonText(overview.sourceCapture?.waitReason) }}</span>
        </div>
      </div>

      <div class="p-2 rounded bg-subtle">
        <div class="flex justify-content-between align-center mb-1">
          <span class="fw-sub font-color-dark">
            {{ t('packages_business_task_throttle_lc_log_write') }}
          </span>
          <el-tag
            size="small"
            :type="logPositionTagType(overview.logWrite?.logPositionStatus)"
          >
            {{ logPositionText(overview.logWrite?.logPositionStatus) }}
          </el-tag>
        </div>
        <div class="flex justify-content-between font-color-light">
          <span>
            {{ formatRate(overview.logWrite?.estimatedMbPerSec) }} /
            {{ formatQps(overview.logWrite?.qps) }}
          </span>
          <span>{{ waitReasonText(overview.logWrite?.waitReason) }}</span>
        </div>
      </div>

      <div class="font-color-light">
        {{
          t('packages_business_task_throttle_lc_oldest_replay', {
            time: formatTs(overview.oldestConsumerReplayTime),
          })
        }}
      </div>
    </div>

    <div class="fs-8 fw-sub font-color-normal mb-2">
      {{
        t('packages_business_task_throttle_lc_consumers_title', {
          visible: overview.visibleConsumers?.length || 0,
          total: overview.totalConsumerCount || 0,
        })
      }}
    </div>

    <el-alert
      v-if="overview.hiddenConsumerCount > 0"
      type="info"
      :closable="false"
      show-icon
      class="mb-2"
    >
      <span class="fs-8">
        {{
          t('packages_business_task_throttle_lc_hidden_consumers', {
            count: overview.hiddenConsumerCount,
          })
        }}
      </span>
    </el-alert>

    <div
      v-if="overview.visibleConsumers?.length"
      class="flex flex-column gap-2"
    >
      <div
        v-for="consumer in overview.visibleConsumers"
        :key="consumer.taskId"
        class="p-2 rounded border fs-8"
      >
        <div class="flex justify-content-between align-center gap-1 mb-1">
          <span class="fw-sub text-truncate font-color-dark">
            {{ consumer.taskName || consumer.taskId }}
          </span>
          <TaskThrottleBadge
            :task-status="consumer.status"
            :live-status="consumer.liveStatus"
            compact
          />
        </div>
        <div class="flex justify-content-between align-center font-color-light">
          <span>
            {{ t('packages_business_task_throttle_lc_consumer_delay') }}:
            {{
              typeof consumer.consumerDelayMs === 'number'
                ? calcTimeUnit(consumer.consumerDelayMs, 2, {
                    autoHideMs: true,
                  })
                : '-'
            }}
          </span>
          <span>
            {{ t('packages_business_task_throttle_lc_consumer_output') }}:
            {{ formatRate(consumer.estimatedOutputMbPerSec) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
