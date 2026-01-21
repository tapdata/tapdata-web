<script setup lang="ts">
import {
  fetchMonitorApiChart,
  fetchMonitorApiDetail,
  fetchMonitorApiServer,
  type ApiChart,
  type Params,
} from '@tap/api/src/core/monitor-server'
import { useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import CountUp from '@tap/component/src/CountUp.vue'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'
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
const apiId = route.params.id as string
const apiDetail = ref<any>()
const apiChart = ref<ApiChart>()
const serverList = ref<any[]>([])

// 排序相关
const serverListDefaultSort = { prop: 'requestCount', order: 'descending' }
const serverListSortBy = ref(serverListDefaultSort.prop)
const serverListSortOrder = ref<'ASC' | 'DESC'>('DESC')

// 排序处理函数
const handleServerListSortChange = ({
  prop,
  order,
}: {
  prop: string
  order: string | null
}) => {
  if (!order) {
    // 取消排序，恢复默认排序
    serverListSortBy.value = serverListDefaultSort.prop
    serverListSortOrder.value = 'DESC'
  } else {
    serverListSortBy.value = prop
    serverListSortOrder.value = order === 'ascending' ? 'ASC' : 'DESC'
  }
  runFetch()
}

// 时间周期选择 - 从 route.query 中恢复
const timeRange = ref((route.query.timeRange as string) || '1h')
const customTimeRange = ref<[number, number] | null>(null)

// 从 query 中恢复自定义时间范围
onMounted(() => {
  if (route.query.customStart && route.query.customEnd) {
    customTimeRange.value = [+route.query.customStart, +route.query.customEnd]
    timeRange.value = 'custom'
  }

  runFetch()
})

const apiName = computed(
  () => route.query.name || apiDetail.value?.apiName || 'API 详情',
)

const getActualTimeRange = (): Params => {
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

const { run: runFetch } = useRequest(
  async () => {
    const params = getActualTimeRange()
    params.apiId = apiId
    apiDetail.value = await fetchMonitorApiDetail(params)
    apiChart.value = await fetchMonitorApiChart(params)
    serverList.value = await fetchMonitorApiServer({
      ...params,
      orderBy: `${serverListSortBy.value} ${serverListSortOrder.value}`,
    })
  },
  {
    pollingInterval: 6000,
    manual: true,
  },
)

const refreshData = () => {
  runFetch()
}

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
  const { value, unit } = matchValueUnit(apiDetail.value?.requestCount)
  return {
    value,
    unit,
  }
})

const errorCount = computed(() => {
  const { value, unit } = matchValueUnit(apiDetail.value?.errorCount)
  return {
    value,
    unit,
    errorRate: apiDetail.value?.errorRate,
  }
})

const responseTimeAvg = computed(() => {
  const { value, unit } = matchValueUnit(apiDetail.value?.responseTimeAvg)
  return {
    value,
    unit,
    minDelay: apiDetail.value?.minDelay,
    maxDelay: apiDetail.value?.maxDelay,
  }
})

const p95 = computed(() => {
  const { value, unit } = matchValueUnit(apiDetail.value?.p95)
  return {
    value,
    unit,
  }
})

const p99 = computed(() => {
  const { value, unit } = matchValueUnit(apiDetail.value?.p99)
  return {
    value,
    unit,
  }
})

