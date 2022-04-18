<template>
  <section class="api-monitor-wrap">
    <main class="api-monitor-main">
      <!--api t统计 -->
      <section class="flex flex-direction bg-white api-monitor-card mb-5">
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_totalCount') }}</header>
          <div class="api-monitor-total__text din-font">{{ previewData.totalCount }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_warningApiCount') }}</header>
          <div class="api-monitor-total__text din-font" v-if="previewData.visitTotalCount">
            {{
              previewData.visitTotalCount - previewData.warningApiCount < 0
                ? 0
                : previewData.visitTotalCount - previewData.warningApiCount
            }}/{{ previewData.visitTotalCount }}
          </div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_visitTotalLine') }}</header>
          <div class="api-monitor-total__text din-font">{{ previewData.visitTotalLine }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">{{ $t('api_monitor_total_transmitTotal') }}</header>
          <div class="api-monitor-total__text din-font">{{ handleUnit(previewData.transmitTotal) || 0 }}</div>
        </div>
      </section>
      <!--api 排行榜 -->
      <section class="flex flex-direction api-monitor-card mb-5 api-monitor__min__height">
        <div class="flex flex-column api-monitor-chart api-monitor-card bg-white pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">{{ $t('api_monitor_total_warningCount') }}</div>
          <Chart type="pie" :extend="getPieOption()" class="type-chart"></Chart>
          <div class="ml-8 mb-8 mt-5">
            <div>
              <i class="circle-total mr-3"></i><span class="mr-8">{{ $t('api_monitor_total_totalCount') }}</span
              ><span> {{ previewData.totalCount }}</span>
            </div>
            <div class="mt-2">
              <i class="circle-waring mr-3"></i><span class="mr-6">{{ $t('api_monitor_total_warningCount') }}</span
              ><span> {{ previewData.warningApiCount }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-column flex-1 bg-white api-monitor-table api-monitor-card ml-5 mr-5 pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">
            {{ $t('api_monitor_total_FailRate') }} <span icon="el-icon-d-caret" @click="handleFDOrder">排序</span>
          </div>
          <TableList
            height="100%"
            ref="failRateList"
            v-loading="loadingFailRateList"
            :has-pagination="false"
            :data="failRateList"
            :columns="columns"
          ></TableList>
          <el-pagination
            layout="->,total, prev, next"
            :current-page.sync="page.failRateCurrent"
            :total="page.failRateTotal"
            @current-change="remoteFailedMethod"
          >
          </el-pagination>
        </div>
        <div class="flex flex-column flex-1 bg-white api-monitor-card pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">
            {{ $t('api_monitor_total_consumingTime') }}
            <span class="api-monitor-triangle-top" @click="handleCTOrder"></span>
            <span class="api-monitor-triangle" @click="handleCTOrder"></span>
          </div>
          <TableList
            height="100%"
            v-loading="loadingTimeList"
            :has-pagination="false"
            :data="consumingTimeList"
            :columns="columns"
            ref="consumingTimeList"
          ></TableList>
          <el-pagination
            layout="->,total, prev, next"
            :current-page.sync="page.consumingTimeCurrent"
            :total="page.consumingTimeTotal"
            @current-change="consumingMethod"
          >
          </el-pagination>
        </div>
      </section>
      <!--api list -->
      <section class="flex flex-column bg-white api-monitor-card api-monitor-list__min__height mb-5 pl-5 pt-5">
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
          <el-table-column prop="status" :label="$t('api_monitor_total_api_list_status')"> </el-table-column>
          <el-table-column prop="visitLine" :label="$t('api_monitor_total_api_list_visitLine')"> </el-table-column>
          <el-table-column prop="visitCount" :label="$t('api_monitor_total_api_list_visitCount')"> </el-table-column>
          <el-table-column prop="transitQuantity" :label="$t('api_monitor_total_api_list_transitQuantity')">
            <template #default="{ row }">
              <span>{{ handleUnit(row.transmitTotal) || '' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="->, total, prev, pager, next"
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
import Chart from 'web-core/components/chart'
import TableList from '@/components/TableList'
import FilterBar from '@/components/filter-bar'
import Detail from './Detail'
export default {
  name: 'ApiMonitor',
  components: { Chart, TableList, FilterBar, Detail },
  data() {
    return {
      loadingTimeList: false,
      loadingApiList: false,
      loadingFailRateList: false,
      columns: [
        {
          label: 'Api ID',
          prop: 'name'
        },
        {
          label: this.$t('api_monitor_total_columns_failed'),
          prop: 'failed'
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
        { label: this.$t('api_monitor_total_api_list_status_pending'), value: 'pending' }
      ]
    }
  },
  created() {
    let { status } = this.$route.query
    this.searchParams.status = status ?? ''
  },
  mounted() {
    this.getPreview()
    this.getClientName()
    this.remoteFailedMethod()
    this.consumingMethod()
    this.getApiList(1)
  },
  watch: {
    '$route.query'() {
      this.getApiList(1)
    }
  },
  methods: {
    //获取统计数据
    getPreview() {
      this.$api('ApiMonitor')
        .preview()
        .then(res => {
          this.previewData = res.data
        })
    },
    //获取所有客户端
    getClientName() {
      this.$api('ApiMonitor')
        .apiClientName()
        .then(res => {
          //重组数据
          let data = res.data
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
          label: 'totalCount',
          name: this.$t('api_monitor_total_totalCount'),
          value: this.previewData?.totalCount
        },
        {
          itemStyle: {
            color: '#2C65FF'
          },
          label: 'warningApiCount',
          name: this.$t('api_monitor_total_warningCount'),
          value: this.previewData?.warningApiCount
        }
      ]
      this.chartData = data
      return {
        series: [
          {
            type: 'pie',
            avoidLabelOverlap: false,
            data: data,
            radius: ['40%', '70%']
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
      this.loadingFailRateList = true
      this.$api('ApiMonitor')
        .rankLists({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          //map
          let data = res.data.items.map(item => {
            let abj = {}
            for (let key in item) {
              abj.name = key
              abj.failed = item[key]
            }
            return abj
          })
          this.page.failRateTotal = res.data.total
          this.failRateList = data || []
        })
        .finally(() => {
          this.loadingFailRateList = false
        })
    },
    //处理失败率排序
    handleFDOrder() {
      let time = JSON.parse(JSON.stringify(this.page.failRateOrder))
      this.page.failRateOrder = time === 'DESC' ? 'ASC ' : 'DESC'
      this.remoteFailedMethod()
    },
    //响应时间排行榜
    consumingMethod() {
      let { consumingTimeCurrent, size, consumingTimeOrder } = this.page
      let filter = {
        where: {
          type: 'latency '
        },
        limit: size,
        order: consumingTimeOrder,
        skip: size * (consumingTimeCurrent - 1)
      }
      this.loadingTimeList = true
      this.$api('ApiMonitor')
        .rankLists({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          //map
          let data = res.data.items.map(item => {
            let abj = {}
            for (let key in item) {
              abj.name = key
              abj.failed = item[key]
            }
            return abj
          })
          this.page.consumingTimeTotal = res.data.total
          this.consumingTimeList = data || []
        })
        .finally(() => {
          this.loadingTimeList = false
        })
    },
    //响应时间时间排序
    handleCTOrder() {
      let time = JSON.parse(JSON.stringify(this.page.consumingTimeOrder))
      this.page.consumingTimeOrder = time === 'DESC' ? 'ASC ' : 'DESC'
      this.consumingMethod()
    },
    //获取api列表数据
    getApiList() {
      let { apiListCurrent } = this.page
      let { keyword, status, clientName } = this.searchParams

      let where = {}
      if (keyword && keyword.trim()) {
        where.name = keyword
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
      this.loadingApiList = true
      return this.$api('ApiMonitor')
        .apiList({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res.data
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
          items: this.clientNameList
        },
        {
          placeholder: this.$t('task_list_search_placeholder'),
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
    //单位换算
    handleUnit(limit) {
      if (!limit) return 0
      var size = ''
      if (limit < 0.1 * 1024) {
        //小于0.1KB，则转化成B
        size = limit.toFixed(1) + 'B'
      } else if (limit < 0.1 * 1024 * 1024) {
        //小于0.1MB，则转化成KB
        size = (limit / 1024).toFixed(1) + 'KB'
      } else if (limit < 0.1 * 1024 * 1024 * 1024) {
        //小于0.1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(1) + 'MB'
      } else {
        //其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
      }

      var sizeStr = size + '' //转成字符串
      var index = sizeStr.indexOf('.') //获取小数点处的索引
      var dou = sizeStr.substr(index + 1, 1) //获取小数点后一位的值
      if (dou === '0') {
        //判断后两位是否为00，如果是则删除0
        return sizeStr.substring(0, index) + sizeStr.substr(index + 2, 1)
      }
      return size
    }
  }
}
</script>

<style scoped lang="scss">
.api-monitor-wrap {
  display: flex;
  -ms-flex: 1;
  flex: 1;
  padding: 0 20px 20px 20px;
  background-color: #eff1f4;
  overflow: auto;
  .api-monitor__min__height {
    height: 300px;
  }
  .api-monitor-list__min__height {
    min-height: 300px;
  }
  ::v-deep {
    .el-table__header th {
      font-weight: bold;
    }
  }

  .api-monitor-main {
    width: 100%;
  }
  .api-monitor-total__tittle {
    font-size: 18px;
    color: map-get($fontColor, main);
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
    color: map-get($fontColor, main);
  }
  .api-monitor-card {
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }
  .api-monitor-chart {
    width: 280px;
  }
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
    background: #2c65ff;
    display: inline-block;
  }
  .api-monitor-triangle {
    display: inline-block;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: map-get($fontColor, main);
  }
  .api-monitor-triangle-top {
    display: inline-block;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-bottom-color: map-get($fontColor, main);
  }
}
</style>
