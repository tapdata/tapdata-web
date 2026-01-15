<script setup lang="ts">
import { fetchApiList, fetchApiRankLists } from '@tap/api/src/core/api-monitor'
import {
  fetchMonitorApi,
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
import { useI18n } from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import { escapeRegExp, isString } from 'lodash-es'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
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
const loadingTimeList = ref(false)
const loadingApiList = ref(false)
const loadingFailRateList = ref(false)
const loadingTotal = ref(false)
const silenceLoading = ref(false)
const isDestroyed = ref(false)
const timer = ref<number | null>(null)
const table = ref<TableInstance>()
const serverDetailsVisible = ref(false)
const serverDetails = ref<Partial<ApiServerCpuMem>>({})

// Reactive data
const previewData = reactive<PreviewData>({})
const chartData = ref<ChartDataItem[]>([])
const failRateList = ref<FailRateItem[]>([])
const consumingTimeList = ref<FailRateItem[]>([])
const apiList = ref<ApiItem[]>([])
const filterItems = ref<FilterItem[]>([])
const clientNameList = ref<ClientNameItem[]>([])

const serverData = ref<MonitorServer | {}>({})
const apiOverview = ref<ApiOverview | {}>({})
const serverList = ref<ServerItem[]>([])
const apiListData = ref<any[]>([])
const apiListDefaultSort = { prop: 'requestCount', order: 'descending' }
const apiListSortBy = ref(apiListDefaultSort.prop)
const apiListSortOrder = ref<'ASC' | 'DESC'>('DESC')

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
  unit?: string
  value?: number | string
  class?: string
}

const serverTopCards = computed<TopCardItem[]>(() => [
  {
    title: t('api_monitor_total_request_count'),
    key: 'totalRequestCount',
  },
  {
    title: t('api_monitor_total_error_rate'),
    unit: '%',
    key: 'totalErrorRate',
  },
  {
    title: t('api_monitor_avg_response_time'),
    unit: 'ms',
    key: 'responseTimeAvg',
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
    class: 'color-danger',
  },
  {
    title: t('api_monitor_unhealthy_server_count'),
    key: 'notHealthyServerCount',
    class: 'color-danger',
  },
])

const apiTopCards = computed<TopCardItem[]>(() => [
  {
    title: t('api_monitor_total_request_count'),
    key: 'totalRequestCount',
  },
  {
    title: t('api_monitor_throughput'),
    key: 'totalRps',
  },
  {
    title: t('api_monitor_avg_response_time'),
    unit: 'ms',
    key: 'responseTimeAvg',
  },
])

const topCards = computed<TopCardItem[]>(() => {
  let data = apiOverview.value
  let items = apiTopCards.value
  if (currentTab.value === 'server') {
    data = serverData.value
    items = serverTopCards.value
  }
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

    if (currentTab.value === 'api') {
      apiOverview.value = await fetchMonitorApi(params)
      const apiListResult = await fetchMonitorApiList({
        ...params,
        orderBy: `${apiListSortBy.value} ${apiListSortOrder.value}`,
      })
      apiListData.value = apiListResult || []
      return
    }

    serverData.value = await fetchMonitorServer(params)
    serverList.value = await fetchMonitorServerList(params)
  },
  {
    pollingInterval: 6000,
  },
)

const page = reactive<PageInfo>({
  size: 5,
  failRateCurrent: 1,
  failRateTotal: 0,
  failRateOrder: 'DESC',
  consumingTimeCurrent: 1,
  consumingTimeTotal: 0,
  consumingTimeOrder: 'DESC',
  apiListCurrent: 1,
  apiListTotal: 0,
})

const searchParams = ref<SearchParams>({
  keyword: '',
  clientName: '',
  status: '',
})

// 刷新数据
const refreshData = () => {
  runFetch()
}

const statusOptions = computed<StatusOption[]>(() => [
  { label: t('task_list_status_all'), value: '' },
  {
    label: t('api_monitor_total_api_list_status_active'),
    value: 'active',
  },
  {
    label: t('api_monitor_total_api_list_status_pending'),
    value: 'pending',
  },
  {
    label: t('api_monitor_total_api_list_status_generating'),
    value: 'generating',
  },
])

const columns = computed<Column[]>(() => [
  {
    label: t('api_monitor_total_api_list_name'),
    prop: 'name',
  },
  {
    label: t('api_monitor_total_columns_failed'),
    slotName: 'failed',
    prop: 'failed',
    sortable: 'custom',
  },
])

const columnsRT = computed<Column[]>(() => [
  {
    label: t('api_monitor_total_api_list_name'),
    prop: 'name',
  },
  {
    label: t('api_monitor_total_rTime'),
    slotName: 'failed',
    prop: 'failed',
    sortable: 'custom',
  },
])

// Computed

// Watchers
watch(
  () => route.query,
  () => {
    // 只有api list 条件筛选才更新
    const { status, clientName } = route.query
    if (status || clientName) {
      getApiList(1)
    }
  },
)

const formatMs = (time: number): string | number => {
  if (time === 0 || !time) return 0
  if (time < 1000) return `${time} ms`
  return calcTimeUnit(time, 'ms', 2)
}

