<template>
  <section class="api-monitor-wrap isCardBox">
    <main class="api-monitor-main">
      <!--api 统计 -->
      <el-row :gutter="40" class="section-header py-6">
        <el-col :span="18" class="isCard-title"
          >{{ $t($route.meta.title)
          }}<span class="fs-7 ml-3 font-color-sslight">
            {{ $t('public_data_update_time') }}: {{ previewData.lastUpdAt }}</span
          ></el-col
        >
      </el-row>
      <section class="flex flex-direction bg-white api-monitor-card mb-5" v-loading="loadingTotal">
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_totalCount') }}</header>
          <div class="api-monitor-total__text din-font">{{ previewData.totalCount || 0 }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_warningVisitCount') }}</header>
          <div class="api-monitor-total__text din-font">
            <el-tooltip
              :open-delay="400"
              :disabled="!previewData.warningVisitTotalCount || previewData.warningVisitTotalCount < 1000"
              :content="`${previewData.warningVisitTotalCount}`"
              placement="bottom"
            >
              <span>{{ calcUnit(previewData.warningVisitTotalCount) }}</span>
            </el-tooltip>
          </div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_warningApiCount') }}</header>
          <div class="api-monitor-total__text din-font">
            <el-tooltip
              :open-delay="400"
              :disabled="!previewData.visitTotalCount || previewData.visitTotalCount < 1000"
              :content="`${previewData.visitTotalCount}`"
              placement="bottom"
            >
              <span>{{ calcUnit(previewData.visitTotalCount) }}</span>
            </el-tooltip>
          </div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_visitTotalLine') }}</header>
          <el-tooltip
            :open-delay="400"
            :disabled="!previewData.visitTotalLine || previewData.visitTotalLine < 1000"
            :content="`${previewData.visitTotalLine}`"
            placement="bottom"
          >
            <div class="api-monitor-total__text din-font">{{ calcUnit(previewData.visitTotalLine || 0) }}</div>
          </el-tooltip>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_transmitTotal') }}</header>
          <div class="api-monitor-total__text din-font">{{ calcUnit(previewData.transmitTotal, 'b') || 0 }}</div>
        </div>
      </section>
      <!--api 排行榜 -->
      <section class="flex flex-direction api-monitor-card mb-5 api-monitor__min__height">
        <div
          class="flex flex-column api-monitor-chart api-monitor-card bg-white overflow-hidden pt-5"
          v-loading="loadingTotal"
        >
          <div class="api-monitor-chart__text mb-2 pl-5">{{ $t('api_monitor_total_warningCount') }}</div>
          <Chart type="pie" :extend="getPieOption()"></Chart>
          <div class="flex ml-8 mb-8 mt-5 lh-sm">
            <div>
              <div class="mb-2">
                <i class="circle-total mr-3 align-middle"></i
                ><span class="mr-8 align-middle">{{ $t('api_monitor_total_successCount') }}</span>
              </div>
              <div>
                <i class="circle-waring mr-3 align-middle" style="background: #f7d762"></i
                ><span class="mr-6 align-middle">{{ $t('api_monitor_total_warningCount') }}</span>
              </div>
            </div>
            <div>
              <div class="mb-2">
                <span class="align-middle">{{ previewData.totalCount - previewData.warningApiCount }}</span>
              </div>
              <div>
                <span class="align-middle">{{ previewData.warningApiCount }}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex flex-column flex-1 bg-white api-monitor-table api-monitor-card overflow-hidden ml-5 mr-5 pl-5 pt-5"
        >
          <div class="api-monitor-chart__text mb-2">
            {{ $t('api_monitor_total_FailRate') }}
            <span class="api-monitor-triangle-bg position-relative ml-2" @click="handleFDOrder()">
              <span
                class="api-monitor-triangle position-absolute"
                :class="{ 'triangle-active': this.page.failRateOrder === 'ASC' }"
              ></span>
              <span
                class="api-monitor-triangle-top position-absolute"
                :class="{ 'active-top': this.page.failRateOrder === 'DESC' }"
              ></span>
            </span>
          </div>
          <VTable
            height="100%"
            ref="failRateList"
            v-loading="loadingFailRateList"
            :has-pagination="false"
            :data="failRateList"
            :columns="columns"
          >
            <template slot="failed" slot-scope="scope">
              <span> {{ Math.round(scope.row.failed * 100) }}</span>
            </template>
          </VTable>
          <el-pagination
            class="mb-5 mr-2"
            layout="->,total, prev,pager, next"
            background
            :page-size="5"
            :current-page.sync="page.failRateCurrent"
            :total="page.failRateTotal"
            @current-change="remoteFailedMethod"
          >
          </el-pagination>
        </div>
        <div class="flex flex-column flex-1 bg-white api-monitor-card overflow-hidden pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">
            {{ $t('api_monitor_total_consumingTime') }}
            <span class="api-monitor-triangle-bg position-relative ml-2" @click="handleCTOrder()">
              <span
                class="api-monitor-triangle position-absolute"
                :class="{ 'triangle-active': this.page.consumingTimeOrder === 'ASC' }"
              ></span>
              <span
                class="api-monitor-triangle-top position-absolute"
                :class="{ 'active-top': this.page.consumingTimeOrder === 'DESC' }"
              ></span>
            </span>
          </div>
          <VTable
            height="100%"
            v-loading="loadingTimeList"
            background
            :has-pagination="false"
            :data="consumingTimeList"
            :columns="columnsRT"
            ref="consumingTimeList"
          >
            <template slot="failed" slot-scope="scope">
              <span>
                {{ formatMs(scope.row.failed) }}
              </span>
            </template>
          </VTable>
          <el-pagination
            class="mb-5 mr-2"
            layout="->,total, prev,pager, next"
            background
            :page-size="5"
            :current-page.sync="page.consumingTimeCurrent"
            :total="page.consumingTimeTotal"
            @current-change="consumingMethod"
          >
          </el-pagination>
        </div>
      </section>
      <!--api list -->
      <section class="flex flex-column bg-white api-monitor-card api-monitor-list__min__height pl-5 pt-5">
        <header class="api-monitor-chart__text mb-2">{{ $t('api_monitor_total_api_list') }}</header>
        <FilterBar class="mb-2" v-model="searchParams" :items="filterItems" @fetch="getApiList(1)"> </FilterBar>
        <el-table
          ref="table"
          row-key="id"
          class="data-flow-list"
          v-loading="loadingApiList"
          :data="apiList"
          :default-sort="{ prop: 'createTime', order: 'descending' }"
          @expand-change="expandChange"
        >
          <el-table-column type="expand" width="45">
            <template #default="{ row }">
              <Detail :id="row.id"></Detail>
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="$t('api_monitor_total_api_list_name')"> </el-table-column>
          <el-table-column prop="status" :label="$t('api_monitor_total_api_list_status')">
            <template #default="{ row }">
              <span :class="['status-' + row.status, 'status-block', 'mr-2']">
                {{ getStatusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="visitLine" :label="$t('api_monitor_total_api_list_visitLine')"> </el-table-column>
          <el-table-column prop="visitCount" :label="$t('api_monitor_total_api_list_visitCount')"> </el-table-column>
          <el-table-column prop="transitQuantity" :label="$t('api_monitor_total_api_list_transitQuantity')">
            <template #default="{ row }">
              <span>{{ calcUnit(row.transitQuantity, 'b') || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="mb-5 mt-5 mr-2"
          layout="->, total, prev, pager, next, jumper"
          background
          :page-size="5"
          :current-page.sync="page.apiListCurrent"
          :total="page.apiListTotal"
          @current-change="getApiList"
        >
        </el-pagination>
      </section>
    </main>
  </section>
</template>

<script>
import { escapeRegExp } from 'lodash'
import { Chart, FilterBar, VTable } from '@tap/component'
import { dayjs } from '@tap/business'
import { apiMonitorApi } from '@tap/api'
import { calcTimeUnit, calcUnit } from '@tap/shared'

import Detail from './Detail'

export default {
  name: 'ApiMonitor',
  components: { Chart, VTable, FilterBar, Detail },
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
          prop: 'name'
        },
        {
          label: this.$t('api_monitor_total_columns_failed'),
          slotName: 'failed'
        }
      ],
      columnsRT: [
        {
          label: this.$t('api_monitor_total_api_list_name'),
          prop: 'name'
        },
        {
          label: this.$t('api_monitor_total_rTime'),
          slotName: 'failed'
        }
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
        apiListTotal: 0
      },
      filterItems: [],
      searchParams: {
        keyword: '',
        clientName: '',
        status: ''
      },
      clientNameList: [],
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        { label: this.$t('api_monitor_total_api_list_status_active'), value: 'active' },
        { label: this.$t('api_monitor_total_api_list_status_pending'), value: 'pending' },
        { label: this.$t('api_monitor_total_api_list_status_generating'), value: 'generating' }
      ]
    }
  },
  computed: {
    visitTotalCountText() {
      let count = this.previewData.visitTotalCount - this.previewData.warningVisitTotalCount
      if (isNaN(count)) return 0
      return count < 0 ? 0 : count
    }
  },
  watch: {
    '$route.query'() {
      //只有api list 条件筛选才更新
      let { status, clientName } = this.$route.query
      if (status || clientName) {
        this.getApiList(1)
      }
    }
  },
  mounted() {
    this.initData()
  },
  destroyed() {
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
        this.getApiList()
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
      if (time < 1000) return time + ' ms'
      return calcTimeUnit(time)
    },
    //获取统计数据
    getPreview() {
      this.loadingTotal = !this.silenceLoading
      return apiMonitorApi
        .preview()
        .then(data => {
          data.lastUpdAt = data.lastUpdAt ? dayjs(data.lastUpdAt).format('YYYY-MM-DD HH:mm:ss') : '-'
          this.previewData = data
        })
        .finally(() => {
          this.loadingTotal = false
        })
    },
    //获取所有客户端
    getClientName() {
      return apiMonitorApi.apiClientName().then(data => {
        //重组数据
        if (data?.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let obj = {
              label: data[i].name,
              value: data[i].id
            }
            this.clientNameList.push(obj)
          }
        }
        this.getFilterItems()
      })
    },
    //图表数据组装
    getPieOption() {
      let data = [
        {
          itemStyle: {
            color: '#8FD8C0'
          },
          name: this.$t('api_monitor_total_successCount'),
          value: this.previewData?.totalCount - this.previewData?.warningApiCount
        },
        {
          itemStyle: {
            color: '#f7d762'
          },
          name: this.$t('api_monitor_total_warningCount'),
          value: this.previewData?.warningApiCount
        }
      ]
      this.chartData = data
      return {
        series: [
          {
            type: 'pie',
            data: data,
            radius: ['40%', '60%'],
            label: {
              overflow: 'break',
              fontSize: 10
            },
            labelLine: {
              length: 10, // 缩短引导线长度
              length2: 10 // 控制引导线第二段长度
            }
          }
        ]
      }
    },
    //失败率排行榜
    remoteFailedMethod() {
      let { failRateCurrent, size, failRateOrder } = this.page
      let filter = {
        where: {
          type: 'failRate'
        },
        limit: size,
        order: failRateOrder,
        skip: size * (failRateCurrent - 1)
      }
      this.loadingFailRateList = !this.silenceLoading
      return apiMonitorApi
        .rankLists({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let items = data?.items?.map(item => {
            let abj = {}
            for (let key in item) {
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
      let time = JSON.parse(JSON.stringify(this.page.failRateOrder))
      this.page.failRateOrder = time === 'DESC' ? 'ASC' : 'DESC'
      this.remoteFailedMethod()
    },
    //响应时间排行榜
    consumingMethod() {
      let { consumingTimeCurrent, size, consumingTimeOrder } = this.page
      let filter = {
        where: {
          type: 'responseTime'
        },
        limit: size,
        order: consumingTimeOrder,
        skip: size * (consumingTimeCurrent - 1)
      }
      this.loadingTimeList = !this.silenceLoading
      return apiMonitorApi
        .rankLists({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          //map
          let items = data?.items?.map(item => {
            let abj = {}
            for (let key in item) {
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
      let time = JSON.parse(JSON.stringify(this.page.consumingTimeOrder))
      this.page.consumingTimeOrder = time === 'DESC' ? 'ASC' : 'DESC'
      this.consumingMethod()
    },
    //获取api列表数据
    getApiList() {
      let { apiListCurrent } = this.page
      let { keyword, status, clientName } = this.searchParams

      let where = {}
      if (keyword && keyword.trim()) {
        where.name = { like: escapeRegExp(keyword), options: 'i' }
      }
      if (status) {
        where.status = status
      }
      if (clientName) {
        where.clientId = clientName
      }
      let filter = {
        order: 'createTime DESC',
        limit: 5,
        skip: (apiListCurrent - 1) * 5,
        where
      }
      this.loadingApiList = !this.silenceLoading
      return apiMonitorApi
        .apiList({
          filter: JSON.stringify(filter)
        })
        .then(data => {
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
          selectedWidth: '200px'
        },
        {
          label: this.$t('api_monitor_total_clientName'),
          key: 'clientName',
          type: 'select-inner',
          items: this.clientNameList,
          selectedWidth: '200px'
        },
        {
          placeholder: this.$t('api_monitor_total_api_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    //控制手风琴（只展示一行)
    expandChange(row, expandRows) {
      if (expandRows.length > 1) {
        this.apiList.forEach(expandrow => {
          if (row.id !== expandrow.id) {
            //这里需要判断一下展开行的length>1
            // toggleRowExpansion 设置是否展开，true则展开
            this.$refs.table.toggleRowExpansion(expandrow, false)
          }
        })
      }
    },

    getStatusLabel(status) {
      return this.statusOptions.find(t => t.value === status)?.label
    }
  }
}
</script>

<style scoped lang="scss">
.api-monitor-wrap {
  display: flex;
  -ms-flex: 1;
  flex: 1;
  background-color: #eff1f4;
  overflow: auto;
  .api-monitor__min__height {
    height: 342px;
  }
  .api-monitor-list__min__height {
    min-height: 300px;
  }
  // ::v-deep {
  //   .el-table__header th {
  //     font-weight: 500;
  //   }
  //   .el-table--scrollable-y .el-table__body-wrapper {
  //     overflow: hidden;
  //   }
  // }

  .api-monitor-main {
    width: 100%;
  }
  .api-monitor-total__tittle {
    font-size: 18px;
    color: map-get($fontColor, dark);
    height: 30px;
  }
  .api-monitor-total__text {
    font-size: 46px;
    line-height: 92px;
    font-weight: 500;
    color: map-get($color, primary);
  }
  .api-monitor-chart__text {
    font-size: 14px;
    font-weight: 500;
    color: map-get($fontColor, dark);
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
    background: map-get($color, primary);
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
    border-top-color: map-get($iconFillColor, normal);
  }
  .triangle-active {
    border-top-color: map-get($color, primary);
  }
  .api-monitor-triangle-top {
    display: inline-block;
    width: 0;
    height: 0;
    left: 6px;
    top: 0;
    border: 4px solid transparent;
    border-bottom-color: map-get($iconFillColor, normal);
    cursor: pointer;
  }
  .active-top {
    border-bottom-color: map-get($color, primary);
  }
}
</style>
