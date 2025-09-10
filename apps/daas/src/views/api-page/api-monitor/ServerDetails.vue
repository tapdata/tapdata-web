<script setup lang="ts">
import {
  fetchApiServerWorker,
  fetchWorkerCall,
  fetchWorkerCallApiCalls,
  useRequest,
  type WorkerCallData,
} from '@tap/api'
import { VTable } from '@tap/component/src/base/v-table'
// @ts-ignore
import { Chart } from '@tap/component/src/chart'
import { calcUnit } from '@tap/shared'
import { computed, ref, watch } from 'vue'
import WorkerRpsChart from './WorkerRpsChart.vue'

// Types
interface WorkerData {
  oid: string
  name: string
  id: number
  pid: number
  workerStatus: string
  workerStartTime: number
  metricValues: {
    heapMemoryUsage: number
    cpuUsage: number
  }
  sort: number
}

interface ApiCallStats {
  apiPath: string
  callCount: number
  failureCount: number
  failureRate: number
}

// Props
interface Props {
  server: {
    processId: string
    name: string
  }
  workerData?: WorkerData[]
}

const props = withDefaults(defineProps<Props>(), {
  workerData: () => [],
})

const serverDetails = ref()

const { run: runFetchApiServerWorker, data: workerData } = useRequest(
  async () => {
    const data = await fetchApiServerWorker(props.server.processId)
    const { workers, ...rest } = data

    serverDetails.value = rest

    return workers.map((worker) => ({
      ...worker,
      metricValues: worker.metricValues
        ? {
            cpuUsage: worker.metricValues.cpuUsage
              ? `${Number(worker.metricValues.cpuUsage.toFixed(2))}%`
              : '--',
            heapMemoryUsage: worker.metricValues.heapMemoryUsage
              ? calcUnit(worker.metricValues.heapMemoryUsage, 'b')
              : '--',
          }
        : {
            cpuUsage: '--',
            heapMemoryUsage: '--',
          },
    }))
  },
  {
    manual: true,
    initialData: [],
    pollingInterval: 10000,
  },
)

const {
  run: runFetchWorkerCall,
  data: rpsData,
  loading: loadingWorkerCallData,
} = useRequest(
  async () => {
    const data = await fetchWorkerCall({
      processId: props.server.processId,
      from: 1757383200000,
      type: 0,
    })

    data.workerMetrics = data.workerMetrics.filter((item) =>
      Boolean(item.workerName),
    )
    return data.workerMetrics
  },
  {
    manual: true,
    initialData: [] as WorkerCallData['workerMetrics'],
  },
)

const {
  run: runFetchWorkerCallErrorRate,
  data: errorRateData,
  loading: loadingWorkerCallErrorRateData,
} = useRequest(
  async () => {
    const data = await fetchWorkerCall({
      processId: props.server.processId,
      from: 1757383200000,
      type: 2,
    })

    data.workerMetrics = data.workerMetrics.filter((item) =>
      Boolean(item.workerName),
    )
    return data.workerMetrics
  },
  {
    manual: true,
    initialData: [] as WorkerCallData['workerMetrics'],
    // pollingInterval: 60000,
  },
)

const {
  run: runFetchWorkerCallResponseTime,
  data: responseTimeData,
  loading: loadingWorkerCallResponseTimeData,
} = useRequest(
  async () => {
    const data = await fetchWorkerCall({
      processId: props.server.processId,
      // from: 1757383200000,
      type: 1,
    })

    data.workerMetrics = data.workerMetrics.filter((item) =>
      Boolean(item.workerName),
    )
    return data
  },
  {
    manual: true,
    initialData: [],
    // pollingInterval: 60000,
  },
)

const {
  run: runFetchWorkerCallApiCalls,
  data: apiCallsData,
  loading: loadingWorkerCallApiCallsData,
} = useRequest(
  async () => {
    const data = await fetchWorkerCallApiCalls(props.server.processId)
    return data.workerMetrics
  },
  {
    manual: true,
    initialData: [],
    // pollingInterval: 10000,
  },
)

const { run: runFetchData } = useRequest(
  () => {
    return Promise.all([
      runFetchWorkerCall(),
      runFetchWorkerCallErrorRate(),
      runFetchWorkerCallResponseTime(),
      runFetchWorkerCallApiCalls(),
    ])
  },
  {
    manual: true,
    pollingInterval: 60000,
  },
)

// Emits
const emit = defineEmits<{
  close: []
}>()

// Reactive data
const selectedWorker = ref<string>('')
const selectedWorkerId = ref<string>('')

// Computed
const workerList = computed(() => {
  return props.workerData.map((worker) => ({
    ...worker,
    statusText: worker.workerStatus === 'listening' ? 'listening' : 'stopped',
    statusClass:
      worker.workerStatus === 'listening'
        ? 'status-listening'
        : 'status-stopped',
  }))
})

const apiCallStats = computed<ApiCallStats[]>(() => {
  // Mock data for now - will be replaced with real API calls
  return [
    {
      apiPath: '/api/users',
      callCount: 1245,
      failureCount: 23,
      failureRate: 1.85,
    },
  ]
})

const apiList = computed(() => {
  return (
    apiCallsData.value.find((item) => item.workOid === selectedWorkerId.value)
      ?.workerMetric || []
  )
})

// Methods
const handleOpen = () => {
  runFetchApiServerWorker()
  runFetchData()
}

const handleClose = () => {
  emit('close')
}