// 失败率排行榜
const remoteFailedMethod = () => {
  const { failRateCurrent, size, failRateOrder } = page
  const filter = {
    where: {
      type: 'failRate',
    },
    limit: size,
    order: failRateOrder,
    skip: size * (failRateCurrent - 1),
  }
  loadingFailRateList.value = !silenceLoading.value
  return fetchApiRankLists(filter)
    .then((data) => {
      const items = data?.items?.map((item: any) => {
        const abj: FailRateItem = { name: '', failed: 0 }
        Object.keys(item).forEach((key) => {
          abj.name = key
          abj.failed = item[key]
        })
        return abj
      })
      page.failRateTotal = data?.total || 0
      failRateList.value = items || []
    })
    .finally(() => {
      loadingFailRateList.value = false
    })
}

// 获取api列表数据
const getApiList = (pageNum?: number) => {
  if (pageNum) {
    page.apiListCurrent = pageNum
  }
  const { apiListCurrent } = page
  const { keyword, status, clientName } = searchParams.value

  const where: any = {}
  if (keyword && keyword.trim()) {
    where.name = { like: escapeRegExp(keyword), options: 'i' }
  }
  if (status) {
    where.status = status
  }
  if (clientName) {
    where.clientId = clientName
  }
  const filter = {
    order: 'createTime DESC',
    limit: 5,
    skip: (apiListCurrent - 1) * 5,
    where,
  }
  loadingApiList.value = !silenceLoading.value
  return fetchApiList(filter)
    .then((data) => {
      apiList.value = data.items
      page.apiListTotal = data.total
    })
    .finally(() => {
      loadingApiList.value = false
    })
}

// 生成模拟历史数据
const generateHistory = (current: number, points = 20) => {
  const history: number[] = []
  for (let i = 0; i < points; i++) {
    const variance = Math.random() * 20 - 10 // -10 到 +10 的随机波动
    const value = Math.max(0, Math.min(100, current + variance))
    history.push(Math.round(value))
  }
  return history
}

// 示例服务数据
const mockServices = ref([
  {
    id: '1',
    name: 'api-gateway-1',
    code: 'srv-001',
    status: 'Normal' as const,
    cpuUsage: 45,
    memoryUsage: 62,
    cpuHistory: generateHistory(45),
    memoryHistory: generateHistory(62),
    rps: 450,
    errorRate: 0.2,
    p95Latency: 95,
    p99Latency: 120,
  },
  {
    id: '2',
    name: 'user-service',
    code: 'srv-002',
    status: 'Warning' as const,
    cpuUsage: 78,
    memoryUsage: 85,
    cpuHistory: generateHistory(78),
    memoryHistory: generateHistory(85),
    rps: 320,
    errorRate: 1.5,
    p95Latency: 150,
    p99Latency: 200,
  },
  {
    id: '3',
    name: 'payment-service',
    code: 'srv-003',
    status: 'Normal' as const,
    cpuUsage: 35,
    memoryUsage: 48,
    cpuHistory: generateHistory(35),
    memoryHistory: generateHistory(48),
    rps: 180,
    errorRate: 0.1,
    p95Latency: 80,
    p99Latency: 110,
  },
  {
    id: '4',
    name: 'order-service',
    code: 'srv-004',
    status: 'Error' as const,
    cpuUsage: 92,
    memoryUsage: 95,
    cpuHistory: generateHistory(92),
    memoryHistory: generateHistory(95),
    rps: 520,
    errorRate: 5.2,
    p95Latency: 280,
    p99Latency: 350,
  },
])

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
    content-class="flex-1 min-h-0 overflow-auto px-6 pb-5 position-relative flex flex-column"
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
    <el-tabs
      v-model="currentTab"
      class="position-sticky top-0 z-10 bg-white dark:bg-transparent dark:backdrop-blur-md"
      @tab-change="runFetch"
    >
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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <div
        v-for="item in topCards"
        :key="item.key"
        class="border rounded-xl p-3 top-card"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">{{ item.title }}</div>
        </div>
        <div class="card-content">
          <div
            v-if="item.value !== undefined"
            class="text-2xl fw-sub"
            :class="item.class"
          >
            {{ item.value }}{{ item.unit }}
          </div>
          <div v-else class="text-2xl fw-sub">--</div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'server'" class="mt-8">
      <div
        class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4"
      >
        <h2 class="text-lg font-bold text-gray-800">
          {{ t('api_monitor_server_list') }}
        </h2>
      </div>

      <!-- 服务卡片网格 -->
      <div class="service-grid">
        <ServiceCard
          v-for="item in serverList"
          :key="item.serverId"
          :data="item"
          @view-details="handleViewServiceDetails"
        />
      </div>
    </div>

    <!-- API 列表 -->
    <div v-if="currentTab === 'api'" class="mt-8">
      <div
        class="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4"
      >
        <h2 class="text-lg font-bold text-gray-800">
          {{ t('api_monitor_api_list') }}
        </h2>
        <!-- <el-select
          v-model="apiListSortBy"
          placeholder="Sort by"
          style="width: 180px"
          @change="runFetch"
        >
          <el-option label="Sort by P99 Latency" value="p99" />
          <el-option label="Sort by P95 Latency" value="p95" />
          <el-option label="Sort by Error Rate" value="errorRate" />
          <el-option label="Sort by Total Calls" value="totalCalls" />
        </el-select> -->
      </div>

      <!-- API 列表表格 -->
      <div class="api-list-table">
        <el-table
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
            :label="t('api_monitor_total_calls')"
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

    <!-- 服务详情弹窗 -->
    <ServerDetails
      v-model:visible="serverDetailsVisible"
      :server-details="serverDetails"
    />
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
