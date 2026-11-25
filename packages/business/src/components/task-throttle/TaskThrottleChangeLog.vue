<script setup lang="ts">
import {
  listTaskThrottleChanges,
  type TaskThrottleChangeLogEntry,
  type ThrottlePhase,
  type ThrottlePhaseLimit,
  type ThrottleTaskKind,
} from '@tap/api/src/core/task-throttle'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'
import { formatMbPerSec } from './utils'

const props = defineProps<{
  taskId: string
  taskKind: ThrottleTaskKind
}>()

const { t } = useI18n()

const loading = ref(false)
const rows = ref<TaskThrottleChangeLogEntry[]>([])
const filterType = ref<string>('ALL')
const filterWindow = ref<'ALL' | '24H' | '7D'>('ALL')

async function loadChanges() {
  if (!props.taskId || !props.taskKind) {
    rows.value = []
    return
  }
  loading.value = true
  try {
    const data = await listTaskThrottleChanges(props.taskKind, props.taskId, {
      page: 0,
      size: 100,
    })
    rows.value = Array.isArray(data) ? data : []
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.taskId, props.taskKind],
  () => {
    loadChanges()
  },
)

onMounted(() => {
  loadChanges()
})

const filteredRows = computed(() => {
  const now = Date.now()
  const cutoff =
    filterWindow.value === '24H'
      ? now - 24 * 3600 * 1000
      : filterWindow.value === '7D'
        ? now - 7 * 24 * 3600 * 1000
        : 0

  return rows.value.filter((row) => {
    if (cutoff > 0 && row.occurredAt < cutoff) {
      return false
    }
    if (filterType.value === 'POLICY_CHANGE') {
      return row.eventType === 'POLICY_CHANGE'
    }
    if (filterType.value === 'RECEIPT_APPLIED') {
      return (
        row.eventType === 'APPLY_RECEIPT' &&
        String(row.outcome || '').toUpperCase() === 'APPLIED'
      )
    }
    if (filterType.value === 'RECEIPT_FAILED') {
      return (
        row.eventType === 'APPLY_RECEIPT' &&
        String(row.outcome || '').toUpperCase() !== 'APPLIED'
      )
    }
    if (filterType.value === 'STOP_EVIDENCE') {
      return row.eventType === 'STOP_EVIDENCE'
    }
    return true
  })
})

function formatTimestamp(ms?: number) {
  return ms ? dayjs(ms).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function eventTypeLabel(eventType: string) {
  if (eventType === 'POLICY_CHANGE') {
    return t('packages_business_task_throttle_chg_type_policy')
  }
  if (eventType === 'APPLY_RECEIPT') {
    return t('packages_business_task_throttle_chg_type_receipt')
  }
  if (eventType === 'STOP_EVIDENCE') {
    return t('packages_business_task_throttle_chg_type_stop')
  }
  return eventType
}

function formatPhaseLimit(
  phase: ThrottlePhase,
  limit?: ThrottlePhaseLimit | null,
): string {
  if (!limit) return ''
  const phaseLabel =
    phase === 'FULL'
      ? t('packages_business_task_throttle_phase_full')
      : t('packages_business_task_throttle_phase_cdc')
  if (!limit.enabled) {
    return `${phaseLabel}: ${t('packages_business_task_throttle_phase_summary_off')}`
  }
  const parts: string[] = []
  if (limit.bytesPerSec && limit.bytesPerSec > 0) {
    parts.push(`${formatMbPerSec(limit.bytesPerSec)} MB/s`)
  }
  if (limit.eventsPerSec && limit.eventsPerSec > 0) {
    parts.push(`${limit.eventsPerSec} QPS`)
  }
  return `${phaseLabel}: ${parts.join(', ') || '-'}`
}

function formatPhases(
  phases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null,
): string {
  if (!phases) return '-'
  const items = (['FULL', 'CDC'] as ThrottlePhase[])
    .map((p) => formatPhaseLimit(p, phases[p]))
    .filter(Boolean)
  return items.length ? items.join(' | ') : '-'
}

defineExpose({
  refresh: loadChanges,
})
</script>

<template>
  <div class="task-throttle-changelog flex flex-column gap-3 p-3 h-100">
    <div class="flex align-center justify-content-between flex-wrap gap-2">
      <div class="flex align-center gap-2 flex-wrap">
        <el-select v-model="filterType" size="small" style="width: 170px">
          <el-option
            value="ALL"
            :label="t('packages_business_task_throttle_chg_type_all')"
          />
          <el-option
            value="POLICY_CHANGE"
            :label="t('packages_business_task_throttle_chg_type_policy')"
          />
          <el-option
            value="RECEIPT_APPLIED"
            :label="t('packages_business_task_throttle_status_applied')"
          />
          <el-option
            value="RECEIPT_FAILED"
            :label="t('packages_business_task_throttle_status_failed')"
          />
          <el-option
            value="STOP_EVIDENCE"
            :label="t('packages_business_task_throttle_chg_type_stop')"
          />
        </el-select>
        <el-select v-model="filterWindow" size="small" style="width: 140px">
          <el-option
            value="ALL"
            :label="t('packages_business_task_throttle_chg_window_all')"
          />
          <el-option
            value="24H"
            :label="t('packages_business_task_throttle_chg_window_24h')"
          />
          <el-option
            value="7D"
            :label="t('packages_business_task_throttle_chg_window_7d')"
          />
        </el-select>
      </div>
      <el-button size="small" :loading="loading" @click="loadChanges">
        {{ t('public_button_refresh') }}
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredRows"
      size="small"
      border
      class="flex-1"
      style="width: 100%"
    >
      <el-table-column
        :label="t('packages_business_task_throttle_chg_time')"
        width="165"
      >
        <template #default="{ row }">
          {{ formatTimestamp(row.occurredAt) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_type')"
        width="120"
      >
        <template #default="{ row }">
          <el-tag size="small" effect="plain">
            {{ eventTypeLabel(row.eventType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_version')"
        width="120"
      >
        <template #default="{ row }">
          <div>E{{ row.runEpoch ?? 0 }} / v{{ row.policyVersion ?? 0 }}</div>
          <div
            v-if="row.skippedVersions?.length"
            class="fs-8 font-color-sslight"
          >
            {{
              t('packages_business_task_throttle_chg_skipped', {
                versions: row.skippedVersions
                  .map((v: number) => `v${v}`)
                  .join(', '),
              })
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_operator')"
        min-width="140"
      >
        <template #default="{ row }">
          {{ row.operator || row.agentId || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_before')"
        min-width="180"
      >
        <template #default="{ row }">
          {{ formatPhases(row.beforePhases) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_after')"
        min-width="180"
      >
        <template #default="{ row }">
          {{ formatPhases(row.afterPhases) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('packages_business_task_throttle_chg_outcome')"
        min-width="180"
      >
        <template #default="{ row }">
          <div v-if="row.outcome" class="fw-sub">
            {{ row.outcome }}
          </div>
          <div v-if="row.reason" class="fs-8 font-color-light">
            {{ row.reason }}
          </div>
          <span v-if="!row.outcome && !row.reason">-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
