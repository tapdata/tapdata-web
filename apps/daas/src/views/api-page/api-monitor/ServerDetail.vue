<script setup lang="ts">
import {
  fetchMonitorServerApi,
  fetchMonitorServerChart,
  fetchMonitorServerDetail,
  fetchMonitorServerWorker,
  type ServerChart,
  type ServerDetail,
  type ServerWorker,
} from '@tap/api/src/core/monitor-server'
import { useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { calcTimeUnit } from '@tap/shared'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { isNumber } from 'lodash-es'
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { useRoute, useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

const route = useRoute()
const router = useRouter()
const serverId = route.params.id as string
const serverDetail = ref<ServerDetail>()
const serverChart = ref<ServerChart>()
const apiList = ref<any>()
const workerData = ref<ServerWorker>()

// 时间周期选择
const timeRange = ref('1h')
const customTimeRange = ref<[Date, Date] | null>(null)
const customTimePickerVisible = ref(false)

const timeRangeOptions = [
  { label: '最近5分钟', value: '5m' },
  { label: '最近15分钟', value: '15m' },
  { label: '最近1小时', value: '1h' },
  { label: '最近6小时', value: '6h' },
  { label: '最近12小时', value: '12h' },
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近14天', value: '14d' },
  { label: '最近30天', value: '30d' },
  { label: '自定义时间', value: 'custom' },
]

const serverName = computed(
  () => route.query.name || serverDetail.value?.serverName,
)

const getActualTimeRange = () => {
  if (timeRange.value === 'custom' && customTimeRange.value) {
    return {
      startAt: dayjs(customTimeRange.value[0]).unix(),
      endAt: dayjs(customTimeRange.value[1]).unix(),
    }
  }

  const now = dayjs()
  const rangeMap: Record<string, number> = {
    '5m': 5 * 60,
    '15m': 15 * 60,
    '1h': 60 * 60,
    '6h': 6 * 60 * 60,
    '12h': 12 * 60 * 60,
    '24h': 24 * 60 * 60,
    '7d': 7 * 24 * 60 * 60,
    '14d': 14 * 24 * 60 * 60,
    '30d': 30 * 24 * 60 * 60,
  }

  const duration = rangeMap[timeRange.value] || rangeMap['1h']
  const nowTimestamp = now.unix()
  return {
    startAt: nowTimestamp - duration!,
    endAt: nowTimestamp,
  }
}

const handleTimeRangeChange = (value: string) => {
  if (value === 'custom') {
    customTimePickerVisible.value = true
  } else {
    customTimeRange.value = null
    refreshData()
  }
}

const handleCustomTimeConfirm = () => {
  if (customTimeRange.value) {
    const [start, end] = customTimeRange.value
    const diffDays = dayjs(end).diff(dayjs(start), 'day')

    if (diffDays > 30) {
      // ElMessage.warning('自定义时间范围不能超过30天')
      return
    }

    customTimePickerVisible.value = false
    refreshData()
  }
}

const handleCustomTimeCancel = () => {
  customTimePickerVisible.value = false
  if (timeRange.value === 'custom') {
    timeRange.value = '1h'
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const datePickerShortcuts = [
  {
    text: '最近1小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000)
      return [start, end]
    },
  },
  {
    text: '最近6小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 6)
      return [start, end]
    },
  },
  {
    text: '最近24小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
]

const { run: runFetch } = useRequest(
  async () => {
    const params = getActualTimeRange()

    serverDetail.value = await fetchMonitorServerDetail(serverId, params)
    serverChart.value = await fetchMonitorServerChart(serverId, params)
    apiList.value = await fetchMonitorServerApi(serverId, params)
    workerData.value = await fetchMonitorServerWorker(serverId, params)
  },
  {
    pollingInterval: 6000,
  },
)

const refreshData = () => {
  runFetch()
}

// Computed values for status overview
const cpuUsage = computed(() => {
  if (!serverDetail.value?.cpuUsage) return 0
  return Number(serverDetail.value.cpuUsage.toFixed(2))
})

const memoryUsage = computed(() => {
  if (!serverDetail.value?.memoryUsage) return 0
  return Number(serverDetail.value.memoryUsage.toFixed(2))
})

const requestCount = computed(() => {
  if (!serverDetail.value?.requestCount) return '0'
  const count = serverDetail.value.requestCount
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
})

const errorRate = computed(() => {
  if (!serverDetail.value?.errorRate) return '0%'
  const rate = Number.parseFloat(serverDetail.value.errorRate)
  if (Number.isNaN(rate)) return '0%'
  return `${rate.toFixed(1)}%`
})

const p95Latency = computed(() => {
  if (!serverDetail.value?.p95) return '0ms'
  const latency = serverDetail.value.p95
  if (latency >= 1000) {
    return `${(latency / 1000).toFixed(1)}s`
  }
  return `${latency}ms`
})

const p99Latency = computed(() => {
  if (!serverDetail.value?.p99) return '0ms'
  const latency = serverDetail.value.p99
  if (latency >= 1000) {
    return `${(latency / 1000).toFixed(1)}s`
  }
  return `${latency}ms`
})
// Chart options
const cpuChartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    outerBounds: {
      left: 0,
      top: 0,
      right: 10,
      bottom: 0,
    },
    outerBoundsMode: 'auto',
    outerBoundsContain: 'auto',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: serverChart.value?.usage.ts || [],
    axisLabel: {
      formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
    },
  },
  yAxis: {
    type: 'value',
    name: 'CPU (%)',
  },
  tooltip: {
    borderRadius: 12,
    borderColor: '#dee0e3',
    extraCssText:
      'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    padding: [8, 12],
    trigger: 'axis',
    formatter: (params: any) => {
      const timestamp = params[0]?.axisValue
      const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
      let result = `${timeStr}<br/>`
      params.forEach((param: any) => {
        result += `${param.marker}${param.seriesName}: ${isNumber(param.value) ? `${param.value}%` : '--'}<br/>`
      })
      return result
    },
  },
  series: [
    {
      name: 'CPU Usage',
      type: 'line',
      data: serverChart.value?.usage.cpuUsage || [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showAllSymbol: true,
      lineStyle: {
        color: '#3b82f6',
        width: 1,
      },
      itemStyle: {
        color: '#3b82f6',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.05)',
            },
          ],
        },
      },
    },
  ],
}))

const memoryChartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    outerBounds: {
      left: 0,
      top: 0,
      right: 10,
      bottom: 0,
    },
    outerBoundsMode: 'auto',
    outerBoundsContain: 'auto',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: serverChart.value?.usage.ts || [],
    axisLabel: {
      formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
    },
  },
  yAxis: {
    type: 'value',
    name: 'Memory (%)',
  },
  tooltip: {
    borderRadius: 12,
    borderColor: '#dee0e3',
    extraCssText:
      'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    padding: [8, 12],
    trigger: 'axis',
    formatter: (params: any) => {
      const timestamp = params[0]?.axisValue
      const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
      let result = `${timeStr}<br/>`
      params.forEach((param: any) => {
        result += `${param.marker}${param.seriesName}: ${isNumber(param.value) ? `${param.value}%` : '--'}<br/>`
      })
      return result
    },
  },
  series: [
    {
      name: 'Memory Usage',
      type: 'line',
      data: serverChart.value?.usage.memoryUsage || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#10b981',
        width: 1,
      },
      itemStyle: {
        color: '#10b981',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(16, 185, 129, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(16, 185, 129, 0.05)',
            },
          ],
        },
      },
    },
  ],
}))

// Request & Error Rate Chart
const requestChartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    outerBounds: {
      left: 0,
      top: 0,
      right: 10,
      bottom: 0,
    },
    outerBoundsMode: 'auto',
    outerBoundsContain: 'auto',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: serverChart.value?.request.ts || [],
    axisLabel: {
      formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
    },
  },
  yAxis: [
    {
      type: 'value',
      position: 'left',
    },
    {
      type: 'value',
      name: '错误率 (%)',
      position: 'right',
    },
  ],
  tooltip: {
    borderRadius: 12,
    borderColor: '#dee0e3',
    extraCssText:
      'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    padding: [8, 12],
    trigger: 'axis',
    formatter: (params: any) => {
      const timestamp = params[0]?.axisValue
      const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
      let result = `${timeStr}<br/>`
      params.forEach((param: any, index: number) => {
        const unit = index === 0 ? '' : '%'
        result += `${param.marker}${param.seriesName}: ${isNumber(param.value) ? `${param.value}${unit}` : '--'}<br/>`
      })
      return result
    },
  },
  legend: {
    data: ['请求数', '错误率'],
    // left: 0,
    top: 0,
  },
  series: [
    {
      name: '请求数',
      type: 'line',
      yAxisIndex: 0,
      data: serverChart.value?.request.requestCount || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#3b82f6',
        width: 2,
      },
      itemStyle: {
        color: '#3b82f6',
      },
    },
    {
      name: '错误率',
      type: 'line',
      yAxisIndex: 1,
      data: serverChart.value?.request.errorRate || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#ef4444',
        width: 2,
      },
      itemStyle: {
        color: '#ef4444',
      },
    },
  ],
}))

