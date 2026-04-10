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
import { getProcessInfo } from '@tap/api/src/core/workers'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import Chart from '@tap/component/src/chart/Chart.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { STATUS_MAP as DASHBOARD_STATUS_MAP } from './const'

const router = useRouter()

// ── State ──────────────────────────────────────────────
const loading = ref(false)
const lastUpdated = ref('Just now')
const dashboardData = ref<TaskDashboardVo | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// API Requests card time range
const apiTimeRange = ref<'5m' | '1h' | '24h'>('1h')

// System Trends time range
const trendsTimeRange = ref<'5min' | '1h' | '24h'>('24h')

// Top Tasks state
const topTaskTab = ref<'lagging' | 'throughput'>('lagging')
const topTaskLimit = ref<5 | 10 | 20>(5)

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

function formatNumber(n: number): string {
  if (!n && n !== 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return n.toLocaleString()
  return String(n)
}

// ── KPI: Connected DBs ────────────────────────────────
const connectedDbs = computed(() => dashboardData.value?.summary?.connectedDbs)

// ── KPI: API Requests ──────────────────────────────────
const apiRequests = computed(() => dashboardData.value?.summary?.apiRequests)

// ── System Trends: ECharts options ─────────────────────
const throughputChartOption = computed(() => {
  const trends = dashboardData.value?.trends?.throughput
  if (!trends?.ts?.length) return buildAreaChartOption([], [], '#6366f1')
  const xData = trends.ts.map((t) => formatTimeLabel(t))
  return buildAreaChartOption(xData, trends.values, '#6366f1')
})

const apiChartOption = computed(() => {
  const trends = dashboardData.value?.trends?.apiRequests
  if (!trends?.ts?.length) return buildLineChartOption([], [], '#a855f7')
  const xData = trends.ts.map((t) => formatTimeLabel(t))
  return buildLineChartOption(xData, trends.values, '#a855f7')
})

function formatTimeLabel(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
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

// ── Data fetching ──────────────────────────────────────
async function fetchDashboardData() {
  loading.value = true
  try {
    const [dashboard, clusterData] = await Promise.all([
      fetchTaskDashboard({
        type:
          trendsTimeRange.value === '5min'
            ? 'minute'
            : trendsTimeRange.value === '1h'
              ? 'hours'
              : 'days',
        top: topTaskLimit.value,
      }).catch(() => null),
      fetchClusterStates({ type: 'dashboard' }).catch(() => ({ items: [] })),
    ])

    if (dashboard) dashboardData.value = dashboard

    // Process cluster data
    const processIdSet = new Set<string>()
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
        processIdSet.add(node.systemInfo.process_id)
      }
      return node
    })
    agentNodes.value = items

    if (processIdSet.size > 0) {
      try {
        const processData = await getProcessInfo(Array.from(processIdSet))
        for (const id of Object.keys(processData)) {
          agentRunningTask.value[id] = (processData as any)[id].runningTaskNum
        }
      } catch {
        /* ignore */
      }
    }

    lastUpdated.value = new Date().toLocaleTimeString()
  } finally {
    loading.value = false
  }
}

function onTrendsTimeChange(range: '5min' | '1h' | '24h') {
  trendsTimeRange.value = range
  fetchDashboardData()
}

