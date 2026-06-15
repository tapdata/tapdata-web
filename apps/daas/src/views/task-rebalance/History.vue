<script setup lang="ts">
import { fetchClusterStates } from '@tap/api/src/core/cluster'
import {
  cancelTaskRebalance,
  cancelTaskRebalanceJob,
  fetchTaskRebalances,
  getTaskRebalanceDetail,
  type JobStatus,
  type TaskRebalanceVo,
} from '@tap/api/src/core/task-rebalance'
import { fetchWorkers } from '@tap/api/src/core/workers'
import { useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { useHas } from '@tap/business/src/composables'
import { dayjs } from '@tap/business/src/shared'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { computed, onUnmounted, ref, watch } from 'vue'
import TaskRebalanceDrawer from '../cluster/TaskRebalanceDrawer.vue'

const { t } = useI18n()
const $has = useHas()

const hasEditPermission = computed(() => {
  return $has('v2_task_rebalance_Edit')
})

type JobCategory = 'running' | 'pending' | 'failed' | 'skipped' | 'success'

const selectedId = ref<string | null>(null)
const statusFilter = ref<JobCategory | null>(null)
const cancellingAll = ref(false)
const cancellingJobId = ref<string | null>(null)
const showRebalanceDrawer = ref(false)

// ── Agent data ────────────────────────────────────────────────────────────────
// Two separate requests:
//   1. clusterStates  — fetched once; gives us node identity (id, name, online).
//   2. workerMetrics  — polled every 5 s; gives us live CPU / Mem ratios.
//
// Splitting them avoids re-fetching the whole cluster list on every metric tick.

/** Convert raw 0-1 ratio from Workers API → percentage number (0-100) */
function toPercent(val?: number | string | null): number {
  if (val == null) return 0
  const n = Number(val) * 100
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, Number(n.toFixed(2))))
}

// 1. Node list — runs once on mount, no polling needed.
const { data: clusterStates } = useRequest(
  () => fetchClusterStates({ limit: 200 }),
  { initialData: null },
)

/** Process IDs derived from the cluster list — used by the metrics poller. */
const processIds = computed<string[]>(() =>
  ((clusterStates.value as any)?.items || [])
    .map((it: any) => it?.systemInfo?.process_id)
    .filter(Boolean),
)

// 2. Metric values — polled every 10 s independently of the node list.
type MetricMap = Record<string, { cpuUsage: number; memUsage: number }>
const emptyMetricMap: MetricMap = {}

const { data: workerMetrics, run: runWorkerMetrics } = useRequest(
  async (): Promise<MetricMap> => {
    const ids = processIds.value
    if (!ids.length) return emptyMetricMap
    const res = await fetchWorkers({
      where: { process_id: { inq: ids }, worker_type: 'connector' },
    })
    const map: MetricMap = {}
    for (const w of res?.items || []) {
      if (w.process_id && w.metricValues) {
        map[w.process_id] = {
          cpuUsage: toPercent(w.metricValues.CpuUsage),
          memUsage: toPercent(w.metricValues.HeapMemoryUsage),
        }
      }
    }
    return map
  },
  { initialData: emptyMetricMap, pollingInterval: 10000 },
)

// Kick off an immediate metrics fetch as soon as clusterStates resolves and
// process IDs are available — without waiting for the first polling tick.
const stopMetricsWatch = watch(processIds, (ids) => {
  if (ids.length) {
    runWorkerMetrics()
    stopMetricsWatch()
  }
})

/** Merged agent list: identity from clusterStates, metrics from workerMetrics. */
const rebalanceAgents = computed(() =>
  ((clusterStates.value as any)?.items || []).map((item: any) => {
    const pid: string = item.systemInfo?.process_id
    const metrics = (pid && workerMetrics.value?.[pid]) || {
      cpuUsage: 0,
      memUsage: 0,
    }
    return {
      agentId: pid,
      name: item.agentName || item.systemInfo?.hostname || pid || '',
      online: item.status === 'running',
      cpuUsage: metrics.cpuUsage,
      memUsage: metrics.memUsage,
    }
  }),
)

