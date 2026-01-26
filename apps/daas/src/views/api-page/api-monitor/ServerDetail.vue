<script setup lang="ts">
import {
  fetchMonitorServerApi,
  fetchMonitorServerChart,
  fetchMonitorServerDetail,
  type ServerChart,
  type ServerDetail,
  type ServerWorker,
} from '@tap/api/src/core/monitor-server'
import { usePagination, useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import CountUp from '@tap/component/src/CountUp.vue'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { isNumber, isString } from 'lodash-es'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'
import { useRoute, useRouter } from 'vue-router'
import TimeRangeSelector from './components/TimeRangeSelector.vue'
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
const { t } = useI18n()
const serverId = route.params.id as string
const serverDetail = ref<ServerDetail>()
const serverChart = ref<ServerChart>()
const apiList = ref<any>()
const workerData = ref<ServerWorker>()
const workerCollapseActive = ref<string[]>([])

// Top API 列表排序相关
const apiListDefaultSort = { prop: 'requestCount', order: 'descending' }
const apiListSortBy = ref(apiListDefaultSort.prop)
const apiListSortOrder = ref<'ASC' | 'DESC'>('DESC')

// Top API 列表排序处理函数
const handleApiListSortChange = ({
  prop,
  order,
}: {
  prop: string
  order: string | null
}) => {
  if (!order) {
    // 取消排序，恢复默认排序
    apiListSortBy.value = apiListDefaultSort.prop
    apiListSortOrder.value = 'DESC'
  } else {
    apiListSortBy.value = prop
    apiListSortOrder.value = order === 'ascending' ? 'ASC' : 'DESC'
  }
  apiListPage.value = 1 // 排序时重置到第一页
  // runFetch()
}

// Worker 表格排序相关
const workerListDefaultSort = { prop: 'requestCount', order: 'descending' }
const workerListSortBy = ref(workerListDefaultSort.prop)
const workerListSortOrder = ref<'ASC' | 'DESC'>('DESC')

const matchValueUnit = (value: any) => {
  if (isString(value)) {
    const match = value.match(/(\d+(?:\.\d*)?)([a-z%/]+)?/i)
    if (match) {
      return {
        value: Number(match[1]),
        unit: match[2] || '',
      }
    }
  }
  return {
    value,
    unit: '',
  }
}

const requestCount = computed(() => {
  const { value, unit } = matchValueUnit(serverDetail.value?.requestCount)
  return {
    value,
    unit,
  }
})

const errorCount = computed(() => {
  const { value, unit } = matchValueUnit(serverDetail.value?.errorCount)
  return {
    value,
    unit,
    errorRate: serverDetail.value?.errorRate,
  }
})

const responseTimeAvg = computed(() => {
  const { value, unit } = matchValueUnit(serverDetail.value?.responseTimeAvg)
  return {
    value,
    unit,
    minDelay: serverDetail.value?.minDelay,
    maxDelay: serverDetail.value?.maxDelay,
  }
})

const p95 = computed(() => {
  const { value, unit } = matchValueUnit(serverDetail.value?.p95)
  return {
    value,
    unit,
  }
})

const p99 = computed(() => {
  const { value, unit } = matchValueUnit(serverDetail.value?.p99)
  return {
    value,
    unit,
  }
})

// Worker 表格排序处理函数
const handleWorkerListSortChange = ({
  prop,
  order,
}: {
  prop: string
  order: string | null
}) => {
  if (!order) {
    // 取消排序，恢复默认排序
    workerListSortBy.value = workerListDefaultSort.prop
    workerListSortOrder.value = 'DESC'
  } else {
    workerListSortBy.value = prop
    workerListSortOrder.value = order === 'ascending' ? 'ASC' : 'DESC'
  }
  runFetch()
}

// 时间周期选择 - 从 route.query 中恢复
const timeRange = ref((route.query.timeRange as string) || '1h')
const customTimeRange = ref<[number, number] | null>(null)
const timeRangeParams = ref<{ startAt: number; endAt: number } | null>(null)

// 从 query 中恢复自定义时间范围
onMounted(() => {
  if (route.query.customStart && route.query.customEnd) {
    customTimeRange.value = [+route.query.customStart, +route.query.customEnd]
    timeRange.value = 'custom'
  }
  runFetch()
})

const serverName = computed(
  () => route.query.name || serverDetail.value?.serverName,
)

const getActualTimeRange = () => {
  if (timeRange.value === 'custom' && customTimeRange.value) {
    return {
      type: 'range',
      startAt: dayjs(customTimeRange.value[0]).unix(),
      endAt: dayjs(customTimeRange.value[1]).unix(),
    }
  }
  const rangeMap: Record<string, Record<string, string | number>> = {
    '5m': {
      step: 5,
      type: 'minute',
    },
    '15m': {
      step: 15,
      type: 'minute',
    },
    '1h': {
      step: 1,
      type: 'hours',
    },
    '6h': {
      step: 6,
      type: 'hours',
    },
    '12h': {
      step: 12,
      type: 'hours',
    },
    '24h': {
      step: 24,
      type: 'hours',
    },
    '7d': {
      step: 7,
      type: 'days',
    },
    '14d': {
      step: 14,
      type: 'days',
    },
    '30d': {
      step: 30,
      type: 'days',
    },
  }

  return rangeMap[timeRange.value] || rangeMap['1h']
}

const defaultApiListParams = {
  current: 1,
  pageSize: 10,
}

const {
  data: apiListData,
  current: apiListPage,
  pageSize: apiListPageSize,
  total: apiListTotal,
  refresh: refreshApiList,
} = usePagination(
  async ({
    current = defaultApiListParams.current,
    pageSize = defaultApiListParams.pageSize,
  } = {}) => {
    const params = {
      ...getActualTimeRange(),
      serverId,
      orderBy: `${apiListSortBy.value} ${apiListSortOrder.value}`,
      skip: (current - 1) * pageSize,
      limit: pageSize,
    }
    const apiResult = await fetchMonitorServerApi(params)
    return apiResult
  },
  {
    manual: true,
    defaultParams: [defaultApiListParams],
    initialData: {
      total: 0,
      items: [],
    },
  },
)

const { run: runFetch } = useRequest(
  async () => {
    const params = getActualTimeRange()
    params.serverId = serverId
    refreshApiList()
    serverDetail.value = await fetchMonitorServerDetail(params)
    timeRangeParams.value = {
      startAt: serverDetail.value.queryFrom,
      endAt: serverDetail.value.queryEnd,
    }
    const workerList = serverDetail.value.workerInfo
    delete serverDetail.value.workerInfo
    serverChart.value = await fetchMonitorServerChart(params)
    workerData.value = workerList
  },
  {
    pollingInterval: 6000,
    manual: true,
  },
)

const refreshData = () => {
  runFetch()
}

// Chart options
const cpuChartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    outerBounds: {
      left: 0,
      top: 28,
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
  legend: {
    data: ['CPU Usage', 'Max CPU', 'Min CPU'],
    top: 0,
    type: 'scroll',
  },
  series: [
    {
      name: 'CPU Usage',
      type: 'line',
      data: serverChart.value?.usage.cpuUsage || [],
      smooth: true,

      symbol: 'circle',
      showSymbol: false,
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
      name: 'Max CPU',
      type: 'line',
      data: serverChart.value?.usage.maxCpuUsage || [],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#ef4444',
        width: 1,
      },
      itemStyle: {
        color: '#ef4444',
      },
    },
    {
      name: 'Min CPU',
      type: 'line',
      data: serverChart.value?.usage.minCpuUsage || [],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#10b981',
        width: 1,
      },
      itemStyle: {
        color: '#10b981',
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
      top: 28,
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
  legend: {
    data: ['Memory Usage', 'Max Memory', 'Min Memory'],
    top: 0,
    type: 'scroll',
  },
  series: [
    {
      name: 'Memory Usage',
      type: 'line',
      data: serverChart.value?.usage.memoryUsage || [],
      smooth: true,
      showSymbol: false,
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
      name: 'Max Memory',
      type: 'line',
      data: serverChart.value?.usage.maxMemoryUsage || [],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#ef4444',
        width: 1,
      },
      itemStyle: {
        color: '#ef4444',
      },
    },
    {
      name: 'Min Memory',
      type: 'line',
      data: serverChart.value?.usage.minMemoryUsage || [],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#3b82f6',
        width: 1,
      },
      itemStyle: {
        color: '#3b82f6',
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
      showSymbol: false,
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
      showSymbol: false,
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
      showSymbol: false,
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
      showSymbol: false,
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
      showSymbol: false,
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

// Worker Charts
const workerCpuChartOption = computed<EChartsOption>(() => {
  if (!workerData.value?.workerList?.length) {
    return {}
  }

  const timestamps = workerData.value.workerList[0]?.usage?.ts || []

  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      outerBounds: {
        left: 0,
        top: 28,
        right: 10,
        bottom: 0,
      },
      outerBoundsMode: 'auto',
      outerBoundsContain: 'auto',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timestamps,
      axisLabel: {
        formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      // name: 'CPU Usage (%)',
      axisLabel: {
        formatter: '{value}%',
      },
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
    legend: {
      data: workerData.value.workerList.map((w) => w.workerName),
      top: 0,
      type: 'scroll',
    },
    series: workerData.value.workerList.map((worker) => ({
      name: worker.workerName,
      type: 'line',
      data: worker.usage.cpuUsage,
      smooth: true,
      showSymbol: false,
    })),
  }
})

const workerMemoryChartOption = computed<EChartsOption>(() => {
  if (!workerData.value?.workerList?.length) {
    return {}
  }

  const timestamps = workerData.value.workerList[0]?.usage?.ts || []

  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      outerBounds: {
        left: 0,
        top: 28,
        right: 10,
        bottom: 0,
      },
      outerBoundsMode: 'auto',
      outerBoundsContain: 'auto',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timestamps,
      axisLabel: {
        formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      // name: 'Memory Usage (%)',
      axisLabel: {
        formatter: '{value}%',
      },
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
    legend: {
      data: workerData.value.workerList.map((w) => w.workerName),
      top: 0,
      type: 'scroll',
    },
    series: workerData.value.workerList.map((worker) => ({
      name: worker.workerName,
      type: 'line',
      data: worker.usage.memoryUsage,
      smooth: true,
      showSymbol: false,
    })),
  }
})

const onClickApi = (row: any) => {
  router.push({
    name: 'apiMonitorDetail',
    params: {
      id: row.apiId,
    },
    query: {
      name: row.apiName,
      timeRange: timeRange.value,
      ...(timeRange.value === 'custom' && customTimeRange.value
        ? {
            customStart: customTimeRange.value[0].toISOString(),
            customEnd: customTimeRange.value[1].toISOString(),
          }
        : {}),
    },
  })
}

// 跳转到审计页面 - 错误率
const handleNavigateToAuditWithError = (apiName?: string) => {
  const timeRange = timeRangeParams.value
  const query: any = {
    code: '500', // 失败的状态码
    start: timeRange.startAt * 1000, // 转换为毫秒
    end: timeRange.endAt * 1000, // 转换为毫秒
  }

  if (apiName) {
    query.keyword = apiName
  }

  const href = router.resolve({
    name: 'dataServerAuditList',
    query,
  }).href
  window.open(href, `Audit-${apiName}`)
}

// 跳转到审计页面 - 响应时间排序
const handleNavigateToAuditWithResponseTime = (
  apiName?: string,
  sortOrder: 'ASC' | 'DESC' = 'DESC',
) => {
  const timeRange = timeRangeParams.value
  const query: any = {
    start: timeRange.startAt * 1000, // 转换为毫秒
    end: timeRange.endAt * 1000, // 转换为毫秒
    sortBy: 'latency',
    sortOrder,
  }

  if (apiName) {
    query.keyword = apiName
  }

  const href = router.resolve({
    name: 'dataServerAuditList',
    query,
  }).href
  window.open(href, `Audit-${apiName}`)
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
        <TimeRangeSelector
          v-model="timeRange"
          v-model:custom-time="customTimeRange"
          @change="refreshData"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon class="mr-1"><i-lucide-refresh-cw /></el-icon>
          {{ t('api_monitor_refresh') }}
        </el-button>
      </div>
    </template>

    <div class="flex flex-column gap-6">
      <!-- Status Overview -->
      <div class="status-overview-card border mt-2">
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">
              {{ $t('api_monitor_total_request_count') }}
            </div>
            <div v-if="requestCount.value !== undefined" class="status-value">
              <CountUp
                :end-val="requestCount.value"
                :suffix="requestCount.unit"
                :duration="0.5"
              />
            </div>
            <div v-else class="status-value">--</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              {{ $t('api_monitor_total_error_count') }}
            </div>
            <div
              v-if="errorCount.value !== undefined"
              class="status-value flex flex-column align-items-start gap-2"
            >
              <CountUp :end-val="errorCount.value" :duration="0.5" />

              <el-tag
                v-if="errorCount.errorRate > 0"
                type="danger"
                size="small"
                class="fw-sub"
                ><span class="mr-1">{{ $t('api_monitor_error_rate') }}</span
                >{{ errorCount.errorRate }}%</el-tag
              >
            </div>
            <div v-else class="status-value">--</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              {{ $t('api_monitor_avg_response_time') }}
            </div>
            <div
              v-if="responseTimeAvg.value !== undefined"
              class="status-value flex flex-column align-items-start gap-2"
            >
              <CountUp
                :end-val="responseTimeAvg.value"
                :suffix="responseTimeAvg.unit"
                :duration="0.5"
                :decimals="2"
              />
              <div class="flex align-center gap-1">
                <el-tag
                  v-if="responseTimeAvg.maxDelay !== undefined"
                  size="small"
                  class="is-code fw-sub"
                >
                  <span class="fw-sub mr-1">Max</span
                  >{{ responseTimeAvg.maxDelay }}
                </el-tag>
                <el-tag
                  v-if="responseTimeAvg.minDelay !== undefined"
                  size="small"
                  class="is-code fw-sub"
                >
                  <span class="fw-sub mr-1">Min</span
                  >{{ responseTimeAvg.minDelay }}
                </el-tag>
              </div>
            </div>
            <div v-else class="status-value">--</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              {{ $t('api_monitor_p95_response_time') }}
            </div>
            <div v-if="p95.value !== undefined" class="status-value">
              <CountUp
                :end-val="p95.value"
                :suffix="p95.unit"
                :duration="0.5"
                :decimals="2"
              />
            </div>
            <div v-else class="status-value">--</div>
          </div>
          <div class="status-item">
            <div class="status-label">
              {{ $t('api_monitor_p99_response_time') }}
            </div>
            <div v-if="p99.value !== undefined" class="status-value">
              <CountUp
                :end-val="p99.value"
                :suffix="p99.unit"
                :duration="0.5"
                :decimals="2"
              />
            </div>
            <div v-else class="status-value">--</div>
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
              {{ t('api_monitor_cpu_usage_trend') }}
            </h3>
            <div class="chart-container">
              <VChart :option="cpuChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Memory Usage Trend -->
          <div class="chart-card border">
            <h3 class="chart-title">
              <!-- <span class="chart-legend-dot chart-legend-green" /> -->
              {{ t('api_monitor_memory_usage_trend') }}
            </h3>
            <div class="chart-container">
              <VChart :option="memoryChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Request & Error Rate -->
          <div class="chart-card border">
            <h3 class="chart-title">
              {{ t('api_monitor_request_error_trend') }}
            </h3>
            <div class="chart-container">
              <VChart :option="requestChartOption" :autoresize="true" />
            </div>
          </div>

          <!-- Latency Trend -->
          <div class="chart-card border">
            <h3 class="chart-title">{{ t('api_monitor_latency_trend') }}</h3>
            <div class="chart-container">
              <VChart :option="latencyChartOption" :autoresize="true" />
            </div>
          </div>
        </div>
      </div>

      <!-- Top API Section -->
      <div class="top-api-section border">
        <div class="section-header mb-3 flex items-center justify-between">
          <h3 class="section-title">{{ t('api_monitor_top_api_list') }}</h3>
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

        <el-table
          :data="apiListData?.items"
          class="top-api-table"
          :default-sort="apiListDefaultSort"
          @sort-change="handleApiListSortChange"
        >
          <el-table-column
            :label="t('api_monitor_server_api_name')"
            min-width="200"
          >
            <template #default="{ row }">
              <div class="flex flex-wrap align-center gap-2">
                <el-link type="primary" @click="onClickApi(row)">{{
                  row.apiName
                }}</el-link>
                <el-tag
                  type="info"
                  class="is-code is-wrap px-1.5 font-mono"
                  disable-transitions
                >
                  {{ row.apiPath }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_request_count')"
            prop="requestCount"
            width="120"
            sortable="custom"
          />
          <el-table-column
            :label="t('api_monitor_error_rate')"
            prop="errorRate"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                v-if="row.errorRate > 0"
                class="text-red-500 cursor-pointer underline-dashed flex align-center gap-1"
                @click.stop="handleNavigateToAuditWithError(row.apiName)"
              >
                {{ row.errorRate }}%
                <el-icon>
                  <i-lucide-external-link />
                </el-icon>
              </span>
              <span v-else> {{ row.errorRate }}% </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_avg_response_time')"
            prop="responseTimeAvg"
            width="140"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.responseTimeAvg ?? '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_max_response_time')"
            prop="maxDelay"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                v-if="row.maxDelay !== undefined"
                class="underline-dashed cursor-pointer flex align-center gap-1"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(row.apiName, 'DESC')
                "
              >
                {{ row.maxDelay }}
                <el-icon>
                  <i-lucide-external-link />
                </el-icon>
              </span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_min_response_time')"
            prop="minDelay"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                v-if="row.minDelay !== undefined"
                class="underline-dashed cursor-pointer flex align-center gap-1"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(row.apiName, 'ASC')
                "
              >
                {{ row.minDelay }}
                <el-icon>
                  <i-lucide-external-link />
                </el-icon>
              </span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p95_response_time')"
            prop="p95"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }"> {{ row.p95 ?? '--' }} </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p99_response_time')"
            prop="p99"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }"> {{ row.p99 ?? '--' }} </template>
          </el-table-column>
        </el-table>

        <!-- API 列表分页 -->
        <el-pagination
          v-model:current-page="apiListPage"
          v-model:page-size="apiListPageSize"
          class="mt-4"
          :total="apiListTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="->,total, prev, pager, next, sizes"
        />
      </div>

      <!-- Worker Section -->
      <div class="worker-section border">
        <el-collapse v-model="workerCollapseActive">
          <el-collapse-item name="worker">
            <template #title>
              <div class="worker-header-content">
                <h3 class="section-title">
                  {{ t('api_monitor_worker_diagnosis') }}
                </h3>
                <!-- <div class="worker-summary">
                  {{
                    t('api_monitor_cpu_distribution', {
                      min: workerData?.cpuUsageMin?.toFixed(2) || 0,
                      max: workerData?.cpuUsageMax?.toFixed(2) || 0,
                    })
                  }}
                </div> -->
              </div>
            </template>

            <!-- Worker Charts -->
            <div v-if="workerData?.workerList?.length" class="worker-charts">
              <div class="chart-row">
                <!-- CPU Usage Chart -->
                <div class="chart-card border shadow-none">
                  <div class="chart-title">
                    <el-icon class="color-primary"><i-lucide-cpu /></el-icon>
                    {{ t('api_monitor_worker_cpu_usage') }}
                  </div>
                  <div class="chart-container">
                    <v-chart :option="workerCpuChartOption" autoresize />
                  </div>
                </div>

                <!-- Memory Usage Chart -->
                <div class="chart-card border shadow-none">
                  <div class="chart-title">
                    <el-icon class="color-primary"
                      ><i-lucide-memory-stick
                    /></el-icon>
                    {{ t('api_monitor_worker_memory_usage') }}
                  </div>
                  <div class="chart-container">
                    <v-chart :option="workerMemoryChartOption" autoresize />
                  </div>
                </div>
              </div>

              <!-- Worker Table -->
              <div class="worker-table-section">
                <el-table
                  :data="workerData.workerList"
                  stripe
                  class="has-border-t"
                  :default-sort="workerListDefaultSort"
                  @sort-change="handleWorkerListSortChange"
                >
                  <el-table-column
                    prop="workerName"
                    :label="t('api_monitor_worker_name')"
                    min-width="200"
                  />
                  <el-table-column
                    prop="requestCount"
                    :label="t('api_monitor_request_count')"
                    min-width="120"
                    align="right"
                  >
                    <template #default="{ row }">
                      {{ row.requestCount?.toLocaleString() || 0 }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="errorRate"
                    :label="t('api_monitor_error_rate')"
                    min-width="120"
                    align="right"
                  >
                    <template #default="{ row }">
                      <span
                        v-if="row.errorRate !== undefined"
                        :class="{
                          'error-rate-high': (row.errorRate || 0) > 5,
                          'error-rate-medium':
                            (row.errorRate || 0) > 1 &&
                            (row.errorRate || 0) <= 5,
                          'error-rate-low': (row.errorRate || 0) <= 1,
                        }"
                      >
                        {{ (row.errorRate || 0).toFixed(2) }}%
                      </span>
                      <span v-else>--</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- No Data -->
            <div v-else class="no-data">
              {{ t('api_monitor_no_worker_data') }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.status-overview-card {
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
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
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
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item__header) {
    padding: 24px;
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 600;
    height: auto;
    line-height: 1.5;
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
    background: transparent;
  }

  :deep(.el-collapse-item__content) {
    padding: 0 24px 24px;
  }
}

.worker-header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  .section-title {
    margin-bottom: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }
}

.worker-summary {
  font-size: 14px;
  color: #6b7280;
  font-weight: 400;
}

.worker-table-section {
  margin-top: 24px;

  :deep(.el-table) {
    font-size: 14px;
  }

  .error-rate-high {
    color: #ef4444;
    font-weight: 600;
  }

  .error-rate-medium {
    color: #f59e0b;
    font-weight: 600;
  }

  .error-rate-low {
    color: #10b981;
    font-weight: 600;
  }
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
