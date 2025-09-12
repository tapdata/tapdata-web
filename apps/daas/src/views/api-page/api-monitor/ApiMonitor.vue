<script setup lang="ts">
import {
  fetchApiClientNames,
  fetchApiList,
  fetchApiMonitorPreview,
  fetchApiRankLists,
  fetchApiServerCpuMem,
  useRequest,
  type ApiServerCpuMem,
} from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { VTable } from '@tap/component/src/base/v-table'
import { Chart } from '@tap/component/src/chart'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import { escapeRegExp } from 'lodash-es'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Detail from './Detail.vue'
import ServerDetails from './ServerDetails.vue'

import type { TableInstance } from 'element-plus'

// Types
interface Column {
  label: string
  prop?: string
  slotName?: string
}

interface PreviewData {
  totalCount?: number
  warningApiCount?: number
  warningVisitTotalCount?: number
  visitTotalCount?: number
  visitTotalLine?: number
  transmitTotal?: number
  lastUpdAt?: string
}

interface ChartDataItem {
  itemStyle: {
    color: string
  }
  name: string
  value: number
}

interface FailRateItem {
  name: string
  failed: number
}

interface ApiItem {
  id: string
  name: string
  status: string
  visitLine: number
  visitCount: number
  transitQuantity: number
}

interface PageInfo {
  size: number
  failRateCurrent: number
  failRateTotal: number
  failRateOrder: 'ASC' | 'DESC'
  consumingTimeCurrent: number
  consumingTimeTotal: number
  consumingTimeOrder: 'ASC' | 'DESC'
  apiListCurrent: number
  apiListTotal: number
}

interface SearchParams {
  keyword: string
  clientName: string
  status: string
}

interface StatusOption {
  label: string
  value: string
}

interface ClientNameItem {
  label: string
  value: string
}

interface FilterItem {
  label?: string
  placeholder?: string
  key: string
  type: string
  items?: StatusOption[] | ClientNameItem[]
  selectedWidth?: string
}

// Composables
const { t } = useI18n()
const route = useRoute()

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

const searchParams = reactive<SearchParams>({
  keyword: '',
  clientName: '',
  status: '',
})

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

// Methods
const initData = () => {
  if (isDestroyed.value) return

  Promise.all([
    getPreview(),
    getClientName(),
    remoteFailedMethod(),
    consumingMethod(),
    getApiList(),
  ]).finally(() => {
    silenceLoading.value = true
    timer.value = setTimeout(() => {
      initData()
    }, 10000)
  })
}

const formatMs = (time: number): string | number => {
  if (time === 0 || !time) return 0
  if (time < 1000) return `${time} ms`
  return calcTimeUnit(time, 'ms', 2)
}

// 获取统计数据
const getPreview = () => {
  loadingTotal.value = !silenceLoading.value
  return fetchApiMonitorPreview()
    .then((data) => {
      data.lastUpdAt = data.lastUpdAt
        ? dayjs(data.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')
        : '-'
      Object.assign(previewData, data)
    })
    .finally(() => {
      loadingTotal.value = false
    })
}

// 获取所有客户端
const getClientName = () => {
  return fetchApiClientNames().then((data) => {
    clientNameList.value = data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }))
    getFilterItems()
  })
}