/** agentId → display name, for the jobs table */
const agentNameMap = computed<Map<string, string>>(() => {
  const m = new Map<string, string>()
  for (const a of rebalanceAgents.value) {
    if (a.agentId) m.set(a.agentId, a.name)
  }
  return m
})

function agentName(id?: string | null): string {
  if (!id) return '-'
  return agentNameMap.value.get(id) || id
}

const JOB_CATEGORY_MAP: Record<JobStatus, JobCategory> = {
  OK: 'success',
  PENDING: 'pending',
  STARTING: 'running',
  STOPPING: 'running',
  CANCELLED: 'skipped',
  INVALID_AGENT: 'failed',
  STATUS_ERROR: 'failed',
  STOP_TIMEOUT: 'failed',
  START_TIMEOUT: 'failed',
  FAILED: 'failed',
}

const CATEGORY_ORDER: Record<JobCategory, number> = {
  running: 0,
  pending: 1,
  failed: 2,
  skipped: 3,
  success: 4,
}

const CATEGORY_LABEL: Record<JobCategory, string> = {
  success: 'daas_task_rebalance_history_stat_success',
  failed: 'daas_task_rebalance_history_stat_failed',
  skipped: 'daas_task_rebalance_history_record_cancelled',
  running: 'daas_task_rebalance_history_stat_running',
  pending: 'daas_task_rebalance_history_stat_pending',
}

const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  PENDING: 'daas_task_rebalance_history_job_pending',
  STARTING: 'daas_task_rebalance_history_job_starting',
  STOPPING: 'daas_task_rebalance_history_job_stopping',
  OK: 'daas_task_rebalance_history_job_ok',
  CANCELLED: 'daas_task_rebalance_history_job_cancelled',
  INVALID_AGENT: 'daas_task_rebalance_history_job_invalid_agent',
  STATUS_ERROR: 'daas_task_rebalance_history_job_status_error',
  STOP_TIMEOUT: 'daas_task_rebalance_history_job_stop_timeout',
  START_TIMEOUT: 'daas_task_rebalance_history_job_start_timeout',
  FAILED: 'daas_task_rebalance_history_job_failed',
}

const CATEGORY_ICON = {
  running: IconLucideLoaderCircle,
  pending: IconLucideClock,
  success: IconLucideCircleCheck,
  skipped: IconLucideTriangleAlert,
  failed: IconLucideCircleX,
}

const STAT_ITEMS: JobCategory[] = [
  'success',
  'failed',
  'skipped',
  'running',
  'pending',
]

const { data: records, loading: listLoading } = useRequest(
  async () => {
    const res = await fetchTaskRebalances({
      order: 'createTime DESC',
      limit: 100,
    })
    const items = res.items || []
    const first = items[0]
    if (!selectedId.value && first) {
      selectedId.value = first.id
    }
    return items
  },
  { initialData: [], pollingInterval: 10000 },
)

const {
  data: detail,
  loading: detailLoading,
  run: runFetchDetail,
  runAsync: runFetchDetailAsync,
} = useRequest(
  async () => {
    if (!selectedId.value) return null
    return await getTaskRebalanceDetail(selectedId.value)
  },
  {
    manual: true,
    initialData: null,
    onSuccess(data) {
      const rebalance = records.value?.find((r) => r.id === data?.rebalance.id)
      rebalance && Object.assign(rebalance, data?.rebalance)
    },
  },
)

const rebalance = computed(() => detail.value?.rebalance || null)

const jobs = computed(() =>
  (detail.value?.jobs || []).map((job) => ({
    ...job,
    category: JOB_CATEGORY_MAP[job.status] || ('pending' as JobCategory),
  })),
)

const stats = computed(() => {
  const r = rebalance.value
  return {
    success: r?.okCount || 0,
    failed: r?.failedCount || 0,
    skipped: r?.cancelledCount || 0,
    running: (r?.startingCount || 0) + (r?.stoppingCount || 0),
    pending: r?.pendingCount || 0,
  }
})

const progress = computed(() => {
  const r = rebalance.value
  if (!r || !r.totalCount) return 0
  const finished =
    (r.okCount || 0) + (r.failedCount || 0) + (r.cancelledCount || 0)
  return Math.round((finished / r.totalCount) * 100)
})

