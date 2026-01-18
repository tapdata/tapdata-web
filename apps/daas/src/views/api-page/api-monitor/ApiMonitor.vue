<script setup lang="ts">
import {
  fetchMonitorApiList,
  fetchMonitorServer,
  fetchMonitorServerList,
  type ApiOverview,
  type MonitorServer,
  type ServerItem,
} from '@tap/api/src/core/monitor-server'
import { useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import CountUp from '@tap/component/src/CountUp.vue'
import { useI18n } from '@tap/i18n'
import { isString } from 'lodash-es'
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TimeRangeSelector from './components/TimeRangeSelector.vue'
import ServiceCard from './ServiceCard.vue'
import type { ApiServerCpuMem } from '@tap/api/src/core/api-server'
import type { TableInstance } from 'element-plus'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Refs
const isDestroyed = ref(false)
const timer = ref<number | null>(null)
const serverDetailsVisible = ref(false)
const serverDetails = ref<Partial<ApiServerCpuMem>>({})

// Reactive data
const serverData = ref<MonitorServer | {}>({})
const apiOverview = ref<ApiOverview | {}>({})
const serverList = ref<ServerItem[]>([])
const apiListData = ref<any[]>([])
const apiListDefaultSort = { prop: 'requestCount', order: 'descending' }
const apiListSortBy = ref(apiListDefaultSort.prop)
const apiListSortOrder = ref<'ASC' | 'DESC'>('DESC')
const tableRef = ref<TableInstance>()

// 排序处理函数
const handleSortChange = ({
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
  runFetch()
}

const currentTab = ref('server')

interface TopCardItem {
  title: string
  key: string
  sortKey?: string
  decimals?: number
  unit?: string
  value?: number | string
  class?: string
}

const serverTopCards = [
  {
    title: t('api_monitor_total_request_count'),
    key: 'totalRequestCount',
    sortKey: 'requestCount',
    decimals: 0,
  },
  {
    title: t('api_monitor_total_error_rate'),
    unit: '%',
    key: 'totalErrorRate',
    sortKey: 'errorRate',
  },
  {
    title: t('api_monitor_avg_response_time'),
    unit: 'ms',
    key: 'responseTimeAvg',
    sortKey: 'requestCostAvg',
  },
  {
    title: t('api_monitor_p95_response_time'),
    unit: 'ms',
    key: 'p95',
    class: 'color-warning',
  },
  {
    title: t('api_monitor_p99_response_time'),
    unit: 'ms',
    key: 'p99',
    class: 'color-danger',
  },
  {
    title: t('api_monitor_unhealthy_api_count'),
    key: 'notHealthyApiCount',
    sortKey: 'errorRate',
    class: 'color-danger',
    decimals: 0,
  },
]

const topCards = computed<TopCardItem[]>(() => {
  const data = serverData.value
  const items = serverTopCards

  return items.map((item) => {
    let value = (data as any)[item.key]
    let unit = item.unit ?? ''
    // 正则判断下 value 是不是带单位的
    if (isString(value)) {
      // 正则解析出value 和 unit
      const match = value.match(/(\d+(?:\.\d*)?)([a-z%/]+)?/i)
      if (match) {
        value = Number(match[1])
        unit = match[2] || unit
      }
    }
    return {
      ...item,
      value,
      unit,
    }
  })
})

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
  return {
    value: serverData.value?.totalRequestCount,
  }
})

const errorCount = computed(() => {
  return {
    value: serverData.value?.errorCount,
    errorRate: serverData.value?.totalErrorRate,
  }
})

const responseTimeAvg = computed(() => {
  const { value, unit } = matchValueUnit(serverData.value?.responseTimeAvg)
  return {
    value,
    unit,
    minDelay: serverData.value?.minDelay,
    maxDelay: serverData.value?.maxDelay,
  }
})

const p95 = computed(() => {
  const { value, unit } = matchValueUnit(serverData.value?.p95)
  return {
    value,
    unit,
  }
})

