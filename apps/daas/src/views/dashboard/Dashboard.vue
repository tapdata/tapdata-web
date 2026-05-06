<script setup lang="ts">
import {
  fetchClusterStates,
  type ClusterState,
} from '@tap/api/src/core/cluster'
import {
  fetchTaskDashboard,
  type TaskDashboardTopTask,
  type TaskDashboardVo,
} from '@tap/api/src/core/task'
import { fetchWorkers, getProcessInfo } from '@tap/api/src/core/workers'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import Chart from '@tap/component/src/chart/Chart.vue'
import CountUp from '@tap/component/src/CountUp.vue'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared/src/number'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { STATUS_MAP as DASHBOARD_STATUS_MAP } from './const'

const router = useRouter()
const { t } = useI18n()

// ── State ──────────────────────────────────────────────
const loading = ref(false)
const lastUpdated = ref(t('dashboard_odh_just_now'))
const dashboardData = ref<TaskDashboardVo | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// API Requests card time range
const apiTimeRange = ref<'5m' | '1h' | '24h'>('1h')

// System Trends time range
const trendsTimeRange = ref<'5min' | '1h' | '24h'>('24h')

// Top Tasks state
const topTaskTab = ref<'lagging' | 'throughput'>('lagging')
const topTaskTabOptions = computed(() => [
  { label: t('dashboard_odh_most_lagging'), value: 'lagging' },
  { label: t('dashboard_odh_highest_throughput'), value: 'throughput' },
])
const topTaskLimit = ref<5 | 10 | 20>(5)
const topTaskLimitOptions = computed(() => [
  { label: t('dashboard_odh_top_n', [5]), value: 5 },
  { label: t('dashboard_odh_top_n', [10]), value: 10 },
  { label: t('dashboard_odh_top_n', [20]), value: 20 },
])

// Cluster / Agent data
interface AgentNode extends ClusterState {
  processId?: string
}
const agentNodes = ref<AgentNode[]>([])
const agentRunningTask = ref<Record<string, any>>({})

// ── KPI: Active Tasks ──────────────────────────────────
const activeTasks = computed(() => dashboardData.value?.summary?.activeTasks)

function formatLag(ms: number): string {
  if (!ms || ms <= 0) return '0s'
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remainder = s % 60
  return remainder > 0 ? `${m}m ${remainder}s` : `${m}m`
}

// ── KPI: Total Throughput ──────────────────────────────
const throughput = computed(() => dashboardData.value?.summary?.totalThroughput)

// ── KPI: Connected DBs ────────────────────────────────
const connectedDbs = computed(() => dashboardData.value?.summary?.connectedDbs)

// ── KPI: API Requests ──────────────────────────────────
const apiRequests = computed(() => dashboardData.value?.summary?.apiRequests)
const hasApiTrendsData = computed(() => {
  const trends = dashboardData.value?.trends?.apiRequests
  return (trends?.ts?.length ?? 0) > 0
})

// ── System Trends: ECharts options ─────────────────────
const throughputChartOption = computed(() => {
  const trends = dashboardData.value?.trends?.throughput
  if (!trends?.ts?.length) return buildAreaChartOption([], [], '#6366f1')
  // const showSeconds = trendsTimeRange.value === '5min'
  const xData = trends.ts.map((t) => formatTimeLabel(t, true))
  const yData = trends.values.map((v: number) => Number(v.toFixed(2)))
  return buildAreaChartOption(xData, yData, '#6366f1')
})

const apiChartOption = computed(() => {
  const trends = dashboardData.value?.trends?.apiRequests
  if (!trends?.ts?.length) return buildLineChartOption([], [], '#a855f7')
  // const showSeconds = apiTimeRange.value === '5m'
  const xData = trends.ts.map((t) => formatTimeLabel(t, true))
  const yData = trends.values.map((v: number) => Number(v.toFixed(2)))
  return buildLineChartOption(xData, yData, '#a855f7')
})

function formatTimeLabel(ts: number, showSeconds = false): string {
  const d = new Date(Number(`${ts}000`))
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (showSeconds) {
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${hh}:${mm}`
}

function buildAreaChartOption(x: string[], y: number[], color: string) {
  return {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 16, bottom: 28, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: { color: '#334155', fontSize: 12 },
      axisPointer: { type: 'cross', crossStyle: { color: '#94a3b8' } },
    },
    xAxis: {
      type: 'category',
      data: x,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        data: y,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}33` },
              { offset: 1, color: `${color}05` },
            ],
          },
        },
      },
    ],
  }
}