const filteredJobs = computed(() => {
  const list = statusFilter.value
    ? jobs.value.filter((j) => j.category === statusFilter.value)
    : [...jobs.value]
  return list.sort(
    (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
  )
})

function formatTime(time?: string | null) {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function formatDuration(start?: string | null, end?: string | null): string {
  if (!start) return '-'
  // end 为 null/undefined 时取当前时间（运行中场景）
  const totalSeconds = dayjs(end ?? undefined).diff(dayjs(start), 'second')
  if (totalSeconds < 0) return '-'
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes < 60) return `${minutes}m ${seconds}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

type RebalanceStatus = 'CREATING' | 'RUNNING' | 'OK' | 'FAILED' | 'CANCELLED'

interface RecordStatus {
  key: 'creating' | 'running' | 'done' | 'partial' | 'cancelled' | 'failed'
  label: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

const RECORD_STATUS_MAP = new Map<RebalanceStatus, RecordStatus>([
  [
    'CREATING',
    {
      key: 'creating',
      label: 'daas_task_rebalance_history_record_creating',
      type: 'info',
    },
  ],
  [
    'RUNNING',
    {
      key: 'running',
      label: 'daas_task_rebalance_history_record_running',
      type: 'primary',
    },
  ],
  [
    'OK',
    {
      key: 'done',
      label: 'daas_task_rebalance_history_record_done',
      type: 'success',
    },
  ],
  [
    'FAILED',
    {
      key: 'failed',
      label: 'daas_task_rebalance_history_record_failed',
      type: 'danger',
    },
  ],
  [
    'CANCELLED',
    {
      key: 'cancelled',
      label: 'daas_task_rebalance_history_record_cancelled',
      type: 'info',
    },
  ],
])

function getRecordStatus(record: TaskRebalanceVo): RecordStatus {
  const mapped = RECORD_STATUS_MAP.get(record.status as RebalanceStatus)
  if (mapped) {
    // For OK status, check for partial success or full cancellation
    if (record.status === 'OK') {
      if (record.failedCount > 0) {
        return {
          key: 'partial',
          label: 'daas_task_rebalance_history_record_partial',
          type: 'warning',
        }
      }
      if (record.cancelledCount > 0 && record.okCount === 0) {
        return {
          key: 'cancelled',
          label: 'daas_task_rebalance_history_record_cancelled',
          type: 'info',
        }
      }
    }
    return mapped
  }
  return {
    key: 'done',
    label: 'daas_task_rebalance_history_record_done',
    type: 'success',
  }
}

const CATEGORY_TAG_TYPE: Record<
  JobCategory,
  'primary' | 'success' | 'warning' | 'info' | 'danger'
> = {
  success: 'success',
  failed: 'danger',
  skipped: 'info',
  running: 'primary',
  pending: 'warning',
}

const pendingCount = computed(
  () => jobs.value.filter((j) => j.category === 'pending').length,
)

function handleSelect(id: string) {
  if (id === selectedId.value) return
  selectedId.value = id
}

function toggleFilter(category: JobCategory) {
  statusFilter.value = statusFilter.value === category ? null : category
}

async function handleCancelJob(taskId: string) {
  if (!selectedId.value) return
  cancellingJobId.value = taskId
  try {
    await cancelTaskRebalanceJob(selectedId.value, taskId)
    ElMessage.success(t('daas_task_rebalance_history_cancel_success'))
    await runFetchDetailAsync()
  } finally {
    cancellingJobId.value = null
  }
}

async function handleCancelAll() {
  if (!selectedId.value || !pendingCount.value) return
  const ok = await Modal.confirm(
    t('daas_task_rebalance_history_cancel_remaining'),
    t('daas_task_rebalance_history_cancel_remaining_confirm', {
      count: pendingCount.value,
    }),
  )
  if (!ok) return
  cancellingAll.value = true
  const count = pendingCount.value
  try {
    await cancelTaskRebalance(selectedId.value)
    ElMessage.success(
      t('daas_task_rebalance_history_cancel_remaining_success', { count }),
    )
    await runFetchDetailAsync()
  } finally {
    cancellingAll.value = false
  }
}

let detailTimer: ReturnType<typeof setInterval> | null = null

function stopDetailPolling() {
  if (detailTimer) {
    clearInterval(detailTimer)
    detailTimer = null
  }
}

function startDetailPolling() {
  stopDetailPolling()
  detailTimer = setInterval(() => {
    if (rebalance.value?.status === 'RUNNING' && selectedId.value) {
      runFetchDetail()
    } else {
      stopDetailPolling()
    }
  }, 3000)
}

watch(selectedId, (id) => {
  statusFilter.value = null
  if (id) {
    runFetchDetail()
  }
})

watch(
  () => rebalance.value?.status,
  (status) => {
    if (status === 'RUNNING') {
      startDetailPolling()
    } else {
      stopDetailPolling()
    }
  },
)

onUnmounted(stopDetailPolling)
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark lh-8">{{
        t('daas_task_rebalance_history_title')
      }}</span>
    </template>
    <template #actions>
      <el-button
        v-if="hasEditPermission"
        type="primary"
        @click="showRebalanceDrawer = true"
      >
        {{ $t('daas_task_rebalance_button') }}
      </el-button>
    </template>

    <div class="flex w-100 h-100 gap-4">
      <div
        class="bg-light dark:bg-white/5 rounded-xl flex flex-column h-100"
        style="width: 280px"
      >
        <div class="px-4 py-2 fs-6 lh-8">
          {{ t('daas_task_rebalance_history_list_title') }}
        </div>
        <el-scrollbar
          v-loading="listLoading && !records?.length"
          class="flex-1 min-h-0"
          wrap-class="p-2 pt-0"
        >
          <div
            v-if="!records?.length"
            class="text-center py-8 text-disabled flex flex-column align-center gap-1"
          >
            <el-icon size="24" class="mb-1">
              <i-lucide-inbox />
            </el-icon>
            <div>{{ t('daas_task_rebalance_history_empty') }}</div>
            <div class="fs-8">
              {{ t('daas_task_rebalance_history_empty_desc') }}
            </div>
          </div>
          <div v-else class="flex flex-column gap-1">
            <div
              v-for="record in records"
              :key="record.id"
              class="list-item-hover rounded-lg p-2 flex flex-column gap-1 cursor-pointer font-color-light"
              :class="{
                'bg-card shadow-sm font-color-dark': record.id === selectedId,
              }"
              @click="handleSelect(record.id)"
            >
              <div class="flex align-center gap-2">
                <!-- <span class="ellipsis lh-6 flex-1">{{ record.name }}</span> -->
                <span class="ellipsis lh-6 flex-1 font-color-dark">{{
                  formatTime(record.createTime)
                }}</span>
                <el-tag
                  size="small"
                  :type="getRecordStatus(record).type"
                  disable-transitions
                >
                  {{ t(getRecordStatus(record).label) }}
                </el-tag>
              </div>
              <div class="flex align-center gap-1 text-caption">
                <el-icon>
                  <i-lucide-user-round />
                </el-icon>
                {{ record.createUser }}
              </div>
              <div class="flex align-center gap-2 text-caption fs-8">
                <span>{{
                  t('daas_task_rebalance_history_task_total', {
                    count: record.totalCount,
                  })
                }}</span>
                <el-divider direction="vertical" class="mx-0" />
                <span class="flex align-center gap-1">
                  <el-icon
                    v-if="record.status === 'RUNNING'"
                    class="is-loading"
                  >
                    <i-lucide-loader-circle />
                  </el-icon>
                  <template v-else>
                    <el-icon>
                      <i-lucide-clock />
                    </el-icon>
                    {{ formatDuration(record.createTime, record.finishAt) }}
                  </template>
                </span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <div class="flex-1 flex flex-column gap-4 min-w-0">
        <template v-if="rebalance">
          <div
            class="bg-light dark:bg-white/5 rounded-xl p-4 flex flex-column gap-4"
          >
            <div class="flex align-center gap-2">
              <span class="fs-6 fw-sub flex-1 ellipsis">{{
                t('daas_task_rebalance_history_progress')
              }}</span>
              <el-button
                v-if="pendingCount && hasEditPermission"
                type="danger"
                plain
                :loading="cancellingAll"
                @click="handleCancelAll"
              >
                {{ t('daas_task_rebalance_history_cancel_remaining') }}
              </el-button>
            </div>
            <div>
              <el-progress
                :stroke-width="8"
                :percentage="progress"
                :status="
                  rebalance.status === 'FAILED'
                    ? 'exception'
                    : progress === 100
                      ? 'success'
                      : ''
                "
              />
            </div>

            <div class="flex gap-3">
              <div
                v-for="item in STAT_ITEMS"
                :key="item"
                class="stat-card flex-1 rounded-lg p-3 cursor-pointer"
                :class="[
                  `stat-${item}`,
                  { 'is-active': statusFilter === item },
                ]"
                @click="toggleFilter(item)"
              >
                <div class="fs-5 fw-sub">{{ stats[item] }}</div>
                <div class="text-caption flex align-center gap-1">
                  <span class="stat-dot mr-1" :class="`stat-dot-${item}`" />
                  {{ t(CATEGORY_LABEL[item]) }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-light dark:bg-white/5 rounded-xl min-h-0 flex-1 flex flex-column"
          >
            <div class="p-2 flex-1 min-h-0">
              <div
                class="bg-card rounded-xl p-2 h-100"
                style="border: 1px solid #f2f4f7"
              >
                <el-table
                  v-loading="detailLoading && !jobs.length"
                  :data="filteredJobs"
                  height="100%"
                  class="w-100"
                >
                  <el-table-column
                    :label="t('daas_task_rebalance_history_col_task')"
                    prop="taskName"
                    min-width="180"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    :label="t('daas_task_rebalance_history_col_source')"
                    min-width="140"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">{{
                      agentName(row.sourceAgentId)
                    }}</template>
                  </el-table-column>
                  <el-table-column
                    :label="t('daas_task_rebalance_history_col_target')"
                    min-width="140"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">{{
                      agentName(row.targetAgentId)
                    }}</template>
                  </el-table-column>
                  <el-table-column
                    :label="t('daas_task_rebalance_history_col_status')"
                    width="120"
                  >
                    <template #default="{ row }">
                      <el-tag
                        size="small"
                        :type="CATEGORY_TAG_TYPE[row.category as JobCategory]"
                        disable-transitions
                        effect="plain"
                      >
                        <div class="flex align-center gap-1">
                          <el-icon
                            :class="{
                              'is-loading': row.category === 'running',
                            }"
                          >
                            <component
                              :is="CATEGORY_ICON[row.category as JobCategory]"
                            />
                          </el-icon>
                          {{
                            t(
                              JOB_STATUS_LABEL[row.status as JobStatus] ??
                                CATEGORY_LABEL[row.category as JobCategory],
                            )
                          }}
                        </div>
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="t('daas_task_rebalance_history_col_error')"
                    prop="errorMesg"
                    min-width="160"
                    show-overflow-tooltip
                    class-name="p-0"
                  >
                    <template #default="{ row }">
                      <div class="flex align-center">
                        <span class="ellipsis">{{ row.errorMesg || '-' }}</span>
                        <el-button
                          v-if="row.category === 'pending' && hasEditPermission"
                          text
                          type="danger"
                          class="ml-auto"
                          :loading="cancellingJobId === row.taskId"
                          @click="handleCancelJob(row.taskId)"
                        >
                          {{ t('daas_task_rebalance_history_cancel') }}
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </template>
        <div
          v-else
          class="flex-1 flex align-center justify-center text-disabled bg-light dark:bg-white/5 rounded-xl"
        >
          {{ t('daas_task_rebalance_history_detail_empty') }}
        </div>
      </div>
    </div>

    <TaskRebalanceDrawer
      v-model="showRebalanceDrawer"
      :agents="rebalanceAgents"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.stat-card {
  border: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color);
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &.is-active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary);
  }
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;

  &-success {
    background-color: var(--el-color-success);
  }
  &-failed {
    background-color: var(--el-color-danger);
  }
  &-skipped {
    background-color: var(--el-color-info);
  }
  &-running {
    background-color: var(--el-color-primary);
  }
  &-pending {
    background-color: var(--el-color-warning);
  }
}
</style>
