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

function eventTypeTagType(
  row: TaskThrottleChangeLogEntry,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  if (row.eventType === 'POLICY_CHANGE') return 'primary'
  if (row.eventType === 'STOP_EVIDENCE') return 'warning'
  if (row.eventType === 'APPLY_RECEIPT') {
    return String(row.outcome || '').toUpperCase() === 'APPLIED'
      ? 'success'
      : 'danger'
  }
  return 'info'
}

interface PhaseSummaryLine {
  phase: ThrottlePhase
  tag: string
  detail: string
  off: boolean
}

function getPhaseLines(
  phases?: Partial<Record<ThrottlePhase, ThrottlePhaseLimit>> | null,
): PhaseSummaryLine[] {
  if (!phases) return []
  const lines: PhaseSummaryLine[] = []
  for (const phase of ['FULL', 'CDC'] as ThrottlePhase[]) {
    const limit = phases[phase]
    if (!limit) continue
    const tag =
      phase === 'FULL'
        ? t('packages_business_task_throttle_chg_phase_tag_full')
        : t('packages_business_task_throttle_chg_phase_tag_cdc')
    if (!limit.enabled) {
      lines.push({
        phase,
        tag,
        detail: t('packages_business_task_throttle_phase_summary_off'),
        off: true,
      })
      continue
    }
    const parts: string[] = []
    if (limit.bytesPerSec && limit.bytesPerSec > 0) {
      parts.push(`${formatMbPerSec(limit.bytesPerSec)} MB/s`)
    }
    if (limit.eventsPerSec && limit.eventsPerSec > 0) {
      parts.push(`${limit.eventsPerSec}/s`)
    }
    lines.push({
      phase,
      tag,
      detail: parts.join(' · ') || '-',
      off: false,
    })
  }
  return lines
}

function resolveRawOperator(row: TaskThrottleChangeLogEntry): string {
  return row.operator || row.agentId || '-'
}

function formatCompactOperator(row: TaskThrottleChangeLogEntry): string {
  const raw = resolveRawOperator(row)
  if (raw === '-') return '-'
  if (raw.startsWith('agent:')) {
    const id = raw.slice(6)
    if (id.length > 12) {
      return `Agent · ${id.slice(0, 4)}…${id.slice(-4)}`
    }
    return `Agent · ${id}`
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(raw) && raw.length > 14) {
    return `${raw.slice(0, 6)}…${raw.slice(-4)}`
  }
  return raw
}

function getOutcomeBadge(outcome?: string | null): {
  label: string
  type: 'success' | 'primary' | 'warning' | 'danger' | 'info'
} {
  const code = String(outcome || '')
    .trim()
    .toUpperCase()
  switch (code) {
    case 'APPLIED':
      return {
        label: t('packages_business_task_throttle_chg_outcome_applied'),
        type: 'success',
      }
    case 'COMMITTED':
      return {
        label: t('packages_business_task_throttle_chg_outcome_committed'),
        type: 'primary',
      }
    case 'AGENT_GRACEFUL_STOP':
      return {
        label: t('packages_business_task_throttle_chg_outcome_graceful'),
        type: 'success',
      }
    case 'OPERATOR_MANUAL':
      return {
        label: t('packages_business_task_throttle_chg_outcome_manual'),
        type: 'warning',
      }
    case 'SKIPPED':
      return {
        label: t('packages_business_task_throttle_chg_outcome_skipped'),
        type: 'info',
      }
    case 'FAILED':
      return {
        label: t('packages_business_task_throttle_chg_outcome_failed'),
        type: 'danger',
      }
    case 'REJECTED':
      return {
        label: t('packages_business_task_throttle_chg_outcome_rejected'),
        type: 'danger',
      }
    default:
      return { label: code || '-', type: 'info' }
  }
}

defineExpose({
  refresh: loadChanges,
})
</script>