// 图表数据组装
const getPieOption = () => {
  const data: ChartDataItem[] = [
    {
      itemStyle: {
        color: '#8FD8C0',
      },
      name: t('api_monitor_total_successCount'),
      value: (previewData.totalCount || 0) - (previewData.warningApiCount || 0),
    },
    {
      itemStyle: {
        color: '#f7d762',
      },
      name: t('api_monitor_total_warningCount'),
      value: previewData.warningApiCount || 0,
    },
  ]
  chartData.value = data
  return {
    series: [
      {
        type: 'pie',
        data,
        radius: ['60%', '90%'],
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
      },
    ],
  }
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

// 处理失败率排序
const handleFDOrder = () => {
  const time = JSON.parse(JSON.stringify(page.failRateOrder))
  page.failRateOrder = time === 'DESC' ? 'ASC' : 'DESC'
  remoteFailedMethod()
}

// 响应时间排行榜
const consumingMethod = () => {
  const { consumingTimeCurrent, size, consumingTimeOrder } = page
  const filter = {
    where: {
      type: 'responseTime',
    },
    limit: size,
    order: consumingTimeOrder,
    skip: size * (consumingTimeCurrent - 1),
  }
  loadingTimeList.value = !silenceLoading.value
  return fetchApiRankLists(filter)
    .then((data) => {
      // map
      const items = data?.items?.map((item: any) => {
        const abj: FailRateItem = { name: '', failed: 0 }
        Object.keys(item).forEach((key) => {
          abj.name = key
          abj.failed = item[key]
        })
        return abj
      })
      page.consumingTimeTotal = data?.total || 0
      consumingTimeList.value = items || []
    })
    .finally(() => {
      loadingTimeList.value = false
    })
}

// 响应时间时间排序
const handleCTOrder = () => {
  const time = JSON.parse(JSON.stringify(page.consumingTimeOrder))
  page.consumingTimeOrder = time === 'DESC' ? 'ASC' : 'DESC'
  consumingMethod()
}

// 获取api列表数据
const getApiList = (pageNum?: number) => {
  if (pageNum) {
    page.apiListCurrent = pageNum
  }
  const { apiListCurrent } = page
  const { keyword, status, clientName } = searchParams

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

// api 列表筛选
const getFilterItems = () => {
  filterItems.value = [
    {
      label: t('api_monitor_total_api_list_status'),
      key: 'status',
      type: 'select-inner',
      items: statusOptions.value,
      selectedWidth: '200px',
    },
    {
      label: t('api_monitor_total_clientName'),
      key: 'clientName',
      type: 'select-inner',
      items: clientNameList.value,
      selectedWidth: '200px',
    },
    {
      placeholder: t('api_monitor_total_api_list_name'),
      key: 'keyword',
      type: 'input',
    },
  ]
}

// 控制手风琴（只展示一行)
const expandChange = (row: ApiItem, expandRows: ApiItem[]) => {
  if (expandRows.length > 1) {
    apiList.value.forEach((expandrow) => {
      if (row.id !== expandrow.id) {
        // 这里需要判断一下展开行的length>1
        // toggleRowExpansion 设置是否展开，true则展开
        table.value?.toggleRowExpansion(expandrow, false)
      }
    })
  }
}

const getStatusLabel = (status: string) => {
  return statusOptions.value.find((t) => t.value === status)?.label
}

const { data: apiServerList, loading: loadingApiServerList } = useRequest(
  async () => {
    const data = await fetchApiServerCpuMem()
    return data.map((item) => {
      return {
        ...item,
        pingWarning:
          Date.now() - item.pingTime > 10000
            ? dayjs(item.pingTime).fromNow(true)
            : '',
        metricValues: item.metricValues
          ? {
              cpuUsage: item.metricValues.cpuUsage
                ? `${Number(item.metricValues.cpuUsage.toFixed(2))}%`
                : '--',
              heapMemoryUsage: item.metricValues.heapMemoryUsage
                ? calcUnit(item.metricValues.heapMemoryUsage, 'b', 2)
                : '--',
            }
          : {
              cpuUsage: '--',
              heapMemoryUsage: '--',
            },
      }
    })
  },
  {
    pollingInterval: 10000,
  },
)

const handleServerClick = (item: Partial<ApiServerCpuMem>) => {
  serverDetails.value = item
  serverDetailsVisible.value = true
}

// Lifecycle
onMounted(() => {
  initData()
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  isDestroyed.value = true
})
</script>

<template>
  <PageContainer mode="blank" hide-header>
    <section class="api-monitor-wrap isCardBox">
      <main class="api-monitor-main">
        <div class="flex gap-5 mb-5">
          <section
            v-loading="loadingTotal"
            class="bg-white api-monitor-card rounded-xl flex-1"
          >
            <div class="p-6">
              <span class="fs-6">{{ t(route.meta.title as string) }}</span
              ><span class="fs-7 ml-3 font-color-sslight">
                {{ t('public_data_update_time') }}:
                {{ previewData.lastUpdAt }}</span
              >
            </div>

            <div class="flex">
              <div class="flex-1 text-center">
                <header class="api-monitor-total__tittle">
                  {{ t('api_monitor_total_totalCount') }}
                </header>
                <div class="api-monitor-total__text din-font">
                  {{ previewData.totalCount || 0 }}
                </div>
              </div>
              <div class="flex-1 text-center">
                <header class="api-monitor-total__tittle">
                  {{ t('api_monitor_total_warningVisitCount') }}
                </header>
                <div class="api-monitor-total__text din-font">
                  <el-tooltip
                    :open-delay="400"
                    :disabled="
                      !previewData.warningVisitTotalCount ||
                      previewData.warningVisitTotalCount < 1000
                    "
                    :content="`${previewData.warningVisitTotalCount}`"
                    placement="bottom"
                  >
                    <span>{{
                      calcUnit(previewData.warningVisitTotalCount || 0)
                    }}</span>
                  </el-tooltip>
                </div>
              </div>
              <div class="flex-1 text-center">
                <header class="api-monitor-total__tittle">
                  {{ t('api_monitor_total_warningApiCount') }}
                </header>
                <div class="api-monitor-total__text din-font">
                  <el-tooltip
                    :open-delay="400"
                    :disabled="
                      !previewData.visitTotalCount ||
                      previewData.visitTotalCount < 1000
                    "
                    :content="`${previewData.visitTotalCount}`"
                    placement="bottom"
                  >
                    <span>{{
                      calcUnit(previewData.visitTotalCount || 0)
                    }}</span>
                  </el-tooltip>
                </div>
              </div>
              <div class="flex-1 text-center">
                <header class="api-monitor-total__tittle">
                  {{ t('api_monitor_total_visitTotalLine') }}
                </header>
                <el-tooltip
                  :open-delay="400"
                  :disabled="
                    !previewData.visitTotalLine ||
                    previewData.visitTotalLine < 1000
                  "
                  :content="`${previewData.visitTotalLine}`"
                  placement="bottom"
                >
                  <div class="api-monitor-total__text din-font">
                    {{ calcUnit(previewData.visitTotalLine || 0) }}
                  </div>
                </el-tooltip>
              </div>
              <div class="flex-1 text-center">
                <header class="api-monitor-total__tittle">
                  {{ t('api_monitor_total_transmitTotal') }}
                </header>
                <div class="api-monitor-total__text din-font">
                  {{ calcUnit(previewData.transmitTotal, 'b') || 0 }}
                </div>
              </div>
            </div>
          </section>
          <div
            v-loading="loadingTotal"
            class="flex flex-column api-monitor-card bg-white overflow-hidden pt-5 rounded-xl"
          >
            <div class="api-monitor-chart__text mb-2 pl-5">
              {{ t('api_monitor_total_warningCount') }}
            </div>
            <div class="flex align-center flex-1 p-3">
              <Chart style="width: 140px" type="pie" :extend="getPieOption()" />
              <div class="flex flex-column gap-2 pr-2">
                <div class="flex">
                  <div
                    class="tooltip-bar my-0.5 ml-0.5 mr-2 rounded-pill"
                    style="width: 4px; background: #8fd8c0"
                  />
                  <div>
                    <div class="text-gray-500 lh-5">
                      {{ t('api_monitor_total_successCount') }}
                    </div>
                    <div class="fs-6 fw-sub lh-6">
                      {{
                        (previewData.totalCount || 0) -
                        (previewData.warningApiCount || 0)
                      }}
                    </div>
                  </div>
                </div>
                <div class="flex">
                  <div
                    class="tooltip-bar my-0.5 ml-0.5 mr-2 rounded-pill"
                    style="width: 4px; background: #f7d762"
                  />
                  <div>
                    <div class="text-gray-500 lh-5">
                      {{ t('api_monitor_total_warningCount') }}
                    </div>
                    <div class="fs-6 fw-sub lh-6">
                      {{ previewData.warningApiCount }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--api 排行榜 -->
        <section class="flex flex-direction mb-5 api-monitor__min__height">
          <section
            class="rounded-xl bg-white mb-5 api-monitor-card h-100"
            style="width: 380px"
          >
            <div class="p-5 fw-sub flex align-center gap-2 pb-3">
              <el-icon size="16" class="color-primary"
                ><i-lucide:server
              /></el-icon>
              {{ $t('api_monitor_server_title') }}
            </div>
            <div
              v-loading="loadingApiServerList"
              class="p-5 pt-0 flex flex-column gap-3"
            >
              <div
                v-for="item in apiServerList"
                :key="item.processId"
                class="border rounded-xl p-3 cursor-pointer server-item position-relative flex align-center"
                :class="{ 'border-warning': item.pingWarning }"
                @click="handleServerClick(item)"
              >
                <div class="flex-1">
                  <div class="flex align-center gap-2 mb-2 flex-wrap">
                    <el-tooltip
                      v-if="item.pingWarning"
                      :content="
                        $t('api_monitor_server_ping_warning', {
                          val: item.pingWarning,
                        })
                      "
                      placement="bottom"
                    >
                      <el-icon class="color-warning"
                        ><i-lucide:triangle-alert
                      /></el-icon>
                      <!-- <div class="rounded-pill w-2 h-2 bg-yellow-500" /> -->
                    </el-tooltip>

                    <div
                      v-else
                      class="rounded-pill w-2 h-2"
                      :class="`${item.status !== 'running' ? 'bg-red-500' : 'bg-green-500'}`"
                    />
                    <span>{{ item.name }}</span>
                    <span
                      v-if="item.pid"
                      class="font-mono text-gray-700 lh-4 border rounded-4 px-1.5 fs-8"
                      >{{ item.pid }}</span
                    >
                  </div>
                  <div class="flex gap-3">
                    <div class="flex align-center gap-2">
                      <el-icon class="color-primary"><i-lucide:cpu /></el-icon>
                      <span class="text-gray-600">CPU</span>
                      <span class="fw-sub ml-auto">{{
                        item.metricValues.cpuUsage
                      }}</span>
                    </div>
                    <div class="flex align-center gap-2">
                      <el-icon class="color-primary"
                        ><i-lucide:memory-stick
                      /></el-icon>
                      <span class="text-gray-600">{{
                        $t('api_monitor_memory')
                      }}</span>
                      <span class="fw-sub ml-auto">{{
                        item.metricValues.heapMemoryUsage
                      }}</span>
                    </div>
                  </div>
                </div>
                <el-icon color="var(--icon-n2)" class="">
                  <!-- <RightBoldOutlined /> -->
                  <i-lucide:chevron-right />
                </el-icon>
                <!-- <div class="flex align-center gap-2 fs-8">
                  <span class="text-gray-500">PID</span>
                  <span class="font-mono ml-auto text-gray-700">{{
                    item.workerPid || '666666'
                  }}</span>
                </div> -->
              </div>
              <!-- <el-table :data="apiServerList">
                <el-table-column prop="name" label="服务名称" />
                <el-table-column prop="metricValues.cpuUsage" label="% CPU" />
                <el-table-column
                  prop="metricValues.heapMemoryUsage"
                  label="内存"
                />
              </el-table> -->
            </div>
          </section>
          <div
            class="flex flex-column flex-1 bg-white api-monitor-table api-monitor-card overflow-hidden ml-5 mr-5 pl-5 pt-5 rounded-xl"
          >
            <div class="api-monitor-chart__text mb-2">
              {{ t('api_monitor_total_FailRate') }}
              <span
                class="api-monitor-triangle-bg position-relative ml-2"
                @click="handleFDOrder()"
              >
                <span
                  class="api-monitor-triangle position-absolute"
                  :class="{
                    'triangle-active': page.failRateOrder === 'ASC',
                  }"
                />
                <span
                  class="api-monitor-triangle-top position-absolute"
                  :class="{ 'active-top': page.failRateOrder === 'DESC' }"
                />
              </span>
            </div>
            <VTable
              v-loading="loadingFailRateList"
              height="100%"
              :has-pagination="false"
              :data="failRateList"
              :columns="columns"
            >
              <template #failed="{ row }">
                <span> {{ Math.round(row.failed * 100) }}</span>
              </template>
            </VTable>
            <el-pagination
              v-model:current-page="page.failRateCurrent"
              class="mb-5 mt-3 mr-3"
              layout="->,total, prev,pager, next"
              background
              :page-size="5"
              :total="page.failRateTotal"
              @current-change="remoteFailedMethod"
            />
          </div>
          <div
            class="flex flex-column flex-1 bg-white api-monitor-card overflow-hidden pl-5 pt-5 rounded-xl"
          >
            <div class="api-monitor-chart__text mb-2">
              {{ t('api_monitor_total_consumingTime') }}
              <span
                class="api-monitor-triangle-bg position-relative ml-2"
                @click="handleCTOrder()"
              >
                <span
                  class="api-monitor-triangle position-absolute"
                  :class="{
                    'triangle-active': page.consumingTimeOrder === 'ASC',
                  }"
                />
                <span
                  class="api-monitor-triangle-top position-absolute"
                  :class="{
                    'active-top': page.consumingTimeOrder === 'DESC',
                  }"
                />
              </span>
            </div>
            <VTable
              v-loading="loadingTimeList"
              height="100%"
              background
              :has-pagination="false"
              :data="consumingTimeList"
              :columns="columnsRT"
            >
              <template #failed="{ row }: { row: FailRateItem }">
                <span>
                  {{ formatMs(row.failed) }}
                </span>
              </template>
            </VTable>
            <el-pagination
              v-model:current-page="page.consumingTimeCurrent"
              class="mb-5 mt-3 mr-3"
              layout="->,total, prev,pager, next"
              background
              :page-size="5"
              :total="page.consumingTimeTotal"
              @current-change="consumingMethod"
            />
          </div>
        </section>
        <!--api list -->
        <section
          class="flex flex-column bg-white api-monitor-card api-monitor-list__min__height pl-5 pt-5 rounded-xl"
        >
          <header class="api-monitor-chart__text mb-2">
            {{ t('api_monitor_total_api_list') }}
          </header>
          <FilterBar
            v-model:value="searchParams"
            class="mb-4"
            :items="filterItems"
            @fetch="getApiList(1)"
          />
          <el-table
            ref="table"
            v-loading="loadingApiList"
            row-key="id"
            class="data-flow-list has-border-t"
            :data="apiList"
            :default-sort="{ prop: 'createTime', order: 'descending' }"
            @expand-change="expandChange"
          >
            <el-table-column type="expand" width="45">
              <template #default="{ row }">
                <Detail :id="row.id" />
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              :label="t('api_monitor_total_api_list_name')"
            />
            <el-table-column
              prop="status"
              :label="t('api_monitor_total_api_list_status')"
            >
              <template #default="{ row }">
                <span :class="[`status-${row.status}`, 'status-block', 'mr-2']">
                  {{ getStatusLabel(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="visitLine"
              :label="t('api_monitor_total_api_list_visitLine')"
            />
            <el-table-column
              prop="visitCount"
              :label="t('api_monitor_total_api_list_visitCount')"
            />
            <el-table-column
              prop="transitQuantity"
              :label="t('api_monitor_total_api_list_transitQuantity')"
            >
              <template #default="{ row }">
                <span>{{ calcUnit(row.transitQuantity, 'b') || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="page.apiListCurrent"
            class="mb-5 mt-5 mr-2"
            layout="->, total, prev, pager, next, jumper"
            background
            :page-size="5"
            :total="page.apiListTotal"
            @current-change="getApiList"
          />
        </section>
      </main>
    </section>

    <ServerDetails v-model="serverDetailsVisible" :server="serverDetails" />
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
  //排序样式
  .api-monitor-triangle-bg {
    width: 20px;
    height: 20px;
    top: 5px;
    display: inline-block;
    text-align: center;
    border-radius: 2px;
    cursor: pointer;
    &:hover {
      background: #eef3ff;
    }
  }
  .api-monitor-triangle {
    display: inline-block;
    width: 0;
    height: 0;
    left: 6px;
    top: 11px;
    border: 4px solid transparent;
    border-top-color: var(--icon-n2);
  }
  .triangle-active {
    border-top-color: var(--color-primary);
  }
  .api-monitor-triangle-top {
    display: inline-block;
    width: 0;
    height: 0;
    left: 6px;
    top: 0;
    border: 4px solid transparent;
    border-bottom-color: var(--icon-n2);
    cursor: pointer;
  }
  .active-top {
    border-bottom-color: var(--color-primary);
  }
}

.server-item {
  min-width: 300px;
  &:hover:not(.border-warning) {
    border: 1px solid var(--el-color-primary) !important;
  }
}
</style>