function buildLineChartOption(x: string[], y: number[], color: string) {
  return {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 16, bottom: 28, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: { color: '#334155', fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: x,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        data: y,
        smooth: false,
        symbol: 'none',
        lineStyle: { width: 2, color },
      },
    ],
  }
}

// ── Top Tasks ──────────────────────────────────────────
const topTasks = computed<TaskDashboardTopTask[]>(() => {
  const tops = dashboardData.value?.tops
  if (!tops) return []
  const list =
    topTaskTab.value === 'lagging'
      ? tops.topLaggingTasks
      : tops.topThroughputTasks
  return (list || []).slice(0, topTaskLimit.value)
})

function goToMonitor(task: TaskDashboardTopTask) {
  const route =
    task.syncType === 'migrate'
      ? { name: 'MigrationMonitor', params: { id: task.taskId } }
      : { name: 'TaskMonitor', params: { id: task.taskId } }
  const href = router.resolve(route).href
  window.open(href, '_blank')
}

function latencyClass(ms: number): string {
  const s = ms / 1000
  if (s > 60) return 'badge--red'
  if (s > 10) return 'badge--amber'
  return 'badge--green'
}

function formatLatency(ms: number): string {
  if (!ms || ms <= 0) return '0s'
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remainder = s % 60
  return remainder > 0 ? `${m}m ${remainder}s` : `${m}m`
}

function formatThroughput(n: number): string {
  if (!n && n !== 0) return '0/s'
  return `${n.toLocaleString()}/s`
}

// ── Agent Cluster ──────────────────────────────────────
function getAgentStatus(node: AgentNode) {
  if (node.status === 'running') return 'online'
  if (node.status === 'stopped') return 'offline'
  return 'warning'
}

function getCpuUsage(node: AgentNode): number {
  const val = node.metricValues?.CpuUsage
  if (!val) return 0
  return Math.round(Number.parseFloat(String(val)) || 0)
}

function getMemUsage(node: AgentNode): number {
  const val = node.metricValues?.HeapMemoryUsage
  if (!val) return 0
  return Math.round(Number.parseFloat(String(val)) || 0)
}

function usageBarColor(pct: number) {
  if (pct > 80) return '#ef4444'
  if (pct > 60) return '#f59e0b'
  return '#22c55e'
}

function getRunningTaskCount(node: AgentNode): number {
  if (!node.processId) return 0
  const info = agentRunningTask.value[node.processId]
  if (!info) return 0
  return (info.migrate || 0) + (info.sync || 0)
}

function getStatusLabel(type: string) {
  return (DASHBOARD_STATUS_MAP as any)[type] || '-'
}

// ── Helpers ────────────────────────────────────────────
function rangeToTimeParams(range: string): {
  type: 'minute' | 'hours' | 'days'
} {
  if (range === '5m' || range === '5min') return { type: 'minute' }
  if (range === '1h') return { type: 'hours' }
  return { type: 'days' }
}

// ── Data fetching ──────────────────────────────────────
async function fetchClusterData() {
  const clusterData = await fetchClusterStates({ type: 'dashboard' }).catch(
    () => ({ items: [] }),
  )

  const processIds: string[] = []
  const items: AgentNode[] = (clusterData?.items || []).map((item: any) => {
    const node: AgentNode = { ...item }
    if (node.status !== 'running') {
      for (const svc of ['management', 'engine', 'apiServer'] as const) {
        if ((node as any)[svc]) {
          ;(node as any)[svc].status = 'stopped'
          ;(node as any)[svc].serviceStatus = 'stopped'
        }
      }
    }
    if (node.systemInfo?.process_id) {
      node.processId = node.systemInfo.process_id
      processIds.push(node.systemInfo.process_id)
    }
    return node
  })

  if (processIds.length > 0) {
    try {
      const [workerResponse, processData] = await Promise.all([
        fetchWorkers({
          where: { process_id: { inq: processIds }, worker_type: 'connector' },
        }).catch(() => null),
        getProcessInfo(processIds).catch(() => null),
      ])

      const metricMap: Record<
        string,
        { CpuUsage: string; HeapMemoryUsage: string }
      > = {}
      if (workerResponse?.items?.length) {
        for (const w of workerResponse.items) {
          if (w.metricValues) {
            metricMap[(w as any).process_id] = {
              CpuUsage: `${(((w.metricValues as any).CpuUsage ?? 0) * 100).toFixed(2)}%`,
              HeapMemoryUsage: `${(((w.metricValues as any).HeapMemoryUsage ?? 0) * 100).toFixed(2)}%`,
            }
          }
        }
      }

      for (const node of items) {
        if (node.processId && metricMap[node.processId]) {
          node.metricValues = metricMap[node.processId]
        }
      }

      if (processData) {
        for (const id of Object.keys(processData)) {
          agentRunningTask.value[id] = (processData as any)[id].runningTaskNum
        }
      }
    } catch {
      /* ignore */
    }
  }

  agentNodes.value = items
}