<template>
  <div class="task-throttle-changelog flex flex-column gap-2 p-3 h-100">
    <div class="changelog-toolbar">
      <div class="flex align-center gap-2 flex-wrap">
        <el-select v-model="filterType" size="small" style="width: 136px">
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
        <el-select v-model="filterWindow" size="small" style="width: 120px">
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
      <div class="flex align-center gap-2">
        <span class="fs-8 font-color-sslight tabular-nums">
          {{
            t('packages_business_task_throttle_chg_total_records', {
              count: filteredRows.length,
            })
          }}
        </span>
        <el-button size="small" :loading="loading" @click="loadChanges">
          {{ t('public_button_refresh') }}
        </el-button>
      </div>
    </div>

    <div class="changelog-table-wrap flex-1">
      <el-table
        v-loading="loading"
        :data="filteredRows"
        size="small"
        height="100%"
        class="changelog-table"
        style="width: 100%"
      >
        <el-table-column
          :label="t('packages_business_task_throttle_chg_time')"
          width="144"
        >
          <template #default="{ row }">
            <span class="tabular-nums font-color-normal">
              {{ formatTimestamp(row.occurredAt) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('packages_business_task_throttle_chg_type')"
          width="96"
        >
          <template #default="{ row }">
            <el-tag size="small" effect="light" :type="eventTypeTagType(row)">
              {{ eventTypeLabel(row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('packages_business_task_throttle_chg_version')"
          width="84"
        >
          <template #default="{ row }">
            <span class="changelog-ver-pill tabular-nums">
              E{{ row.runEpoch ?? 0 }} · v{{ row.policyVersion ?? 0 }}
            </span>
            <div
              v-if="row.skippedVersions?.length"
              class="fs-8 font-color-sslight mt-1"
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
          width="124"
        >
          <template #default="{ row }">
            <el-tooltip
              :content="resolveRawOperator(row)"
              placement="top"
              :disabled="resolveRawOperator(row) === '-'"
            >
              <span class="changelog-operator tabular-nums">
                {{ formatCompactOperator(row) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('packages_business_task_throttle_chg_before')"
          min-width="136"
        >
          <template #default="{ row }">
            <div
              v-if="getPhaseLines(row.beforePhases).length"
              class="changelog-phases"
            >
              <div
                v-for="item in getPhaseLines(row.beforePhases)"
                :key="item.phase"
                class="changelog-phase-line"
              >
                <span class="changelog-phase-tag">{{ item.tag }}</span>
                <span
                  class="tabular-nums"
                  :class="item.off ? 'font-color-sslight' : 'font-color-normal'"
                >
                  {{ item.detail }}
                </span>
              </div>
            </div>
            <span v-else class="font-color-sslight">—</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('packages_business_task_throttle_chg_after')"
          min-width="136"
        >
          <template #default="{ row }">
            <div
              v-if="getPhaseLines(row.afterPhases).length"
              class="changelog-phases"
            >
              <div
                v-for="item in getPhaseLines(row.afterPhases)"
                :key="item.phase"
                class="changelog-phase-line"
              >
                <span class="changelog-phase-tag">{{ item.tag }}</span>
                <span
                  class="tabular-nums"
                  :class="item.off ? 'font-color-sslight' : 'font-color-dark'"
                >
                  {{ item.detail }}
                </span>
              </div>
            </div>
            <span v-else class="font-color-sslight">—</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('packages_business_task_throttle_chg_outcome')"
          min-width="144"
        >
          <template #default="{ row }">
            <div v-if="row.outcome || row.reason" class="changelog-outcome">
              <el-tag
                v-if="row.outcome"
                size="small"
                effect="light"
                :type="getOutcomeBadge(row.outcome).type"
              >
                {{ getOutcomeBadge(row.outcome).label }}
              </el-tag>
              <el-tooltip
                v-if="row.reason"
                :content="row.reason"
                placement="top"
              >
                <div class="changelog-reason font-color-light">
                  {{ row.reason }}
                </div>
              </el-tooltip>
            </div>
            <span v-else class="font-color-sslight">—</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-throttle-changelog {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

.changelog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.changelog-table-wrap {
  min-height: 0;
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.changelog-table {
  :deep(.el-table__header-wrapper th.el-table__cell) {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    padding: 7px 0;
  }

  :deep(.el-table__cell) {
    padding: 7px 0;
  }
}

.changelog-ver-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  background-color: #f1f5f9;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.changelog-operator {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #334155;
}

.changelog-phases {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.changelog-phase-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.35;
}

.changelog-phase-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  height: 17px;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 500;
  flex-shrink: 0;
}

.changelog-outcome {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  min-width: 0;
}

.changelog-reason {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11.5px;
  line-height: 1.35;
}
</style>
