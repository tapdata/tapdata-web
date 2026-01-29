<script setup lang="ts">
import {
  fetchMonitorApiList,
  fetchMonitorServer,
  fetchMonitorServerList,
  type MonitorServer,
  type ServerItem,
} from '@tap/api/src/core/monitor-server'
import { usePagination, useRequest } from '@tap/api/src/request'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import CountUp from '@tap/component/src/CountUp.vue'
import { useI18n } from '@tap/i18n'
import { isString } from 'lodash-es'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TimeRangeSelector from './components/TimeRangeSelector.vue'
import ServiceCard from './ServiceCard.vue'
import type { TableInstance } from 'element-plus'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Refs
const isDestroyed = ref(false)
const timer = ref<number | null>(null)

// Reactive data
const serverData = ref<MonitorServer | {}>({})
const serverList = ref<ServerItem[]>([])
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
  apiListPage.value = 1 // 排序时重置到第一页
}

const currentTab = ref('server')

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
    queryFrom: serverData.value?.queryFrom,
    queryEnd: serverData.value?.queryEnd
  }
})

const responseTimeAvg = computed(() => {
  const { value, unit } = matchValueUnit(serverData.value?.responseTimeAvg)
  return {
    value,
    unit,
    minDelay: serverData.value?.minDelay,
    maxDelay: serverData.value?.maxDelay,
    queryFrom: serverData.value?.queryFrom,
    queryEnd: serverData.value?.queryEnd
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
const timeRangeParams = ref<{ startAt: number; endAt: number } | null>(null)

// 获取实际的时间范围（返回10位时间戳，单位：秒）
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
  ({
    current = defaultApiListParams.current,
    pageSize = defaultApiListParams.pageSize,
  } = {}) => {
    const params = {
      ...getActualTimeRange(),
      orderBy: `${apiListSortBy.value} ${apiListSortOrder.value}`,
      skip: (current - 1) * pageSize,
      limit: pageSize,
    }
    return fetchMonitorApiList(params)
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

const { run: runFetch, cancel: cancelFetch } = useRequest(
  async () => {
    const params = getActualTimeRange()

    serverData.value = await fetchMonitorServer(params)

    timeRangeParams.value = {
      startAt: serverData.value.queryFrom,
      endAt: serverData.value.queryEnd,
    }

    if (currentTab.value === 'api') {
      refreshApiList()
      return
    }

    serverList.value = await fetchMonitorServerList(params)
  },
  {
    pollingInterval: 6000,
    manual: true,
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

// 跳转到审计页面 - 错误率
const handleNavigateToAuditWithError = (row?: Record<string, any>) => {
  const query: any = {
    code: '500', // 失败的状态码
    start: row.queryFrom * 1000, // 转换为毫秒
    end: row.queryEnd * 1000, // 转换为毫秒
  }

  if (row.apiName) {
    query.keyword = row.apiName
  }

  const href = router.resolve({
    name: 'dataServerAuditList',
    query,
  }).href
  window.open(href, `Audit-${row.apiName}`)
}

// 跳转到审计页面 - 响应时间排序
const handleNavigateToAuditWithResponseTime = (
    row?: Record<string, any>,
  sortOrder: 'ASC' | 'DESC' = 'DESC',
) => {
  const query: any = {
    start: row.queryFrom * 1000, // 转换为毫秒
    end: row.queryEnd * 1000, // 转换为毫秒
    sortBy: 'latency',
    sortOrder,
  }

  if (row.apiName) {
    query.keyword = row.apiName
  }

  const href = router.resolve({
    name: 'dataServerAuditList',
    query,
  }).href
  window.open(href, `Audit-${row.apiName}`)
}

// 从 query 中恢复自定义时间范围
onMounted(() => {
  if (route.query.customStart && route.query.customEnd) {
    customTimeRange.value = [+route.query.customStart, +route.query.customEnd]
    timeRange.value = 'custom'
  }
  runFetch()
})

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
          {{ t('api_monitor_refresh') }}
        </el-button>
      </div>
    </template>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('requestCount')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_total_request_count') }}
          </div>
        </div>
        <div class="card-content font-semibold">
          <div v-if="requestCount.value !== undefined">
            <CountUp :end-val="requestCount.value" :duration="0.5" />
          </div>
          <div v-else>--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('errorCount')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_total_error_count') }}
          </div>
        </div>
        <div class="card-content">
          <div
            v-if="errorCount.value !== undefined"
            class="flex flex-column align-items-start gap-2 font-semibold"
            :class="{ 'color-danger': errorCount.value > 0 }"
          >
            <CountUp :end-val="errorCount.value" :duration="0.5" />
            <el-tag
              v-if="errorCount.errorRate"
              type="danger"
              size="small"
              class="border-0 fw-sub cursor-pointer"
              @click.stop="handleNavigateToAuditWithError(errorCount)"
              ><span class="mr-1">{{ $t('api_monitor_error_rate') }}</span
              >{{ errorCount.errorRate }}</el-tag
            >
          </div>
          <div v-else>--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('errorCount')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_unhealthy_api_count') }}
          </div>
        </div>
        <div class="card-content font-semibold">
          <div
            v-if="notHealthyApiCount.value !== undefined"
            :class="{ 'color-danger': notHealthyApiCount.value > 0 }"
          >
            <CountUp :end-val="notHealthyApiCount.value" :duration="0.5" />
          </div>
          <div v-else>--</div>
        </div>
      </div>
      <div
        class="border rounded-xl p-3 top-card cursor-pointer"
        @click="handleSortApi('responseTimeAvg')"
      >
        <div class="card-header mb-6">
          <div class="card-title font-color-light">
            {{ $t('api_monitor_avg_response_time') }}
          </div>
        </div>
        <div class="card-content font-semibold">
          <div
            v-if="responseTimeAvg.value !== undefined"
            class="gap-2 flex flex-column align-items-start"
          >
            <CountUp
              :end-val="responseTimeAvg.value"
              :suffix="responseTimeAvg.unit"
              :duration="0.5"
              :decimals="2"
            />
            <div class="flex align-center gap-1 flex-wrap">
              <el-tag
                v-if="responseTimeAvg.maxDelay !== undefined"
                size="small"
                class="is-code fw-sub cursor-pointer"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(responseTimeAvg, 'DESC')
                "
              >
                <span class="mr-1">Max</span>{{ responseTimeAvg.maxDelay }}
              </el-tag>
              <el-tag
                v-if="responseTimeAvg.minDelay !== undefined"
                size="small"
                class="is-code fw-sub cursor-pointer"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(responseTimeAvg, 'ASC')
                "
              >
                <span class="mr-1">Min</span>{{ responseTimeAvg.minDelay }}
              </el-tag>
            </div>
          </div>
          <div v-else>--</div>
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
        <div class="card-content font-semibold">
          <div v-if="p95.value !== undefined">
            <CountUp
              :end-val="p95.value"
              :suffix="p95.unit"
              :duration="0.5"
              :decimals="2"
            />
          </div>
          <div v-else>--</div>
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
        <div class="card-content font-semibold">
          <div v-if="p99.value !== undefined">
            <CountUp
              :end-val="p99.value"
              :suffix="p99.unit"
              :duration="0.5"
              :decimals="2"
            />
          </div>
          <div v-else>--</div>
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
          :data="apiListData.items"
          style="width: 100%"
          :default-sort="{ prop: 'requestCount', order: 'descending' }"
          @row-click="onClickApi"
          @sort-change="handleSortChange"
        >
          <el-table-column
            :label="t('api_monitor_total_api_list_name')"
            min-width="200"
            fixed
          >
            <template #default="{ row }">
              <div class="flex flex-wrap align-center gap-2">
                <el-link type="primary">
                  {{ row.apiName }}
                </el-link>
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
            :label="t('api_monitor_total_request_count')"
            prop="requestCount"
            width="120"
            sortable="custom"
          />
          <el-table-column
            :label="t('api_monitor_error_count')"
            prop="errorCount"
            width="130"
            sortable="custom"
          >
            <template #default="{ row }">
              <span
                v-if="row.errorCount > 0"
                class="color-danger cursor-pointer is-external-link flex align-center gap-1 flex-wrap"
                @click.stop="handleNavigateToAuditWithError(row)"
              >
                {{ row.errorCount }}
                ({{ row.errorRate }})
                <el-icon>
                  <i-lucide-external-link />
                </el-icon>
              </span>
              <span v-else-if="row.errorCount === 0">0 </span>
              <span v-else> -- </span>
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
                class="is-external-link cursor-pointer flex align-center gap-1"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(row, 'DESC')
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
                class="is-external-link cursor-pointer flex align-center gap-1"
                @click.stop="
                  handleNavigateToAuditWithResponseTime(row, 'ASC')
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
            <template #default="{ row }">
              <span>
                {{ row.p95 ?? '--' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_p99_response_time')"
            prop="p99"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }">
              <span>
                {{ row.p99 ?? '--' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('api_monitor_throughput')"
            prop="totalRps"
            width="126"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.totalRps }}
            </template>
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
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.card-content {
  font-size: 2rem;
}
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
.is-external-link {
  text-decoration-line: underline;
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  text-decoration-color: currentColor;
  &:hover {
    text-decoration-style: solid;
  }
}
</style>