async function fetchDashboardData() {
  loading.value = true
  try {
    await Promise.all([refreshAll(), fetchClusterData()])
    lastUpdated.value = new Date().toLocaleTimeString()
  } finally {
    loading.value = false
  }
}

// ── Partial fetchers (only re-fetch the changed section) ──
async function fetchPartial(
  dashboardType: string,
  range: string,
  top?: number,
) {
  try {
    const result = await fetchTaskDashboard({
      ...rangeToTimeParams(range),
      dashboardType,
      ...(top != null ? { top } : {}),
    })
    if (!result) return
    // Merge partial result into existing data
    const prev = dashboardData.value
    if (!prev) {
      dashboardData.value = result
      return
    }
    switch (dashboardType) {
      case 'activeTasks':
        if (result.summary?.activeTasks) {
          prev.summary.activeTasks = result.summary.activeTasks
        }
        break
      case 'totalThroughput':
        if (result.summary?.totalThroughput) {
          prev.summary.totalThroughput = result.summary.totalThroughput
        }
        break
      case 'connectedDbs':
        if (result.summary?.connectedDbs) {
          prev.summary.connectedDbs = result.summary.connectedDbs
        }
        break
      case 'apiRequests':
        if (result.summary?.apiRequests) {
          prev.summary.apiRequests = result.summary.apiRequests
        }
        break
      case 'trends':
        if (result.trends) {
          prev.trends = {
            ...prev.trends,
            throughput: result.trends.throughput,
            apiRequests: result.trends.apiRequests,
          }
        }
        break
      case 'tops':
        if (result.tops) {
          prev.tops = result.tops
        }
        break
    }
  } catch {
    /* ignore */
  }
}

function onApiTimeRangeChange() {
  fetchPartial('apiRequests', apiTimeRange.value)
}

function onTrendsTimeChange() {
  fetchPartial('trends', trendsTimeRange.value)
}

function onTopTaskLimitChange() {
  fetchPartial('tops', trendsTimeRange.value, topTaskLimit.value)
}

// ── Navigation ─────────────────────────────────────────
function navigateToCluster() {
  router.push({ name: 'clusterManagement' })
}