// 响应时间趋势图表
const latencyChartOption = computed(() => {
  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      outerBounds: {
        left: 0,
        top: 24,
        right: 10,
        bottom: 0,
      },
      outerBoundsMode: 'auto',
      outerBoundsContain: 'auto',
    },
    tooltip: {
      trigger: 'axis',
      borderRadius: 12,
      borderColor: '#dee0e3',
      extraCssText:
        'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
      padding: [8, 12],
      formatter: (params: any) => {
        const timestamp = params[0]?.axisValue
        const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
        let result = `${timeStr}<br/>`
        params.forEach((param: any) => {
          const value = isNumber(param.value) ? calcTimeUnit(param.value) : '--'
          result += `${param.marker}${param.seriesName}: ${value}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['Avg', 'P95', 'P99'],
      top: 0,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: apiChart.value?.ts || [],
      axisLabel: {
        formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      // name: t('api_monitor_latency_ms'),
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Avg',
        type: 'line',
        data: apiChart.value?.requestCostAvg || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#3b82f6',
          width: 2,
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'P95',
        type: 'line',
        data: apiChart.value?.p95 || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#f59e0b',
          width: 2,
        },
        itemStyle: {
          color: '#f59e0b',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'P99',
        type: 'line',
        data: apiChart.value?.p99 || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#ef4444',
          width: 2,
        },
        itemStyle: {
          color: '#ef4444',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  }
})

// 数据库耗时趋势图表
const dbCostChartOption = computed(() => {
  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      outerBounds: {
        left: 0,
        top: 24,
        right: 10,
        bottom: 0,
      },
      outerBoundsMode: 'auto',
      outerBoundsContain: 'auto',
    },
    tooltip: {
      trigger: 'axis',
      borderRadius: 12,
      borderColor: '#dee0e3',
      extraCssText:
        'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
      padding: [8, 12],
      formatter: (params: any) => {
        const timestamp = params[0]?.axisValue
        const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
        let result = `${timeStr}<br/>`
        params.forEach((param: any) => {
          const value = isNumber(param.value) ? calcTimeUnit(param.value) : '--'
          result += `${param.marker}${param.seriesName}: ${value}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['Avg', 'Max', 'Min', 'P95', 'P99'],
      top: 0,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: apiChart.value?.ts || [],
      axisLabel: {
        formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter(value: number) {
          return calcTimeUnit(value)
        },
      },
    },
    series: [
      {
        name: 'Avg',
        type: 'line',
        data: apiChart.value?.dbCostAvg || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#3b82f6',
          width: 2,
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'Max',
        type: 'line',
        data: apiChart.value?.dbCostMax || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#8b5cf6',
          width: 1,
        },
        itemStyle: {
          color: '#8b5cf6',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'Min',
        type: 'line',
        data: apiChart.value?.dbCostMin || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#06b6d4',
          width: 1,
        },
        itemStyle: {
          color: '#06b6d4',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'P95',
        type: 'line',
        data: apiChart.value?.dbCostP95 || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#f59e0b',
          width: 2,
        },
        itemStyle: {
          color: '#f59e0b',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'P99',
        type: 'line',
        data: apiChart.value?.dbCostP99 || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#ef4444',
          width: 2,
        },
        itemStyle: {
          color: '#ef4444',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  }
})

// 吞吐量趋势图表
const throughputChartOption = computed(() => {
  return {
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
    tooltip: {
      trigger: 'axis',
      borderRadius: 12,
      borderColor: '#dee0e3',
      extraCssText:
        'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
      padding: [8, 12],
      formatter: (params: any) => {
        const timestamp = params[0]?.axisValue
        const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
        let result = `${timeStr}<br/>`
        params.forEach((param: any) => {
          const value = isNumber(param.value)
            ? `${calcUnit(param.value, 'b')}/s`
            : '--'
          result += `${param.marker}${param.seriesName}: ${value}<br/>`
        })
        return result
      },
    },
    // legend: {
    //   data: [t('api_monitor_throughput')],
    //   top: 0,
    // },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: apiChart.value?.ts || [],
      axisLabel: {
        formatter: (value: number) => dayjs.unix(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      // name: t('api_monitor_throughput'),
      axisLabel: {
        formatter(value: number) {
          return `${calcUnit(value, 'b')}/s`
        },
      },
    },
    series: [
      {
        name: t('api_monitor_throughput'),
        type: 'line',
        data: apiChart.value?.rps || [],
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        lineStyle: {
          color: '#10b981',
          width: 2,
        },
        itemStyle: {
          color: '#10b981',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  }
})

const onClickServer = (row: any) => {
  router.push({
    name: 'apiMonitorServerDetail',
    params: {
      id: row.serverId,
    },
    query: {
      name: row.serverName,
      timeRange: timeRange.value,
      ...(timeRange.value === 'custom' && customTimeRange.value
        ? {
            customStart: customTimeRange.value[0],
            customEnd: customTimeRange.value[1],
          }
        : {}),
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
      <span class="fs-5 font-color-dark lh-8 ellipsis">{{ apiName }}</span>
      <el-tag
        v-if="apiDetail"
        type="info"
        class="is-code is-wrap px-1.5 font-mono ml-3"
        disable-transitions
      >
        {{ apiDetail.apiPath }}
      </el-tag>
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

              <el-tag type="danger" size="small" class="border-0"
                ><span class="fw-sub mr-1">{{
                  $t('api_monitor_error_rate')
                }}</span
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
              />
            </div>
            <div v-else class="status-value">--</div>
          </div>
        </div>
      </div>

      <!-- Server List Section -->
      <div class="server-list-section border">
        <div class="section-header mb-3 flex items-center justify-between">
          <h3 class="section-title">
            {{ t('api_monitor_server_distribution') }}
          </h3>
        </div>

        <el-table
          :data="serverList"
          class="server-list-table"
          :default-sort="serverListDefaultSort"
          @sort-change="handleServerListSortChange"
        >
          <el-table-column
            :label="t('api_monitor_server_name')"
            min-width="200"
          >
            <template #default="{ row }">
              <el-link type="primary" @click="onClickServer(row)">{{
                row.serverName
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_request_count')"
            prop="requestCount"
            width="120"
          />
          <el-table-column
            :label="t('api_monitor_error_rate')"
            prop="errorRate"
            width="100"
          >
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
          <el-table-column
            :label="t('api_monitor_avg_response_time')"
            prop="responseTimeAvg"
            width="140"
          >
            <template #default="{ row }">
              {{ row.responseTimeAvg ?? '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_max_response_time')"
            prop="maxDelay"
            width="100"
          >
            <template #default="{ row }"> {{ row.maxDelay }} </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_min_response_time')"
            prop="minDelay"
            width="100"
          >
            <template #default="{ row }"> {{ row.minDelay }} </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p95_response_time')"
            prop="p95"
            width="100"
          >
            <template #default="{ row }"> {{ row.p95 ?? '--' }} </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p99_response_time')"
            prop="p99"
            width="100"
          >
            <template #default="{ row }"> {{ row.p99 ?? '--' }} </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Response Time Trend Chart -->
      <div class="chart-section border">
        <h3 class="section-title mb-4">
          {{ t('api_monitor_response_time_trend') }}
        </h3>
        <div class="chart-container">
          <VChart :option="latencyChartOption" :autoresize="true" />
        </div>
      </div>

      <!-- Database Cost Trend Chart -->
      <div class="chart-section border">
        <h3 class="section-title mb-4">
          {{ t('api_monitor_db_cost_trend') }}
        </h3>
        <div class="chart-container">
          <VChart :option="dbCostChartOption" :autoresize="true" />
        </div>
      </div>

      <!-- Throughput Trend Chart -->
      <div class="chart-section border">
        <h3 class="section-title mb-4">{{ t('api_monitor_throughput') }}</h3>
        <div class="chart-container">
          <VChart :option="throughputChartOption" :autoresize="true" />
        </div>
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

.table-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.table-card {
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-table {
  :deep(.el-table__body-wrapper) {
    max-height: 400px;
    overflow-y: auto;
  }
}

.chart-section {
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.server-list-section {
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

.server-list-table {
  margin-top: 16px;

  .server-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .server-name {
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
</style>
