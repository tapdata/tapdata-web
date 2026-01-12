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
import { calcTimeUnit, calcUnit } from '@tap/shared'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { isNumber } from 'lodash-es'
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
const apiId = route.params.id as string
const apiDetail = ref<any>()
const apiChart = ref<ApiChart>()
const serverList = ref<any[]>([])

// 时间周期选择 - 从 route.query 中恢复
const timeRange = ref((route.query.timeRange as string) || '1h')
const customTimeRange = ref<[Date, Date] | null>(null)

// 从 query 中恢复自定义时间范围
onMounted(() => {
  if (route.query.customStart && route.query.customEnd) {
    customTimeRange.value = [
      new Date(route.query.customStart as string),
      new Date(route.query.customEnd as string),
    ]
    timeRange.value = 'custom'
  }
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

    apiDetail.value = await fetchMonitorApiDetail(apiId, params)
    apiChart.value = await fetchMonitorApiChart(apiId, params)
    serverList.value = await fetchMonitorApiServer(apiId, params)
  },
  {
    pollingInterval: 6000,
  },
)

const refreshData = () => {
  runFetch()
}

// Computed values for status overview
const totalCalls = computed(() => {
  if (!apiDetail.value?.requestCount) return '0'
  const count = apiDetail.value.requestCount
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
})

const errorRate = computed(() => {
  if (!apiDetail.value?.errorRate) return '0%'
  const rate = Number.parseFloat(apiDetail.value.errorRate)
  if (Number.isNaN(rate)) return '0%'
  return `${rate.toFixed(1)}%`
})

const avgLatency = computed(() => {
  if (!apiDetail.value?.requestCostAvg) return '0ms'
  return calcTimeUnit(apiDetail.value.requestCostAvg, 2, {
    keepDecimal: true,
    decimalPlaces: 2,
  })
})

const p95Latency = computed(() => {
  if (!apiDetail.value?.p95) return '0ms'
  return calcTimeUnit(apiDetail.value.p95, 2, {
    keepDecimal: true,
    decimalPlaces: 2,
  })
})

const p99Latency = computed(() => {
  if (!apiDetail.value?.p99) return '0ms'
  return calcTimeUnit(apiDetail.value.p99, 2, {
    keepDecimal: true,
    decimalPlaces: 2,
  })
})

// 吞吐量与延迟趋势图表（双轴）
const throughputLatencyChartOption = computed(() => {
  const dataLength = apiChart.value?.ts?.length || 0
  const isSinglePoint = dataLength === 1

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
      axisPointer: {
        type: 'cross',
      },
      borderRadius: 12,
      borderColor: '#dee0e3',
      extraCssText:
        'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
      padding: [8, 12],
      formatter: (params: any) => {
        const timestamp = params[0]?.axisValue
        const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
        let result = `${timeStr}<br/>`
        params.forEach((param: any, index: number) => {
          const value = isNumber(param.value)
            ? index === 0
              ? `${calcUnit(param.value, 'b')}/s`
              : calcTimeUnit(param.value)
            : '--'
          result += `${param.marker}${param.seriesName}: ${value}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['吞吐量', 'Avg', 'P95', 'P99'],
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
    yAxis: [
      {
        type: 'value',
        name: '吞吐量',
        position: 'left',
        axisLabel: {
          formatter(value: number) {
            return `${calcUnit(value, 'b')}/s`
          },
        },
      },
      {
        type: 'value',
        name: '延迟 (ms)',
        position: 'right',
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: '吞吐量',
        type: isSinglePoint ? 'scatter' : 'line',
        data: apiChart.value?.rps || [],
        smooth: !isSinglePoint,
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: isSinglePoint ? 12 : 8,
        showSymbol: true,
        showAllSymbol: true,
        lineStyle: {
          color: '#10b981',
          width: 2,
        },
        itemStyle: {
          color: '#10b981',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: isSinglePoint
          ? undefined
          : {
              color: 'rgba(16, 185, 129, 0.1)',
            },
      },
      {
        name: 'Avg',
        type: isSinglePoint ? 'scatter' : 'line',
        data: apiChart.value?.requestCostAvg || [],
        smooth: !isSinglePoint,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: isSinglePoint ? 12 : 8,
        showSymbol: true,
        showAllSymbol: true,
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
        type: isSinglePoint ? 'scatter' : 'line',
        data: apiChart.value?.p95 || [],
        smooth: !isSinglePoint,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: isSinglePoint ? 12 : 8,
        showSymbol: true,
        showAllSymbol: true,
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
        type: isSinglePoint ? 'scatter' : 'line',
        data: apiChart.value?.p99 || [],
        smooth: !isSinglePoint,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: isSinglePoint ? 12 : 8,
        showSymbol: true,
        showAllSymbol: true,
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
            customStart: customTimeRange.value[0].toISOString(),
            customEnd: customTimeRange.value[1].toISOString(),
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
          刷新
        </el-button>
      </div>
    </template>

    <div class="flex flex-column gap-6">
      <!-- Status Overview -->
      <div class="status-overview-card border mt-2">
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">总调用数</div>
            <div class="status-value">{{ totalCalls }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">错误率</div>
            <div class="status-value">{{ errorRate }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">平均耗时</div>
            <div class="status-value">{{ avgLatency }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">P95 延迟</div>
            <div class="status-value status-value-warning">
              {{ p95Latency }}
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">P99 延迟</div>
            <div class="status-value status-value-danger">{{ p99Latency }}</div>
          </div>
          <!-- <div class="status-item">
            <div class="status-label">吞吐量</div>
            <div class="status-value">{{ throughput }}</div>
          </div> -->
        </div>
      </div>

      <!-- Server List Section -->
      <div class="server-list-section border">
        <div class="section-header mb-3 flex items-center justify-between">
          <h3 class="section-title">各 Server 表现分布</h3>
        </div>

        <el-table :data="serverList" class="server-list-table">
          <el-table-column label="Server 名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="onClickServer(row)">{{
                row.serverName
              }}</el-link>
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
              {{ row.requestCostAvg }}
            </template>
          </el-table-column>
          <el-table-column label="P99 延迟" prop="p99" width="120">
            <template #default="{ row }"> {{ row.p99Time }} </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Throughput & Latency Trend Chart -->
      <div class="chart-section border">
        <h3 class="section-title mb-4">吞吐量与延迟趋势</h3>
        <div class="chart-container-large">
          <VChart :option="throughputLatencyChartOption" :autoresize="true" />
        </div>
      </div>
    </div>
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

.table-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.table-card {
  background: white;
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container-large {
  height: 400px;
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
