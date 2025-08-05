<script>
import {
  fetchApiClientNames,
  fetchApiList,
  fetchApiMonitorPreview,
  fetchApiRankLists,
} from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { VTable } from '@tap/component/src/base/v-table'
import { Chart } from '@tap/component/src/chart'
import { FilterBar } from '@tap/component/src/filter-bar'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import { escapeRegExp } from 'lodash-es'

import Detail from './Detail'

export default {
  name: 'ApiMonitor',
  components: { Chart, VTable, FilterBar, Detail, PageContainer },
  data() {
    return {
      loadingTimeList: false,
      loadingApiList: false,
      loadingFailRateList: false,
      loadingTotal: false,
      silenceLoading: false,
      columns: [
        {
          label: this.$t('api_monitor_total_api_list_name'),
          prop: 'name',
        },
        {
          label: this.$t('api_monitor_total_columns_failed'),
          slotName: 'failed',
        },
      ],
      columnsRT: [
        {
          label: this.$t('api_monitor_total_api_list_name'),
          prop: 'name',
        },
        {
          label: this.$t('api_monitor_total_rTime'),
          slotName: 'failed',
        },
      ],
      previewData: {},
      chartData: [],
      failRateList: [],
      consumingTimeList: [],
      apiList: [],
      page: {
        size: 5,
        failRateCurrent: 1,
        failRateTotal: 0,
        failRateOrder: 'DESC',
        consumingTimeCurrent: 1,
        consumingTimeTotal: 0,
        consumingTimeOrder: 'DESC',
        apiListCurrent: 1,
        apiListTotal: 0,
      },
      filterItems: [],
      searchParams: {
        keyword: '',
        clientName: '',
        status: '',
      },
      clientNameList: [],
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        {
          label: this.$t('api_monitor_total_api_list_status_active'),
          value: 'active',
        },
        {
          label: this.$t('api_monitor_total_api_list_status_pending'),
          value: 'pending',
        },
        {
          label: this.$t('api_monitor_total_api_list_status_generating'),
          value: 'generating',
        },
      ],
    }
  },
  computed: {
    visitTotalCountText() {
      const count =
        this.previewData.visitTotalCount -
        this.previewData.warningVisitTotalCount
      if (isNaN(count)) return 0
      return Math.max(count, 0)
    },
  },
  watch: {
    '$route.query': function () {
      //只有api list 条件筛选才更新
      const { status, clientName } = this.$route.query
      if (status || clientName) {
        this.getApiList(1)
      }
    },
  },
  mounted() {
    this.initData()
  },
  unmounted() {
    clearTimeout(this.timer)
    this.isDestroyed = true
  },
  methods: {
    initData() {
      if (this.isDestroyed) return

      Promise.all([
        this.getPreview(),
        this.getClientName(),
        this.remoteFailedMethod(),
        this.consumingMethod(),
        this.getApiList(),
      ]).finally(() => {
        this.silenceLoading = true
        this.timer = setTimeout(() => {
          this.initData()
        }, 10000)
      })
    },
    calcUnit() {
      return calcUnit(...arguments)
    },
    formatMs(time) {
      if (time === 0 || !time) return 0
      if (time < 1000) return `${time} ms`
      return calcTimeUnit(time)
    },
    //获取统计数据
    getPreview() {
      this.loadingTotal = !this.silenceLoading
      return fetchApiMonitorPreview()
        .then((data) => {
          data.lastUpdAt = data.lastUpdAt
            ? dayjs(data.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')
            : '-'
          this.previewData = data
        })
        .finally(() => {
          this.loadingTotal = false
        })
    },
    //获取所有客户端
    getClientName() {
      return fetchApiClientNames().then((data) => {
        this.clientNameList = data.map((item) => ({
          label: item.name,
          value: item.id,
        }))
        this.getFilterItems()
      })
    },
    //图表数据组装
    getPieOption() {
      const data = [
        {
          itemStyle: {
            color: '#8FD8C0',
          },
          name: this.$t('api_monitor_total_successCount'),
          value:
            this.previewData?.totalCount - this.previewData?.warningApiCount,
        },
        {
          itemStyle: {
            color: '#f7d762',
          },
          name: this.$t('api_monitor_total_warningCount'),
          value: this.previewData?.warningApiCount,
        },
      ]
      this.chartData = data
      return {
        series: [
          {
            type: 'pie',
            data,
            radius: ['40%', '60%'],
            label: {
              overflow: 'break',
              fontSize: 10,
            },
            labelLine: {
              length: 10, // 缩短引导线长度
              length2: 10, // 控制引导线第二段长度
            },
          },
        ],
      }
    },
    //失败率排行榜
    remoteFailedMethod() {
      const { failRateCurrent, size, failRateOrder } = this.page
      const filter = {
        where: {
          type: 'failRate',
        },
        limit: size,
        order: failRateOrder,
        skip: size * (failRateCurrent - 1),
      }
      this.loadingFailRateList = !this.silenceLoading
      return fetchApiRankLists(filter)
        .then((data) => {
          const items = data?.items?.map((item) => {
            const abj = {}
            for (const key in item) {
              abj.name = key
              abj.failed = item[key]
            }
            return abj
          })
          this.page.failRateTotal = data?.total
          this.failRateList = items || []
        })
        .finally(() => {
          this.loadingFailRateList = false
        })
    },
    //处理失败率排序
    handleFDOrder() {
      const time = JSON.parse(JSON.stringify(this.page.failRateOrder))
      this.page.failRateOrder = time === 'DESC' ? 'ASC' : 'DESC'
      this.remoteFailedMethod()
    },
    //响应时间排行榜
    consumingMethod() {
      const { consumingTimeCurrent, size, consumingTimeOrder } = this.page
      const filter = {
        where: {
          type: 'responseTime',
        },
        limit: size,
        order: consumingTimeOrder,
        skip: size * (consumingTimeCurrent - 1),
      }
      this.loadingTimeList = !this.silenceLoading
      return fetchApiRankLists(filter)
        .then((data) => {
          //map
          const items = data?.items?.map((item) => {
            const abj = {}
            for (const key in item) {
              abj.name = key
              abj.failed = item[key]
            }
            return abj
          })
          this.page.consumingTimeTotal = data?.total
          this.consumingTimeList = items || []
        })
        .finally(() => {
          this.loadingTimeList = false
        })
    },
    //响应时间时间排序
    handleCTOrder() {
      const time = JSON.parse(JSON.stringify(this.page.consumingTimeOrder))
      this.page.consumingTimeOrder = time === 'DESC' ? 'ASC' : 'DESC'
      this.consumingMethod()
    },
    //获取api列表数据
    getApiList() {
      const { apiListCurrent } = this.page
      const { keyword, status, clientName } = this.searchParams

      const where = {}
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
      this.loadingApiList = !this.silenceLoading
      return fetchApiList(filter)
        .then((data) => {
          this.apiList = data.items
          this.page.apiListTotal = data.total
        })
        .finally(() => {
          this.loadingApiList = false
        })
    },
    //api 列表筛选
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('api_monitor_total_api_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions,
          selectedWidth: '200px',
        },
        {
          label: this.$t('api_monitor_total_clientName'),
          key: 'clientName',
          type: 'select-inner',
          items: this.clientNameList,
          selectedWidth: '200px',
        },
        {
          placeholder: this.$t('api_monitor_total_api_list_name'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    //控制手风琴（只展示一行)
    expandChange(row, expandRows) {
      if (expandRows.length > 1) {
        this.apiList.forEach((expandrow) => {
          if (row.id !== expandrow.id) {
            //这里需要判断一下展开行的length>1
            // toggleRowExpansion 设置是否展开，true则展开
            this.$refs.table.toggleRowExpansion(expandrow, false)
          }
        })
      }
    },

    getStatusLabel(status) {
      return this.statusOptions.find((t) => t.value === status)?.label
    },
  },
}
</script>

<template>
  <PageContainer mode="blank" hide-header>
    <section class="api-monitor-wrap isCardBox">
      <main class="api-monitor-main">
        <section
          v-loading="loadingTotal"
          class="bg-white api-monitor-card rounded-xl mb-5"
        >
          <div class="p-6">
            <span class="fs-6">{{ $t($route.meta.title) }}</span
            ><span class="fs-7 ml-3 font-color-sslight">
              {{ $t('public_data_update_time') }}:
              {{ previewData.lastUpdAt }}</span
            >
          </div>

          <div class="flex">
            <div class="flex-1 text-center">
              <header class="api-monitor-total__tittle">
                {{ $t('api_monitor_total_totalCount') }}
              </header>
              <div class="api-monitor-total__text din-font">
                {{ previewData.totalCount || 0 }}
              </div>
            </div>
            <div class="flex-1 text-center">
              <header class="api-monitor-total__tittle">
                {{ $t('api_monitor_total_warningVisitCount') }}
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
                    calcUnit(previewData.warningVisitTotalCount)
                  }}</span>
                </el-tooltip>
              </div>
            </div>
            <div class="flex-1 text-center">
              <header class="api-monitor-total__tittle">
                {{ $t('api_monitor_total_warningApiCount') }}
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
                  <span>{{ calcUnit(previewData.visitTotalCount) }}</span>
                </el-tooltip>
              </div>
            </div>
            <div class="flex-1 text-center">
              <header class="api-monitor-total__tittle">
                {{ $t('api_monitor_total_visitTotalLine') }}
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
                {{ $t('api_monitor_total_transmitTotal') }}
              </header>
              <div class="api-monitor-total__text din-font">
                {{ calcUnit(previewData.transmitTotal, 'b') || 0 }}
              </div>
            </div>
          </div>
        </section>
        <!--api 排行榜 -->
        <section
          class="flex flex-direction api-monitor-card mb-5 api-monitor__min__height"
        >
          <div
            v-loading="loadingTotal"
            class="flex flex-column api-monitor-chart api-monitor-card bg-white overflow-hidden pt-5 rounded-xl"
          >
            <div class="api-monitor-chart__text mb-2 pl-5">
              {{ $t('api_monitor_total_warningCount') }}
            </div>
            <Chart type="pie" :extend="getPieOption()" />
            <div class="flex ml-8 mb-8 mt-5 lh-sm">
              <div>
                <div class="mb-2">
                  <i class="circle-total mr-3 align-middle" /><span
                    class="mr-8 align-middle"
                    >{{ $t('api_monitor_total_successCount') }}</span
                  >
                </div>
                <div>
                  <i
                    class="circle-waring mr-3 align-middle"
                    style="background: #f7d762"
                  /><span class="mr-6 align-middle">{{
                    $t('api_monitor_total_warningCount')
                  }}</span>
                </div>
              </div>
              <div>
                <div class="mb-2">
                  <span class="align-middle">{{
                    previewData.totalCount - previewData.warningApiCount
                  }}</span>
                </div>
                <div>
                  <span class="align-middle">{{
                    previewData.warningApiCount
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-column flex-1 bg-white api-monitor-table api-monitor-card overflow-hidden ml-5 mr-5 pl-5 pt-5 rounded-xl"
          >
            <div class="api-monitor-chart__text mb-2">
              {{ $t('api_monitor_total_FailRate') }}
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
              ref="failRateList"
              v-loading="loadingFailRateList"
              height="100%"
              :has-pagination="false"
              :data="failRateList"
              :columns="columns"
            >
              <template #failed="scope">
                <span> {{ Math.round(scope.row.failed * 100) }}</span>
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
              {{ $t('api_monitor_total_consumingTime') }}
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
              ref="consumingTimeList"
              v-loading="loadingTimeList"
              height="100%"
              background
              :has-pagination="false"
              :data="consumingTimeList"
              :columns="columnsRT"
            >
              <template #failed="scope">
                <span>
                  {{ formatMs(scope.row.failed) }}
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
            {{ $t('api_monitor_total_api_list') }}
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
              :label="$t('api_monitor_total_api_list_name')"
            />
            <el-table-column
              prop="status"
              :label="$t('api_monitor_total_api_list_status')"
            >
              <template #default="{ row }">
                <span :class="[`status-${row.status}`, 'status-block', 'mr-2']">
                  {{ getStatusLabel(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="visitLine"
              :label="$t('api_monitor_total_api_list_visitLine')"
            />
            <el-table-column
              prop="visitCount"
              :label="$t('api_monitor_total_api_list_visitCount')"
            />
            <el-table-column
              prop="transitQuantity"
              :label="$t('api_monitor_total_api_list_transitQuantity')"
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
    font-size: 46px;
    line-height: 92px;
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
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #8fd8c0;
    display: inline-block;
  }
  .circle-waring {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-primary);
    display: inline-block;
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
</style>