// ── Refresh ────────────────────────────────────────────
async function refreshAll() {
  await Promise.all([
    fetchPartial('activeTasks', trendsTimeRange.value),
    fetchPartial('totalThroughput', trendsTimeRange.value),
    fetchPartial('connectedDbs', trendsTimeRange.value),
    fetchPartial('apiRequests', apiTimeRange.value),
    fetchPartial('trends', trendsTimeRange.value),
    fetchPartial('tops', trendsTimeRange.value, topTaskLimit.value),
  ])
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  fetchDashboardData()
  refreshTimer = setInterval(refreshAll, 60_000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <PageContainer hide-header mode="blank">
    <section class="dashboard h-100 overflow-auto">
      <div class="dashboard__container">
        <!-- ═══ Header ═══ -->
        <!-- <div class="flex justify-content-between align-items-center mb-6">
          <h1 class="dashboard__title m-0">ODH Operations Dashboard</h1>
          <span class="text-secondary fs-7"
            >Last updated: {{ lastUpdated }}</span
          >
        </div> -->

        <!-- ═══ KPI Cards (4 columns) ═══ -->
        <div class="grid grid-cols-4 gap-5 mb-6">
          <!-- 1) Active Tasks -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <span class="fs-7 text-secondary fw-sub">{{
                t('dashboard_odh_active_tasks')
              }}</span>
              <div class="p-2 bg-gray-50 rounded-lg mt-n2">
                <el-icon size="20" class="text-blue-500 align-top">
                  <i-lucide-activity />
                </el-icon>
              </div>
            </div>
            <div class="din-font fs-2 font-semibold lh-1 mb-4">
              <CountUp :end-val="activeTasks?.total ?? 0" :duration="2" />
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="dashboard__tag dashboard__tag--emerald"
                >{{ t('dashboard_odh_running') }}
                {{ activeTasks?.running ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--red"
                >{{ t('dashboard_odh_error') }}
                {{ activeTasks?.error ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--slate"
                >{{ t('dashboard_odh_max_lag') }}
                {{ formatLag(activeTasks?.maxLag ?? 0) }}</span
              >
              <span class="dashboard__tag dashboard__tag--slate"
                >{{ t('dashboard_odh_min_lag') }}
                {{ formatLag(activeTasks?.minLag ?? 0) }}</span
              >
            </div>
          </div>

          <!-- 2) Total Throughput -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <span class="fs-7 text-secondary fw-sub">{{
                t('dashboard_odh_total_throughput')
              }}</span>
              <div class="p-2 bg-gray-50 rounded-lg mt-n2">
                <el-icon class="text-indigo-500 align-top" size="20">
                  <i-lucide-trending-up />
                </el-icon>
              </div>
            </div>
            <div class="din-font lh-1 mb-1">
              <CountUp
                class="fs-2 font-semibold"
                :end-val="throughput?.current ?? 0"
                :duration="2"
                :decimals="2"
              />
              <span class="fs-7 text-secondary ml-1">{{
                t('dashboard_odh_events_sec')
              }}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span class="dashboard__tag dashboard__tag--amber"
                >{{ t('dashboard_odh_peak') }}
                {{ (throughput?.peak ?? 0).toFixed(2) }}</span
              >
              <span class="dashboard__tag dashboard__tag--indigo"
                >{{ t('dashboard_odh_data') }}
                {{ calcUnit(throughput?.dataRate ?? 0, 'b') }}/s</span
              >
            </div>
            <p
              v-if="throughput?.changeRate"
              class="fs-7 mt-3 mb-0"
              :class="
                throughput.changeRate > 0 ? 'text-success' : 'text-danger'
              "
            >
              {{ throughput.changeRate > 0 ? '+' : ''
              }}{{ throughput.changeRate.toFixed(2) }}%
              {{ t('dashboard_odh_vs_last_hour') }}
            </p>
          </div>

          <!-- 3) Connected DBs -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <span class="fs-7 text-secondary fw-sub">{{
                t('dashboard_odh_connected_dbs')
              }}</span>
              <div class="p-2 bg-gray-50 rounded-lg mt-n2">
                <el-icon class="text-teal-500 align-top" size="20">
                  <i-lucide-database />
                </el-icon>
              </div>
            </div>
            <div class="din-font lh-1 mb-1">
              <CountUp
                class="fs-2 font-semibold"
                :end-val="connectedDbs?.total ?? 0"
                :duration="2"
              />
              <span class="fs-7 text-secondary ml-1">{{
                t('dashboard_odh_sources')
              }}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="db in (connectedDbs?.items || []).slice(0, 3)"
                :key="db.id"
                class="dashboard__tag dashboard__tag--blue break-all"
                >{{ db.name }}
                <strong
                  >{{ db.tableCount }} {{ t('dashboard_odh_tbls') }}</strong
                ></span
              >
            </div>
          </div>

          <!-- 4) API Requests -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <div class="flex align-items-center gap-2">
                <span class="fs-7 text-secondary fw-sub">{{
                  t('dashboard_odh_api_requests')
                }}</span>
                <el-segmented
                  v-model="apiTimeRange"
                  :options="['5m', '1h', '24h']"
                  size="small"
                  @change="onApiTimeRangeChange"
                />
              </div>
              <div class="p-2 bg-gray-50 rounded-lg">
                <el-icon class="text-purple-500 align-top mt-n2" size="20">
                  <i-lucide-server />
                </el-icon>
              </div>
            </div>
            <div class="din-font fs-2 font-semibold lh-1 mb-4">
              <CountUp :end-val="apiRequests?.total ?? 0" :duration="2" />
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="dashboard__tag dashboard__tag--red"
                >{{ t('dashboard_odh_failed') }}
                {{ apiRequests?.failed ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--amber"
                >{{ t('dashboard_odh_rate') }}
                {{ apiRequests?.errorRate ?? 0 }}%</span
              >
              <span class="dashboard__tag dashboard__tag--indigo"
                >{{ t('dashboard_odh_avg_time') }}
                {{ apiRequests?.avgTime ?? 0 }}ms</span
              >
            </div>
          </div>
        </div>

        <!-- ═══ System Trends ═══ -->
        <div class="dashboard__card p-5 mb-6">
          <div class="flex justify-content-between align-items-center mb-5">
            <h2 class="fs-5 font-semibold m-0">
              {{ t('dashboard_odh_system_trends') }}
            </h2>
            <el-segmented
              v-model="trendsTimeRange"
              :options="['5min', '1h', '24h']"
              size="small"
              @change="onTrendsTimeChange"
            />
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="fs-7 text-secondary mb-3 mt-0">
                {{ t('dashboard_odh_throughput_chart') }}
              </p>
              <div class="dashboard__trend-chart">
                <Chart type="line" :extend="throughputChartOption" />
              </div>
            </div>
            <div>
              <p class="fs-7 text-secondary mb-3 mt-0">
                {{ t('dashboard_odh_api_chart') }}
              </p>
              <div class="dashboard__trend-chart">
                <template v-if="hasApiTrendsData">
                  <Chart type="line" :extend="apiChartOption" />
                </template>
                <div
                  v-else
                  class="flex align-items-center justify-content-center h-100"
                >
                  <span class="fs-7 text-secondary">{{
                    t('dashboard_odh_no_data_in_range')
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Top Tasks ═══ -->
        <div class="dashboard__card p-5 mb-6">
          <div class="flex justify-content-between align-items-center mb-4">
            <div class="flex align-items-center gap-3">
              <h2 class="fs-5 font-semibold m-0">
                {{ t('dashboard_odh_top_tasks') }}
              </h2>
              <el-segmented
                v-model="topTaskTab"
                :options="topTaskTabOptions"
                size="small"
              />
            </div>
            <el-segmented
              v-model="topTaskLimit"
              :options="topTaskLimitOptions"
              size="small"
              @change="onTopTaskLimitChange"
            />
          </div>

          <div v-if="topTasks.length" class="dashboard__table-wrap">
            <table class="dashboard__table w-100">
              <thead>
                <tr>
                  <th class="text-start">#</th>
                  <th class="text-start">{{ t('dashboard_odh_task_name') }}</th>
                  <th class="text-end">{{ t('dashboard_odh_latency') }}</th>
                  <th class="text-end">{{ t('dashboard_odh_throughput') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, idx) in topTasks" :key="task.taskId">
                  <td class="text-secondary">{{ idx + 1 }}</td>
                  <td class="font-semibold">
                    <a
                      class="color-primary cursor-pointer text-decoration-none"
                      @click="goToMonitor(task)"
                      >{{ task.taskName }}</a
                    >
                  </td>
                  <td class="text-end">
                    <span
                      class="dashboard__badge"
                      :class="latencyClass(task.latency ?? 0)"
                      >{{ calcTimeUnit(task.latency ?? 0) }}</span
                    >
                  </td>
                  <td class="text-end font-mono">
                    {{ formatThroughput(task.throughput ?? 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <el-empty
            v-else
            :description="t('dashboard_odh_no_task_data')"
            :image-size="60"
          />
        </div>

        <!-- ═══ Agent Cluster Status ═══ -->
        <div class="dashboard__card p-5">
          <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="fs-5 font-semibold m-0">
              {{ t('dashboard_odh_agent_cluster') }}
            </h2>
            <span class="dashboard__nodes-badge">{{
              t('dashboard_odh_nodes_total', [agentNodes.length])
            }}</span>
          </div>

          <div v-if="agentNodes.length" class="dashboard__table-wrap">
            <table class="dashboard__table w-100">
              <thead>
                <tr>
                  <th class="text-start">
                    {{ t('dashboard_odh_agent_name') }}
                  </th>
                  <th class="text-start">{{ t('dashboard_odh_status') }}</th>
                  <th class="text-start">{{ t('dashboard_odh_cpu_usage') }}</th>
                  <th class="text-start">
                    {{ t('dashboard_odh_memory_usage') }}
                  </th>
                  <th class="text-end">
                    {{ t('dashboard_odh_running_tasks') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="node in agentNodes"
                  :key="node.id"
                  class="cursor-pointer"
                  @click="navigateToCluster"
                >
                  <td>
                    <div class="flex align-items-center gap-2">
                      <i-lucide-server
                        class="text-secondary"
                        style="width: 16px; height: 16px"
                      />
                      <span class="font-semibold">{{
                        node.agentName || node.systemInfo?.hostname || '-'
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      class="dashboard__status-badge"
                      :class="`dashboard__status-badge--${getAgentStatus(node)}`"
                    >
                      <i-lucide-check-circle
                        v-if="getAgentStatus(node) === 'online'"
                        style="width: 14px; height: 14px"
                      />
                      <i-lucide-alert-triangle
                        v-else-if="getAgentStatus(node) === 'warning'"
                        style="width: 14px; height: 14px"
                      />
                      <i-lucide-x-circle
                        v-else
                        style="width: 14px; height: 14px"
                      />
                      {{ getStatusLabel(node.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex align-items-center gap-2">
                      <span class="fs-7 font-semibold" style="min-width: 36px"
                        >{{ getCpuUsage(node) }}%</span
                      >
                      <div class="dashboard__usage-bar">
                        <div
                          class="dashboard__usage-bar-fill"
                          :style="{
                            width: `${Math.min(getCpuUsage(node), 100)}%`,
                            backgroundColor: usageBarColor(getCpuUsage(node)),
                          }"
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="flex align-items-center gap-2">
                      <span class="fs-7 font-semibold" style="min-width: 36px"
                        >{{ getMemUsage(node) }}%</span
                      >
                      <div class="dashboard__usage-bar">
                        <div
                          class="dashboard__usage-bar-fill"
                          :style="{
                            width: `${Math.min(getMemUsage(node), 100)}%`,
                            backgroundColor: usageBarColor(getMemUsage(node)),
                          }"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="text-end font-mono font-semibold">
                    {{ getRunningTaskCount(node) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <el-empty
            v-else
            :description="t('dashboard_odh_no_agents')"
            :image-size="60"
          />
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.dashboard {
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
  }

  // ── Cards ──────────────────────────────────────────────
  &__card {
    background-color: #fff;
    border-radius: 0.75rem;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
  }

  &__card-icon {
    width: 20px;
    height: 20px;
    opacity: 0.7;
  }

  // ── Tags (KPI sub-metrics) ─────────────────────────────
  &__tag {
    display: inline-block;
    padding: 0.125rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.5;
    border: 1px solid transparent;

    &--emerald {
      color: #065f46;
      background-color: #ecfdf5;
      border-color: #a7f3d0;
    }

    &--red {
      color: #991b1b;
      background-color: #fef2f2;
      border-color: #fecaca;
    }

    &--amber {
      color: #92400e;
      background-color: #fffbeb;
      border-color: #fde68a;
    }

    &--slate {
      color: #475569;
      background-color: #f8fafc;
      border-color: #e2e8f0;
    }

    &--blue {
      color: #1e40af;
      background-color: #eff6ff;
      border-color: #bfdbfe;
    }

    &--indigo {
      color: #3730a3;
      background-color: #eef2ff;
      border-color: #c7d2fe;
    }
  }

  // ── Latency badges ─────────────────────────────────────
  &__badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  // ── Nodes badge ────────────────────────────────────────
  &__nodes-badge {
    display: inline-block;
    padding: 0.125rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #1e40af;
    background-color: #eff6ff;
  }

  // ── Trend charts ───────────────────────────────────────
  &__trend-chart {
    height: 220px;
  }

  // ── Tables ─────────────────────────────────────────────
  &__table-wrap {
    overflow-x: auto;
  }

  &__table {
    border-collapse: separate;
    border-spacing: 0;

    th {
      padding: 0.625rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
    }

    td {
      padding: 0.75rem 1rem;
      font-size: 0.8125rem;
      border-bottom: 1px solid #f8fafc;
      white-space: nowrap;
    }

    tbody tr:hover {
      background-color: #f8fafc;
    }
  }

  // ── Status badge ───────────────────────────────────────
  &__status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;

    &--online {
      color: #16a34a;
      background-color: #f0fdf4;
    }

    &--warning {
      color: #d97706;
      background-color: #fffbeb;
    }

    &--offline {
      color: #dc2626;
      background-color: #fef2f2;
    }
  }

  // ── Usage bar ──────────────────────────────────────────
  &__usage-bar {
    flex: 1;
    height: 6px;
    background-color: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;
    min-width: 60px;
  }

  &__usage-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }
}

// ── Badge color variants (latency) ────────────────────
.badge--red {
  color: #991b1b;
  background-color: #fef2f2;
}

.badge--amber {
  color: #92400e;
  background-color: #fffbeb;
}

.badge--green {
  color: #065f46;
  background-color: #ecfdf5;
}
</style>