const p99 = computed(() => {
  const { value, unit } = matchValueUnit(serverData.value?.p99)
  return {
    value,
    unit,
  }
})

const notHealthyApiCount = computed(() => {
  return {
    value: serverData.value?.notHealthyApiCount,
  }
})

// 时间周期选择 - 从 route.query 中恢复
const timeRange = ref((route.query.timeRange as string) || '1h')
const customTimeRange = ref<[Date, Date] | null>(null)

// 获取实际的时间范围（返回10位时间戳，单位：秒）
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
const { run: runFetch, cancel: cancelFetch } = useRequest(
  async () => {
    const params = getActualTimeRange()

    serverData.value = await fetchMonitorServer(params)

    if (currentTab.value === 'api') {
      apiListData.value = await fetchMonitorApiList({
        ...params,
        orderBy: `${apiListSortBy.value} ${apiListSortOrder.value}`,
      })
      return
    }

    serverList.value = await fetchMonitorServerList(params)
  },
  {
    pollingInterval: 6000,
  },
)

// 刷新数据
const refreshData = () => {
  runFetch()
}

const handleViewServiceDetails = (data: any) => {
  router.push({
    name: 'apiMonitorServerDetail',
    params: { id: data.serverId },
    query: {
      name: data.serverName,
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
            customStart: customTimeRange.value[0],
            customEnd: customTimeRange.value[1],
          }
        : {}),
    },
  })
}

const handleSortApi = (sortKey: string) => {
  currentTab.value = 'api'
  nextTick(() => {
    setTimeout(() => {
      tableRef.value?.clearSort()
      tableRef.value?.sort(sortKey, 'descending')
    }, 50)
  })
}

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  isDestroyed.value = true
})
</script>