// Latency Chart (Avg/P95/P99)
const latencyChartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    outerBounds: {
      left: 0,
      top: 0,
      right: 10,
      bottom: 0,
    },
    outerBoundsMode: 'auto',
    outerBoundsContain: 'auto',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: serverChart.value?.delay.ts || [],
    axisLabel: {
      formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
    },
  },
  yAxis: {
    type: 'value',
    name: '延迟 (ms)',
  },
  tooltip: {
    borderRadius: 12,
    borderColor: '#dee0e3',
    extraCssText:
      'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    padding: [8, 12],
    trigger: 'axis',
    formatter: (params: any) => {
      const timestamp = params[0]?.axisValue
      const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
      let result = `${timeStr}<br/>`
      params.forEach((param: any) => {
        result += `${param.marker}${param.seriesName}: ${
          isNumber(param.value) ? calcTimeUnit(param.value) : '--'
        }<br/>`
      })
      return result
    },
  },
  legend: {
    data: ['Avg', 'P95', 'P99'],
    top: 0,
  },
  series: [
    {
      name: 'Avg',
      type: 'line',
      data: serverChart.value?.delay.avg || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#10b981',
        width: 2,
      },
      itemStyle: {
        color: '#10b981',
      },
    },
    {
      name: 'P95',
      type: 'line',
      data: serverChart.value?.delay.p95 || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#f59e0b',
        width: 2,
      },
      itemStyle: {
        color: '#f59e0b',
      },
    },
    {
      name: 'P99',
      type: 'line',
      data: serverChart.value?.delay.p99 || [],
      smooth: true,
      showAllSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#ef4444',
        width: 2,
      },
      itemStyle: {
        color: '#ef4444',
      },
    },
  ],
}))

// Top API 列表排序
const topApiSortBy = ref('p99')
const topApiList = ref([
  {
    method: 'GET',
    path: '/orders',
    callCount: 45000,
    errorRate: 4.2,
    avgLatency: 180,
    p99Latency: 450,
  },
  {
    method: 'POST',
    path: '/users',
    callCount: 32000,
    errorRate: 0.8,
    avgLatency: 120,
    p99Latency: 280,
  },
  {
    method: 'GET',
    path: '/products',
    callCount: 28000,
    errorRate: 1.1,
    avgLatency: 95,
    p99Latency: 220,
  },
  {
    method: 'PUT',
    path: '/inventory',
    callCount: 15000,
    errorRate: 0.5,
    avgLatency: 140,
    p99Latency: 320,
  },
  {
    method: 'DELETE',
    path: '/cache',
    callCount: 8500,
    errorRate: 0.2,
    avgLatency: 65,
    p99Latency: 180,
  },
])

const onClickApi = (row: any) => {
  router.push({
    name: 'apiMonitorDetail',
    params: {
      id: row.apiId,
    },
    query: {
      name: row.apiName,
    },
  })
}
</script>