// ── Navigation ─────────────────────────────────────────
function navigateToCluster() {
  router.push({ name: 'clusterManagement' })
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  fetchDashboardData()
  refreshTimer = setInterval(fetchDashboardData, 60_000)
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
              <span class="fs-7 text-secondary fw-sub">Active Tasks</span>
              <div class="p-2 bg-gray-50 rounded-lg">
                <el-icon size="20" class="text-blue-500 align-top">
                  <i-lucide-activity />
                </el-icon>
              </div>
            </div>
            <div class="din-font fs-2 font-semibold lh-1 mb-4">
              {{ formatNumber(activeTasks?.total ?? 0) }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="dashboard__tag dashboard__tag--emerald"
                >Running {{ activeTasks?.running ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--red"
                >Error {{ activeTasks?.error ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--slate"
                >Max Lag {{ formatLag(activeTasks?.maxLag ?? 0) }}</span
              >
              <span class="dashboard__tag dashboard__tag--slate"
                >Min Lag {{ formatLag(activeTasks?.minLag ?? 0) }}</span
              >
            </div>
          </div>

          <!-- 2) Total Throughput -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <span class="fs-7 text-secondary fw-sub">Total Throughput</span>
              <div class="p-2 bg-gray-50 rounded-lg">
                <el-icon class="text-indigo-500 align-top" size="20">
                  <i-lucide-trending-up />
                </el-icon>
              </div>
            </div>
            <div class="din-font lh-1 mb-1">
              <span class="fs-2 font-semibold">{{
                formatNumber(throughput?.current ?? 0)
              }}</span>
              <span class="fs-7 text-secondary ml-1">events/sec</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span class="dashboard__tag dashboard__tag--amber"
                >Peak {{ formatNumber(throughput?.peak ?? 0) }}</span
              >
              <span class="dashboard__tag dashboard__tag--indigo"
                >Data {{ throughput?.dataRate ?? 0 }} MB/s</span
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
              }}{{ throughput.changeRate }}% vs last hour
            </p>
          </div>

          <!-- 3) Connected DBs -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <span class="fs-7 text-secondary fw-sub">Connected DBs</span>
              <div class="p-2 bg-gray-50 rounded-lg">
                <el-icon class="text-teal-500 align-top" size="20">
                  <i-lucide-database />
                </el-icon>
              </div>
            </div>
            <div class="din-font lh-1 mb-1">
              <span class="fs-2 font-semibold">{{
                connectedDbs?.total ?? 0
              }}</span>
              <span class="fs-7 text-secondary ml-1">sources</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="db in (connectedDbs?.items || []).slice(0, 3)"
                :key="db.id"
                class="dashboard__tag dashboard__tag--blue"
                >{{ db.name }} {{ db.tableCount }} tbls</span
              >
            </div>
          </div>

          <!-- 4) API Requests -->
          <div class="dashboard__card p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <div class="flex align-items-center gap-2">
                <span class="fs-7 text-secondary fw-sub">API Requests</span>
                <div class="dashboard__time-switcher">
                  <button
                    v-for="r in ['5m', '1h', '24h'] as const"
                    :key="r"
                    :class="{ active: apiTimeRange === r }"
                    @click="apiTimeRange = r"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>
              <div class="p-2 bg-gray-50 rounded-lg">
                <el-icon class="text-purple-500 align-top" size="20">
                  <i-lucide-server />
                </el-icon>
              </div>
            </div>
            <div class="din-font fs-2 font-semibold lh-1 mb-4">
              {{ formatNumber(apiRequests?.total ?? 0) }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="dashboard__tag dashboard__tag--red"
                >Failed {{ apiRequests?.failed ?? 0 }}</span
              >
              <span class="dashboard__tag dashboard__tag--amber"
                >Rate {{ apiRequests?.errorRate ?? 0 }}%</span
              >
              <span class="dashboard__tag dashboard__tag--indigo"
                >Avg Time {{ apiRequests?.avgTime ?? 0 }}ms</span
              >
            </div>
          </div>
        </div>

        <!-- ═══ System Trends ═══ -->
        <div class="dashboard__card p-5 mb-6">
          <div class="flex justify-content-between align-items-center mb-5">
            <h2 class="fs-5 font-semibold m-0">System Trends</h2>
            <div class="dashboard__time-switcher">
              <button
                v-for="r in ['5min', '1h', '24h'] as const"
                :key="r"
                :class="{ active: trendsTimeRange === r }"
                @click="onTrendsTimeChange(r)"
              >
                {{ r }}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="fs-7 text-secondary mb-3 mt-0">
                Throughput (events/sec)
              </p>
              <div class="dashboard__trend-chart">
                <Chart type="line" :extend="throughputChartOption" />
              </div>
            </div>
            <div>
              <p class="fs-7 text-secondary mb-3 mt-0">
                API Requests (req/sec)
              </p>
              <div class="dashboard__trend-chart">
                <Chart type="line" :extend="apiChartOption" />
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Top Tasks ═══ -->
        <div class="dashboard__card p-5 mb-6">
          <div class="flex justify-content-between align-items-center mb-4">
            <div class="flex align-items-center gap-3">
              <h2 class="fs-5 font-semibold m-0">Top Tasks</h2>
              <div class="dashboard__tab-switcher">
                <button
                  :class="{ active: topTaskTab === 'lagging' }"
                  @click="topTaskTab = 'lagging'"
                >
                  Most Lagging
                </button>
                <button
                  :class="{ active: topTaskTab === 'throughput' }"
                  @click="topTaskTab = 'throughput'"
                >
                  Highest Throughput
                </button>
              </div>
            </div>
            <div class="dashboard__time-switcher">
              <button
                v-for="n in [5, 10, 20] as const"
                :key="n"
                :class="{ active: topTaskLimit === n }"
                @click="topTaskLimit = n"
              >
                Top {{ n }}
              </button>
            </div>
          </div>

          <div v-if="topTasks.length" class="dashboard__table-wrap">
            <table class="dashboard__table w-100">
              <thead>
                <tr>
                  <th class="text-start">#</th>
                  <th class="text-start">Task Name</th>
                  <th class="text-end">Latency</th>
                  <th class="text-end">Throughput</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, idx) in topTasks" :key="task.taskId">
                  <td class="text-secondary">{{ idx + 1 }}</td>
                  <td class="font-semibold">{{ task.taskName }}</td>
                  <td class="text-end">
                    <span
                      class="dashboard__badge"
                      :class="latencyClass(task.latency ?? 0)"
                      >{{ formatLatency(task.latency ?? 0) }}</span
                    >
                  </td>
                  <td class="text-end font-mono">
                    {{ formatThroughput(task.throughput ?? 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <el-empty v-else description="No task data" :image-size="60" />
        </div>

        <!-- ═══ Agent Cluster Status ═══ -->
        <div class="dashboard__card p-5">
          <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="fs-5 font-semibold m-0">Agent Cluster Status</h2>
            <span class="dashboard__nodes-badge"
              >{{ agentNodes.length }} Nodes Total</span
            >
          </div>

          <div v-if="agentNodes.length" class="dashboard__table-wrap">
            <table class="dashboard__table w-100">
              <thead>
                <tr>
                  <th class="text-start">Agent Name</th>
                  <th class="text-start">Status</th>
                  <th class="text-start">CPU Usage</th>
                  <th class="text-start">Memory Usage</th>
                  <th class="text-end">Running Tasks</th>
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
          <el-empty v-else description="No agents found" :image-size="60" />
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

  // ── Time / Tab switcher ────────────────────────────────
  &__time-switcher,
  &__tab-switcher {
    display: inline-flex;
    background-color: #f1f5f9;
    border-radius: 0.375rem;
    padding: 2px;

    button {
      padding: 0.125rem 0.5rem;
      border: none;
      background: none;
      border-radius: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        background-color: #fff;
        color: #0f172a;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }

      &:hover:not(.active) {
        color: #334155;
      }
    }
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
