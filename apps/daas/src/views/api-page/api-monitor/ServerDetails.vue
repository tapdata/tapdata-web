<script setup lang="ts">
import {
  fetchApiServerWorker,
  fetchWorkerCall,
  fetchWorkerCallApiCalls,
  useRequest,
  type WorkerCallData,
} from '@tap/api'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { VTable } from '@tap/component/src/base/v-table'
import SelectList from '@tap/component/src/filter-bar/FilterItemSelect.vue'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { computed, nextTick, ref } from 'vue'
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

// interface ApiCallStats {
//   apiPath: string
//   callCount: number
//   failureCount: number
//   failureRate: number
// }

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

const { t } = useI18n()

const getGranularity = () => {
  if (time.value <= 60) {
    return 0
  } else if (time.value <= 1440) {
    return 1
  } else if (time.value <= 10080) {
    return 2
  } else if (time.value <= 43200) {
    return 2
  } else {
    return 4
  }
}

const serverDetails = ref()
const time = ref(10)
const granularity = ref(getGranularity())
const timeList = ref([
  { label: t('api_monitor_server_recent_10_minutes'), value: 10 },
  { label: t('api_monitor_server_recent_30_minutes'), value: 30 },
  { label: t('api_monitor_server_recent_1_hour'), value: 60 },
  { label: t('api_monitor_server_recent_1_day'), value: 1440 },
  { label: t('api_monitor_server_recent_1_week'), value: 10080 },
  { label: t('api_monitor_server_recent_1_month'), value: 43200 },
])