const selectWorker = (worker: WorkerData) => {
  selectedWorker.value = worker.name
  selectedWorkerId.value = worker.oid
}

// Auto-select first worker when data is loaded
watch(
  () => workerData.value,
  (newWorkerData) => {
    if (newWorkerData && newWorkerData.length > 0 && !selectedWorker.value) {
      selectedWorker.value = newWorkerData[0].name
    }
  },
  { immediate: true },
)

const getLatencyChartOption = () => {
  return {
    title: {
      text: '请求延时分位数 (毫秒)',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    legend: {
      data: ['P50', 'P95', 'P99'],
      top: 30,
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'P50',
        data: [],
        type: 'line',
        smooth: true,
      },
      {
        name: 'P95',
        data: [],
        type: 'line',
        smooth: true,
      },
      {
        name: 'P99',
        data: [],
        type: 'line',
        smooth: true,
      },
    ],
  }
}

const getErrorRateChartOption = () => {
  return {
    title: {
      text: '错误率统计 (%)',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: 'line',
        smooth: true,
      },
    ],
  }
}

const apiStatsColumns = computed(() => [
  {
    label: 'API名称',
    prop: 'apiName',
  },
  {
    label: '调用次数',
    prop: 'count',
  },
  {
    label: '失败次数',
    prop: 'errorCount',
  },
])

// Helper function to get failure rate with proper typing
const getFailureRate = (row: any): number => {
  return row?.failureRate || 0
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`${server.name} - 服务器详细监控信息`"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="server-details-container">
      <!-- Worker List Section -->
      <section class="worker-list-section mb-3">
        <el-scrollbar>
          <div class="worker-cards flex align-center gap-4 pb-3">
            <div
              v-for="worker in workerData"
              :key="worker.oid"
              class="worker-card flex-shrink-0 p-3 rounded-xl"
              :class="{
                active: worker.name && selectedWorker === worker.name,
                'is-disabled': !worker.name,
              }"
              @click="worker.name && selectWorker(worker)"
            >
              <div class="worker-header flex align-center gap-2 mb-3">
                <div
                  class="rounded-pill w-2 h-2"
                  :class="`${worker.workerStatus !== 'listening' ? 'bg-red-500' : 'bg-green-500'}`"
                />
                <span class="worker-name">{{ worker.name || '-' }}</span>
              </div>
              <div
                class="worker-metrics flex align-center gap-4 justify-between"
              >
                <div class="metric-item flex align-center gap-1">
                  <el-icon size="12" class="color-primary"
                    ><i-lucide:cpu
                  /></el-icon>
                  <span class="metric-label text-gray-500"> CPU:</span>
                  <span class="metric-value">{{
                    worker.metricValues.cpuUsage
                  }}</span>
                </div>
                <div class="metric-item flex align-center gap-1">
                  <el-icon size="12" class="color-primary"
                    ><i-lucide:memory-stick
                  /></el-icon>
                  <span class="metric-label text-gray-500">内存:</span>
                  <span class="metric-value">{{
                    worker.metricValues.heapMemoryUsage
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </section>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- RPS Monitoring Chart -->
        <section class="chart-section rounded-xl">
          <div class="chart-container">
            <h4 class="chart-title mb-4">RPS监控</h4>
            <WorkerRpsChart
              :worker-metrics="rpsData"
              :selected-worker="selectedWorker"
              :height="280"
              @worker-select="selectWorker"
            />
          </div>
        </section>

        <!-- Request Latency Chart -->
        <section class="chart-section rounded-xl">
          <div class="chart-container">
            <Chart type="line" :extend="getLatencyChartOption()" />
          </div>
        </section>

        <!-- Error Rate Chart -->
        <section class="chart-section rounded-xl">
          <div class="chart-container">
            <h4 class="chart-title mb-4">错误率统计</h4>
            <WorkerRpsChart
              :worker-metrics="errorRateData"
              :selected-worker="selectedWorker"
              :height="280"
              @worker-select="selectWorker"
            />
          </div>
        </section>

        <!-- API Call Statistics Table -->
        <section class="chart-section rounded-xl">
          <div class="chart-container">
            <h4 class="chart-title mb-4">API调用统计</h4>
            <VTable
              :data="apiList"
              :columns="apiStatsColumns"
              :has-pagination="false"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template> -->
  </el-dialog>
</template>

<style lang="scss" scoped>
.server-details-container {
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.worker-list-section {
  .worker-cards {
  }

  .worker-card {
    border: 1px solid var(--el-border-color);
    min-width: 200px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(.is-disabled) {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .worker-header {
      .worker-name {
        font-weight: 600;
        color: var(--text-dark);
      }

      .worker-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.status-listening {
          background-color: #f0f9ff;
          color: #0369a1;
        }

        &.status-stopped {
          background-color: #fef2f2;
          color: #dc2626;
        }
      }
    }

    .worker-metrics {
      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .metric-value {
          font-weight: 500;
          color: var(--text-dark);
        }
      }
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;

  .chart-section {
    background: white;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 16px;

    .chart-container {
      height: 100%;
      display: flex;
      flex-direction: column;

      .chart-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-dark);
        margin: 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.failure-rate {
  font-weight: 500;

  &.text-red-500 {
    color: #ef4444;
  }
}

// Responsive design
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: auto;
  }
}

@media (max-width: 768px) {
  .worker-cards {
    flex-direction: column;
  }

  .worker-card {
    min-width: auto;
  }
}
</style>