<template>
  <PageContainer
    mode="auto"
    content-class="flex flex-column flex-1 min-h-0 overflow-auto px-6 pb-6 position-relative"
  >
    <template #title>
      <span class="fs-5 font-color-dark lh-8 ellipsis">{{ serverName }}</span>
    </template>
    <template #actions>
      <div class="flex align-center gap-4">
        <el-select
          v-model="timeRange"
          placeholder="选择时间范围"
          style="width: 160px"
          @change="handleTimeRangeChange"
        >
          <el-option
            v-for="option in timeRangeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button type="primary" @click="refreshData">
          <el-icon class="mr-1"><i-lucide-refresh-cw /></el-icon>
          刷新
        </el-button>
      </div>
    </template>

    <div class="flex flex-column gap-6">
      <!-- Status Overview -->
      <div class="status-overview-card border mt-2">
        <!-- <h3 class="section-title">Status Overview</h3> -->
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">CPU Usage</div>
            <div class="status-value">{{ cpuUsage }}%</div>
          </div>
          <div class="status-item">
            <div class="status-label">Memory</div>
            <div class="status-value">{{ memoryUsage }}%</div>
          </div>
          <div class="status-item">
            <div class="status-label">Request Count</div>
            <div class="status-value">{{ requestCount }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">Error Rate</div>
            <div class="status-value">{{ errorRate }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">P95 Latency</div>
            <div class="status-value status-value-warning">
              {{ p95Latency }}
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">P99 Latency</div>
            <div class="status-value status-value-danger">{{ p99Latency }}</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Row 1: CPU & Memory -->
        <div class="chart-row">
          <!-- CPU Usage Trend -->
          <div class="chart-card border">
            <h3 class="chart-title">
              <!-- <span class="chart-legend-dot chart-legend-blue" /> -->
              CPU Usage (%)
            </h3>
            <div class="chart-container">
              <VChart :option="cpuChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Memory Usage Trend -->
          <div class="chart-card border">
            <h3 class="chart-title">
              <!-- <span class="chart-legend-dot chart-legend-green" /> -->
              Memory Usage (%)
            </h3>
            <div class="chart-container">
              <VChart :option="memoryChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Request & Error Rate -->
          <div class="chart-card border">
            <h3 class="chart-title">请求数 & 错误率趋势</h3>
            <div class="chart-container">
              <VChart :option="requestChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Latency Trend -->
          <div class="chart-card border">
            <h3 class="chart-title">延迟趋势 (Avg/P95/P99)</h3>
            <div class="chart-container">
              <VChart :option="latencyChartOption" :autoresize="true" />
            </div>
          </div>
        </div>
      </div>

      <!-- Top API Section -->
      <div class="top-api-section border">
        <div class="section-header mb-3 flex items-center justify-between">
          <h3 class="section-title">Top API 列表</h3>
          <!-- <el-select
            v-model="topApiSortBy"
            placeholder="排序方式"
            style="width: 160px"
          >
            <el-option label="按错误率排序" value="errorRate" />
            <el-option label="按P99延迟排序" value="p99" />
            <el-option label="按调用次数排序" value="callCount" />
          </el-select> -->
        </div>

        <el-table :data="apiList" class="top-api-table">
          <el-table-column label="API 名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="onClickApi(row)">{{
                row.apiName
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="API 路径" min-width="200">
            <template #default="{ row }">
              <el-tag
                type="info"
                class="is-code is-wrap px-1.5 font-mono"
                disable-transitions
              >
                {{ row.apiPath }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="调用次数" prop="requestCount" width="120" />
          <el-table-column label="错误率" prop="errorRate" width="100">
            <template #default="{ row }">
              <span
                :class="{
                  'text-danger': row.errorRate >= 3,
                  'text-warning': row.errorRate >= 1 && row.errorRate < 3,
                }"
              >
                {{ row.errorRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="平均耗时" prop="avg" width="120">
            <template #default="{ row }">
              {{ row.avgTime }}
            </template>
          </el-table-column>
          <el-table-column label="P99 延迟" prop="p99" width="120">
            <template #default="{ row }"> {{ row.p99Time }} </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Worker Section -->
      <div class="worker-section border">
        <div class="worker-header">
          <h3 class="section-title">Worker 资源诊断</h3>
          <el-icon class="expand-icon"><i-lucide-chevron-down /></el-icon>
        </div>
        <div class="worker-summary">
          CPU 分布：最小值 {{ workerData?.cpuUsageMin }}% ~ 最大值
          {{ workerData?.cpuUsageMax }}%
        </div>
      </div>
    </div>

    <!-- Custom Time Range Dialog -->
    <el-dialog
      v-model="customTimePickerVisible"
      title="自定义时间范围"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="custom-time-picker">
        <el-date-picker
          v-model="customTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :disabled-date="disabledDate"
          :shortcuts="datePickerShortcuts"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
        <div class="mt-2 text-sm text-gray-500">
          <el-icon class="mr-1"><i-lucide-info /></el-icon>
          时间范围不能超过30天
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCustomTimeCancel">取消</el-button>
          <el-button type="primary" @click="handleCustomTimeConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.status-overview-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.status-value {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1;

  &.status-value-warning {
    color: #f97316;
  }

  &.status-value-danger {
    color: #ef4444;
  }
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;

  &.chart-legend-blue {
    background-color: #3b82f6;
  }

  &.chart-legend-green {
    background-color: #10b981;
  }
}

.chart-container {
  height: 300px;
  width: 100%;
}

.custom-time-picker {
  padding: 10px 0;

  .text-gray-500 {
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
  }
}

.top-api-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.top-api-table {
  margin-top: 16px;

  .api-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .api-path {
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    color: #3b82f6;
    font-size: 13px;
  }

  .text-danger {
    color: #ef4444;
    font-weight: 600;
  }

  .text-warning {
    color: #f97316;
    font-weight: 600;
  }
}

.worker-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.worker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .section-title {
    margin-bottom: 0;
  }

  .expand-icon {
    transition: transform 0.2s;
  }
}

.worker-summary {
  font-size: 14px;
  color: #6b7280;
}
</style>