const {
  run: runFetchApiServerWorker,
  cancel: cancelFetchApiServerWorker,
  data: workerData,
} = useRequest(
  async () => {
    const data = await fetchApiServerWorker(props.server.processId)
    const { workers, ...rest } = data

    serverDetails.value = rest

    if (workers && workers.length > 0 && !selectedWorker.value) {
      selectedWorker.value = workers[0]?.name || ''
    }

    setTimeout(() => {
      triggerScrollCheck()
    }, 0)

    return workers.map((worker) => ({
      ...worker,
      pingWarning:
        Date.now() - worker.pingTime > 10000
          ? dayjs(worker.pingTime).fromNow(true)
          : '',
      metricValues:
        worker.metricValues && worker.workerStatus === 'listening'
          ? {
              cpuUsage:
                worker.metricValues.cpuUsage != null
                  ? `${Number(worker.metricValues.cpuUsage.toFixed(2))}%`
                  : '--',
              heapMemoryUsage:
                worker.metricValues.heapMemoryUsage != null
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

const { run: runFetchWorkerCall, data: rpsData } = useRequest(
  async () => {
    const data = await fetchWorkerCall({
      processId: props.server.processId,
      ...getTimeRange(),
      granularity: granularity.value,
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

const { run: runFetchWorkerCallErrorRate, data: errorRateData } = useRequest(
  async () => {
    const data = await fetchWorkerCall({
      processId: props.server.processId,
      ...getTimeRange(),
      granularity: granularity.value,
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
  },
)

const { run: runFetchWorkerCallResponseTime, data: responseTimeData } =
  useRequest(
    async () => {
      const data = await fetchWorkerCall({
        processId: props.server.processId,
        ...getTimeRange(),
        granularity: granularity.value,
        type: 1,
      })

      data.workerMetrics = data.workerMetrics.filter((item) =>
        Boolean(item.workerName),
      )
      // console.log(data.workerMetrics)
      return data.workerMetrics
    },
    {
      manual: true,
      initialData: [],
    },
  )

const { run: runFetchWorkerCallApiCalls, data: apiCallsData } = useRequest(
  async () => {
    const data = await fetchWorkerCallApiCalls(props.server.processId)
    return data.workerMetrics.map((item) => {
      item.workerMetric.map((item) => {
        item.failureRate = `${+((item.errorCount / item.count) * 100).toFixed(2)}%`
        return item
      })
      return item
    })
  },
  {
    manual: true,
    initialData: [],
  },
)

const { run: runFetchData, cancel: cancelFetchData } = useRequest(
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

// Reactive data
const selectedWorker = ref<string>('')
const workerScrollbar = ref()
const workerCardsContainer = ref()

const apiList = computed(() => {
  return (
    apiCallsData.value?.find((item) => item.workerName === selectedWorker.value)
      ?.workerMetric || []
  )
})

// Convert RPS data to chartData format
const rpsChartData = computed(() => {
  if (!rpsData.value || rpsData.value.length === 0) {
    return { x: [], series: [] }
  }

  // Collect all unique time points from all workers
  const allTimePoints = new Set<number>()
  rpsData.value.forEach((worker) => {
    if (worker.workerMetric?.time) {
      worker.workerMetric.time.forEach((timestamp) => {
        allTimePoints.add(timestamp)
      })
    }
  })

  if (allTimePoints.size === 0) {
    return { x: [], series: [] }
  }

  // Sort time points and limit by granularity (default 5 points for minutes)
  const displayTimePoints = Array.from(allTimePoints).sort((a, b) => a - b)

  // Format time labels for category axis
  const formattedTimeLabels = displayTimePoints.map((timestamp) => {
    return formatTimeLabel(timestamp, granularity.value)
  })

  // Create a map for quick time lookup
  const timeIndexMap = new Map<number, number>()
  displayTimePoints.forEach((timestamp, index) => {
    timeIndexMap.set(timestamp, index)
  })

  // Process all workers' data with aligned time points
  const series = rpsData.value.map((worker) => {
    const workerTime = worker.workerMetric?.time || []
    const workerRps = worker.workerMetric?.rps || []

    // Create aligned data array for category axis
    const alignedData: (number | null)[] = Array.from(
      { length: displayTimePoints.length },
      () => null,
    )

    workerTime.forEach((timestamp, index) => {
      const timeIndex = timeIndexMap.get(timestamp)
      if (timeIndex !== undefined && index < workerRps.length) {
        const rpsValue = workerRps[index]
        alignedData[timeIndex] =
          rpsValue === null ? null : +(rpsValue?.toFixed(2) || 0)
      }
    })

    return {
      name: worker.workerName,
      data: alignedData,
    }
  })

  return {
    x: formattedTimeLabels,
    series,
  }
})

// Convert Error Rate data to chartData format
const errorRateChartData = computed(() => {
  if (!errorRateData.value || errorRateData.value.length === 0) {
    return { x: [], series: [] }
  }

  // Collect all unique time points from all workers
  const allTimePoints = new Set<number>()
  errorRateData.value.forEach((worker) => {
    if (worker.workerMetric?.time) {
      worker.workerMetric.time.forEach((timestamp) => {
        allTimePoints.add(timestamp)
      })
    }
  })

  if (allTimePoints.size === 0) {
    return { x: [], series: [] }
  }

  // Sort time points and limit by granularity
  const displayTimePoints = Array.from(allTimePoints).sort((a, b) => a - b)

  // Format time labels for category axis
  const formattedTimeLabels = displayTimePoints.map((timestamp) => {
    return formatTimeLabel(timestamp, granularity.value)
  })

  // Create a map for quick time lookup
  const timeIndexMap = new Map<number, number>()
  displayTimePoints.forEach((timestamp, index) => {
    timeIndexMap.set(timestamp, index)
  })

  // Process all workers' data with aligned time points
  const series = errorRateData.value.map((worker) => {
    const workerTime = worker.workerMetric?.time || []
    const workerErrorRate = worker.workerMetric?.errorRate || [] // Note: errorRate instead of rps

    // Create aligned data array for category axis
    const alignedData: (number | null)[] = Array.from(
      { length: displayTimePoints.length },
      () => null,
    )

    workerTime.forEach((timestamp, index) => {
      const timeIndex = timeIndexMap.get(timestamp)
      if (timeIndex !== undefined && index < workerErrorRate.length) {
        const errorRateValue = workerErrorRate[index]
        alignedData[timeIndex] =
          errorRateValue === null ? null : +(errorRateValue?.toFixed(2) || 0)
      }
    })

    return {
      name: worker.workerName,
      data: alignedData,
    }
  })

  return {
    x: formattedTimeLabels,
    series,
  }
})

// Convert Response Time data to chartData format (special handling for selected worker only)
const responseTimeChartData = computed(() => {
  if (
    !responseTimeData.value ||
    responseTimeData.value.length === 0 ||
    !selectedWorker.value
  ) {
    return { x: [], series: [] }
  }

  // Find the selected worker's data
  const selectedWorkerData = responseTimeData.value.find(
    (worker) => worker.workerName === selectedWorker.value,
  )

  if (!selectedWorkerData?.workerMetric?.time) {
    return { x: [], series: [] }
  }

  const workerTime = selectedWorkerData.workerMetric.time
  const p50Data = selectedWorkerData.workerMetric.p50 || []
  const p95Data = selectedWorkerData.workerMetric.p95 || []
  const p99Data = selectedWorkerData.workerMetric.p99 || []

  // Sort time points and limit by granularity
  const displayTimePoints = Array.from(workerTime).sort(
    (a: number, b: number) => a - b,
  )

  // Format time labels for category axis
  const formattedTimeLabels = displayTimePoints.map((timestamp) => {
    return formatTimeLabel(timestamp, granularity.value)
  })

  // Create a map for quick time lookup
  const timeIndexMap = new Map<number, number>()
  displayTimePoints.forEach((timestamp, index) => {
    timeIndexMap.set(timestamp, index)
  })

  // Process percentile data for the selected worker
  const series = [
    {
      name: 'P50',
      data: Array.from({ length: displayTimePoints.length }, () => null) as (
        | number
        | null
      )[],
    },
    {
      name: 'P95',
      data: Array.from({ length: displayTimePoints.length }, () => null) as (
        | number
        | null
      )[],
      color: '#FF9800',
    },
    {
      name: 'P99',
      data: Array.from({ length: displayTimePoints.length }, () => null) as (
        | number
        | null
      )[],
      color: '#F44336',
    },
  ]

  // Fill data for each percentile
  workerTime.forEach((timestamp, index) => {
    const timeIndex = timeIndexMap.get(timestamp)
    if (timeIndex !== undefined) {
      if (index < p50Data.length) {
        series[0].data[timeIndex] =
          p50Data[index] === null ? null : +(p50Data[index]?.toFixed(2) || 0)
      }
      if (index < p95Data.length) {
        series[1].data[timeIndex] =
          p95Data[index] === null ? null : +(p95Data[index]?.toFixed(2) || 0)
      }
      if (index < p99Data.length) {
        series[2].data[timeIndex] =
          p99Data[index] === null ? null : +(p99Data[index]?.toFixed(2) || 0)
      }
    }
  })

  return {
    x: formattedTimeLabels,
    series,
  }
})

// Methods
const handleOpen = () => {
  selectedWorker.value = ''
  runFetchApiServerWorker()
  runFetchData()
}

const triggerScrollCheck = () => {
  nextTick(() => {
    handleScroll()
  })
}

const handleClose = () => {
  cancelFetchApiServerWorker()
  cancelFetchData()
}

const selectWorker = (worker: string, event: MouseEvent) => {
  selectedWorker.value = worker

  // 让点击的worker卡片在滚动容器中可见
  if (workerScrollbar.value && event.currentTarget) {
    const scrollContainer = workerScrollbar.value.$el.querySelector(
      '.el-scrollbar__wrap',
    )
    const targetElement = event.currentTarget as HTMLElement

    if (scrollContainer && targetElement) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()

      // 计算目标元素相对于容器的位置
      const targetLeft =
        targetRect.left - containerRect.left + scrollContainer.scrollLeft
      const targetRight = targetLeft + targetRect.width
      const containerWidth = containerRect.width

      // 如果目标元素不在可见区域内，则滚动到合适位置
      if (targetLeft < scrollContainer.scrollLeft) {
        // 目标元素在左侧，滚动到左侧
        scrollContainer.scrollTo({
          left: targetLeft - 24, // 留一些边距
          behavior: 'smooth',
        })
      } else if (targetRight > scrollContainer.scrollLeft + containerWidth) {
        // 目标元素在右侧，滚动到右侧
        scrollContainer.scrollTo({
          left: targetRight - containerWidth + 24, // 留一些边距
          behavior: 'smooth',
        })
      }
    }
  }
}

const apiStatsColumns = computed(() => [
  {
    label: t('api_monitor_server_api_name'),
    prop: 'apiName',
  },
  {
    label: t('api_monitor_server_call_count'),
    prop: 'count',
  },
  {
    label: t('api_monitor_server_failure_count'),
    slotName: 'errorCount',
    prop: 'errorCount',
  },
  {
    label: t('api_monitor_server_failure_rate'),
    prop: 'failureRate',
  },
])

const handleTimeChange = () => {
  granularity.value = getGranularity()
  runFetchData()
}

// Handle mouse wheel scroll for horizontal scrolling
const handleWheelScroll = (event: WheelEvent) => {
  if (workerScrollbar.value) {
    const scrollbar = workerScrollbar.value
    const scrollContainer = scrollbar.$el.querySelector('.el-scrollbar__wrap')

    if (scrollContainer) {
      // 检查是否是原生横向滚动
      // 只有当 deltaX 明显大于 deltaY 时才认为是横向滚动
      // 或者明确按住了 Shift 键
      const isHorizontalScroll =
        event.shiftKey ||
        (Math.abs(event.deltaX) > Math.abs(event.deltaY) &&
          Math.abs(event.deltaX) > 0)

      if (isHorizontalScroll) {
        // 原生横向滚动，保持默认行为
        return
      }

      // 垂直滚动转换为横向滚动
      event.preventDefault()

      // 获取当前滚动位置
      const currentScrollLeft = scrollContainer.scrollLeft
      // 计算滚动距离（可以根据需要调整滚动速度）
      const scrollDelta = event.deltaY

      // 执行横向滚动
      scrollContainer.scrollTo({
        left: currentScrollLeft + scrollDelta,
      })
    }
  }
}

const handleScroll = () => {
  if (workerScrollbar.value) {
    const scrollbar = workerScrollbar.value
    const scrollContainer = scrollbar.$el.querySelector('.el-scrollbar__wrap')

    if (scrollContainer) {
      const currentScrollLeft = scrollContainer.scrollLeft
      if (currentScrollLeft > 0) {
        scrollbar.$el.classList.add('ring-left')
      } else {
        scrollbar.$el.classList.remove('ring-left')
      }
      const containerWidth = scrollContainer.clientWidth
      if (currentScrollLeft + containerWidth < scrollContainer.scrollWidth) {
        scrollbar.$el.classList.add('ring-right')
      } else {
        scrollbar.$el.classList.remove('ring-right')
      }
    }
  }
}

const getTimeRange = () => {
  return {
    from: Date.now() - time.value * 60 * 1000,
    to: Date.now() - 60 * 1000,
  }
}

// Format time labels based on granularity
const formatTimeLabel = (timestamp: number, granularity: number): string => {
  const date = new Date(timestamp)

  switch (granularity) {
    case 0: // 分钟
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    case 1: // 小时
      return `${date.getHours().toString().padStart(2, '0')}:00`
    case 2: // 天
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    case 3: // 周
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    case 4: // 月
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    default:
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

const percentFormatter = (value: number) => {
  return value != null ? `${value}%` : '-'
}

const msFormatter = (value: number) => {
  return value != null ? `${value}ms` : '-'
}
</script>

<template>
  <el-dialog
    width="90%"
    top="6vh"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #header="{ titleClass }">
      <div class="flex align-center gap-2">
        <span :class="titleClass">{{ server.name }}</span>
        <el-divider direction="vertical" />
        <SelectList
          v-model="time"
          :items="timeList"
          :label="$t('api_monitor_detail_monitoring_period')"
          @change="handleTimeChange"
        />
      </div>
    </template>
    <div class="server-details-container">
      <!-- Worker List Section -->
      <section class="worker-list-section mb-2">
        <el-scrollbar
          ref="workerScrollbar"
          class="worker-scrollbar"
          @wheel="handleWheelScroll"
          @scroll="handleScroll"
        >
          <div
            ref="workerCardsContainer"
            class="worker-cards flex align-center gap-4 py-3"
          >
            <div
              v-for="worker in workerData"
              :key="worker.oid"
              class="worker-card flex-shrink-0 p-3 rounded-xl"
              :class="{
                active: worker.name && selectedWorker === worker.name,
                'is-disabled': !worker.name,
              }"
              @click="worker.name && selectWorker(worker.name, $event)"
            >
              <div class="worker-header flex align-center gap-2 mb-3">
                <el-tooltip
                  v-if="worker.pingWarning"
                  :content="
                    $t('api_monitor_server_ping_warning', {
                      val: worker.pingWarning,
                    })
                  "
                  placement="bottom"
                >
                  <el-icon class="color-warning"
                    ><i-lucide:triangle-alert
                  /></el-icon>
                </el-tooltip>
                <div
                  v-else
                  class="rounded-pill w-2 h-2"
                  :class="`${worker.workerStatus !== 'listening' ? 'bg-red-500' : 'bg-green-500'}`"
                />
                <span class="worker-name">{{ worker.name || '-' }}</span>
                <span
                  v-if="worker.pid && worker.workerStatus === 'listening'"
                  class="font-mono text-gray-700 lh-4 border rounded-4 px-1.5 fs-8"
                  >{{ worker.pid }}</span
                >
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
                  <span class="metric-label text-gray-500"
                    >{{ $t('api_monitor_memory') }}:</span
                  >
                  <span class="metric-value">{{
                    worker.metricValues.heapMemoryUsage
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </section>

      <div class="bg-light rounded-xl p-4">
        <div class="charts-grid">
          <!-- RPS Monitoring Chart -->
          <section class="chart-section rounded-xl">
            <div class="chart-container">
              <h4 class="chart-title mb-4 fs-6 flex align-center gap-2">
                <el-icon size="20" class="color-primary">
                  <i-lucide:activity />
                </el-icon>
                {{ $t('api_monitor_server_rps_title') }} ({{
                  $t('api_monitor_server_rps_title_unit')
                }})
              </h4>
              <WorkerRpsChart
                :chart-data="rpsChartData"
                :selected-worker="selectedWorker"
                :height="280"
                :granularity="granularity"
              />
            </div>
          </section>

          <!-- Error Rate Chart -->
          <section class="chart-section rounded-xl">
            <div class="chart-container">
              <h4 class="chart-title mb-4 fs-6 flex align-center gap-2">
                <el-icon size="20" class="color-primary">
                  <i-lucide:clock />
                </el-icon>
                {{ $t('api_monitor_server_error_rate_title') }} (%)
              </h4>
              <WorkerRpsChart
                :chart-data="errorRateChartData"
                :selected-worker="selectedWorker"
                :height="280"
                y-axis-formatter="{value}%"
                :tooltip-value-formatter="percentFormatter"
              />
            </div>
          </section>

          <!-- Request Latency Chart -->
          <section class="chart-section rounded-xl">
            <div class="chart-container">
              <h4 class="chart-title mb-4 fs-6 flex align-center gap-2">
                <el-icon size="20" class="color-primary">
                  <i-lucide:triangle-alert />
                </el-icon>
                {{ selectedWorker }} -
                {{ $t('api_monitor_server_response_time_title') }} ({{
                  $t('public_unit_ms')
                }})
              </h4>
              <WorkerRpsChart
                :chart-data="responseTimeChartData"
                :selected-worker="selectedWorker"
                :height="280"
                :tooltip-value-formatter="msFormatter"
                y-axis-formatter="{value}ms"
                legend
              />
            </div>
          </section>

          <!-- API Call Statistics Table -->
          <section class="chart-section rounded-xl">
            <div class="chart-container">
              <h4 class="chart-title mb-4 fs-6 flex align-center gap-2">
                <el-icon size="20" class="color-primary">
                  <i-lucide:chart-column />
                </el-icon>
                {{ selectedWorker }} -
                {{ $t('api_monitor_server_api_calls_title') }}
              </h4>
              <VTable
                :data="apiList"
                :columns="apiStatsColumns"
                :has-pagination="false"
              >
                <template #empty>
                  <el-empty :image-size="100" class="py-4" />
                </template>
                <template #errorCount="{ row }">
                  <span
                    :class="
                      (row as any).errorCount > 0
                        ? 'color-danger'
                        : 'text-gray-500'
                    "
                  >
                    {{ (row as any).errorCount }}
                  </span>
                </template>
              </VTable>
            </div>
          </section>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
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
  gap: 20px;

  .chart-section {
    background: white;
    // border: 1px solid var(--el-border-color-lighter);
    border: 1px solid var(--el-border-color-extra-light);
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

.worker-scrollbar {
  &::before,
  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 32px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s;
    content: '';
    pointer-events: none;
  }
  &::before {
    left: 0;
    box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.08);
  }
  &::after {
    right: 0;
    box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, 0.08);
  }

  &.ring-left::before {
    opacity: 1;
  }

  &.ring-right::after {
    opacity: 1;
  }
}
</style>