<template>
  <PageContainer
    mode="auto"
    container-class="bg-card rounded-xl shadow-sm gap-1"
    content-class="flex-1 min-h-0 overflow-auto p-6 position-relative flex flex-column"
  >
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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('requestCount')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_total_request_count') }}
          </div>
        </div>
        <div class="card-content">
          <div v-if="requestCount.value !== undefined" class="text-2xl fw-sub">
            <CountUp :end-val="requestCount.value" :duration="0.5" />
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('errorRate')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_total_error_count') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="errorCount.value !== undefined"
            class="text-2xl fw-sub flex align-items-end gap-2 color-danger"
          >
            <CountUp :end-val="errorCount.value" :duration="0.5" />
            <el-tag type="danger" size="small" class="mb-1"
              ><span>{{ $t('api_monitor_error_rate') }}</span
              >{{ errorCount.errorRate }}%</el-tag
            >
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('requestCostAvg')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_avg_response_time') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="responseTimeAvg.value !== undefined"
            class="text-2xl fw-sub flex align-items-end gap-2"
          >
            <CountUp :end-val="responseTimeAvg.value" :duration="0.5" />
            <el-tag size="small" class="is-code mb-1">
              {{ responseTimeAvg.minDelay }} - {{ responseTimeAvg.maxDelay }}
            </el-tag>
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('p95')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_p95_response_time') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="p95.value !== undefined"
            class="text-2xl fw-sub color-warning"
          >
            <CountUp :end-val="p95.value" :duration="0.5" />
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('p99')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_p99_response_time') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="p99.value !== undefined"
            class="text-2xl fw-sub color-danger"
          >
            <CountUp :end-val="p99.value" :duration="0.5" />
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('notHealthyApiCount')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_unhealthy_api_count') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="notHealthyApiCount.value !== undefined"
            class="text-2xl fw-sub color-danger"
          >
            <CountUp :end-val="notHealthyApiCount.value" :duration="0.5" />
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
    </div>

    <el-tabs v-model="currentTab" class="mt-4" @tab-change="runFetch">
      <el-tab-pane name="server">
        <template #label>
          <span> {{ t('api_monitor_tab_server') }} </span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="api">
        <template #label>
          <span> {{ t('api_monitor_tab_api') }} </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div v-if="currentTab === 'server'">
      <div class="service-grid">
        <ServiceCard
          v-for="item in serverList"
          :key="item.serverId"
          :data="item"
          @view-details="handleViewServiceDetails"
        />
      </div>
    </div>

    <div v-if="currentTab === 'api'">
      <div class="api-list-table">
        <el-table
          ref="tableRef"
          :data="apiListData"
          style="width: 100%"
          :default-sort="{ prop: 'requestCount', order: 'descending' }"
          @row-click="onClickApi"
          @sort-change="handleSortChange"
        >
          <el-table-column
            :label="t('api_monitor_total_api_list_name')"
            min-width="200"
          >
            <template #default="{ row }">
              <el-link type="primary">
                {{ row.apiName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column :label="t('api_monitor_api_path')" min-width="200">
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
          <el-table-column
            :label="t('api_monitor_total_request_count')"
            prop="requestCount"
            min-width="120"
            sortable="custom"
          />
          <el-table-column
            :label="t('api_monitor_avg_latency')"
            prop="requestCostAvg"
            width="120"
            sortable="custom"
          >
            <template #default="{ row }"> {{ row.requestCostAvg }} </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p95_latency')"
            prop="p95"
            width="120"
            sortable="custom"
          >
            <template #default="{ row }">
              <span :class="{ 'text-orange-500': row.p95 > 1000 }">
                {{ row.p95 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p99_latency')"
            prop="p99"
            width="120"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                :class="{
                  'text-orange-500': row.p99 > 1000 && row.p99 < 2000,
                  'text-red-500': row.p99 >= 2000,
                }"
              >
                {{ row.p99 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_error_rate')"
            prop="errorRate"
            width="120"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                :class="{
                  'text-orange-500': row.errorRate > 1 && row.errorRate < 3,
                  'text-red-500': row.errorRate >= 3,
                }"
              >
                {{ row.errorRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_throughput')"
            prop="totalRps"
            min-width="120"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.totalRps }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.api-monitor-wrap {
  display: flex;
  -ms-flex: 1;
  flex: 1;
  overflow: auto;
  .api-monitor__min__height {
    height: 342px;
  }
  .api-monitor-list__min__height {
    min-height: 300px;
  }

  .api-monitor-main {
    width: 100%;
  }
  .api-monitor-total__tittle {
    font-size: 18px;
    color: var(--text-dark);
    height: 30px;
  }
  .api-monitor-total__text {
    font-size: 36px;
    line-height: 72px;
    font-weight: 500;
    color: var(--color-primary);
  }
  .api-monitor-chart__text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-dark);
  }
  .api-monitor-card {
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }
  .api-monitor-chart {
    width: 300px;
  }
  //图表样式
  .circle-total {
    width: 4px;
    border-radius: 80px;
  }
  .circle-waring {
    width: 4px;
    border-radius: 80px;
  }
}

// 自定义时间选择器样式
.custom-time-picker {
  padding: 10px 0;

  .text-gray-500 {
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
  }
}

.server-item {
  min-width: 300px;
  &:hover:not(.border-warning) {
    border: 1px solid var(--el-color-primary) !important;
  }
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.api-list-table {
  // :deep(.el-table) {
  //   border-radius: 8px;
  //   overflow: hidden;
  // }

  // :deep(.el-table__header) {
  //   th {
  //     background-color: var(--el-fill-color-light);
  //     font-weight: 600;
  //     font-size: 12px;
  //     color: var(--el-text-color-secondary);
  //     text-transform: uppercase;
  //   }
  // }

  .method-tag {
    font-weight: 600;
    min-width: 60px;
    text-align: center;
  }

  .text-blue-600 {
    color: #2563eb;
    font-family: monospace;
  }

  .text-orange-500 {
    color: #f97316;
    font-weight: 600;
  }

  .text-red-500 {
    color: #ef4444;
    font-weight: 600;
  }
}
.top-card {
  transition: all 0.3s ease;
  &:hover {
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
  }
}
</style>
