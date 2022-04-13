<template>
  <section class="api-monitor-wrap">
    <main class="api-monitor-main">
      <section class="flex flex-direction bg-white api-monitor-card mb-5">
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api总数</header>
          <div class="api-monitor-total__text">{{ previewData.totalCount }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api访问总数</header>
          <div class="api-monitor-total__text">
            {{
              previewData.visitTotalCount - previewData.warningApiCount < 0
                ? 0
                : previewData.visitTotalCount - previewData.warningApiCount
            }}/{{ previewData.visitTotalCount }}
          </div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api访问总行数</header>
          <div class="api-monitor-total__text">{{ previewData.visitTotalLine }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api传输总量</header>
          <div class="api-monitor-total__text">{{ handleUnit(previewData.transmitTotal) || 0 }}</div>
        </div>
      </section>
      <section class="flex flex-direction api-monitor-card mb-5">
        <div class="flex flex-column api-monitor-chart api-monitor-card api-monitor__min__height bg-white pl-5 pt-5">
          <div class="api-monitor-chart__tex mb-2">api 告警数</div>
          <Chart type="pie" :extend="getPieOption()" class="type-chart"></Chart>
          <div class="pie-status flex flex-wrap ml-5">
            <div
              v-for="(item, index) in chartData"
              :key="index"
              class="pie-status__item flex align-items-center ellipsis"
            >
              <span class="circle-icon mr-2" :style="{ 'background-color': item.color }"></span>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-column flex-1 bg-white api-monitor-card api-monitor__min__height ml-5 mr-5 pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">api失败率TOP排序</div>
          <TableList
            height="100%"
            ref="failRateList"
            :has-pagination="false"
            :data="failRateList"
            :columns="columns"
          ></TableList>
          <el-pagination
            layout="->,total, prev, next"
            :current-page="page.failRateCurrent"
            :total="page.failRateTotal"
            @current-change="remoteFailedMethod"
          >
          </el-pagination>
        </div>
        <div class="flex flex-column flex-1 bg-white api-monitor-card api-monitor__min__height mr-5 pl-5 pt-5">
          <div class="api-monitor-chart__text mb-2">api响应时间TOP排序</div>
          <TableList
            :has-pagination="false"
            :data="consumingTimeList"
            :columns="columns"
            height="100%"
            ref="consumingTimeList"
          ></TableList>
          <el-pagination
            layout="->,total, prev, next"
            :current-page="page.consumingTimeCurrent"
            :total="page.consumingTimeTotal"
            @current-change="consumingMethod"
          >
          </el-pagination>
        </div>
      </section>
      <section class="flex flex-column bg-white api-monitor-card api-monitor__min__height mb-5 pl-5 pt-5">
        <header class="api-monitor-chart__text mb-2">API列表</header>
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="getApiList(1)"> </FilterBar>
        <el-table
          ref="table"
          row-key="id"
          class="data-flow-list"
          :data="apiList"
          :default-sort="{ prop: 'createTime', order: 'descending' }"
          @expand-change="expandChange"
        >
          <el-table-column type="expand" width="45">
            <template>
              <span>斤斤计较</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="API名称"> </el-table-column>
          <el-table-column prop="status" label="API状态"> </el-table-column>
          <el-table-column prop="visitLine" label="API访问行数"> </el-table-column>
          <el-table-column prop="visitCount" label="API访问次数"> </el-table-column>
          <el-table-column prop="transitQuantity" label="API访问传输量">
            <template #default="{ row }">
              <span>{{ handleUnit(row.transmitTotal) || '' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="->, total, prev, pager, next"
          :current-page="page.apiListCurrent"
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
export default {
  name: 'ApiMonitor',
  components: { Chart, TableList, FilterBar },
  data() {
    return {
      columns: [
        {
          label: 'Api ID',
          prop: 'name'
        },
        {
          label: '失败率',
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
        consumingTimeCurrent: 1,
        consumingTimeTotal: 0,
        apiListCurrent: 1,
        apiListTotal: 0
      },
      filterItems: [],
      searchParams: {
        keyword: '',
        clientName: '',
        status: ''
      },
      clientNameList: ['cli1', 'cli2', 'cli3'],
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        { label: '已发布', value: 'active' },
        { label: '待发布', value: 'pending' }
      ]
    }
  },
  created() {
    this.getFilterItems()
    let { status } = this.$route.query
    this.searchParams.status = status ?? ''
  },
  mounted() {
    this.getPreview()
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
    //图表数据组装
    getPieOption() {
      let data = [
        {
          itemStyle: {
            color: '#8FD8C0'
          },
          label: 'totalCount',
          name: 'API 总数',
          value: this.previewData?.totalCount
        },
        {
          itemStyle: {
            color: '#2C65FF'
          },
          label: 'warningApiCount',
          name: 'API警告数',
          value: this.previewData?.warningApiCount
        }
      ]
      this.chartData = data
      let dataName = []
      let total = 0
      let totalFalg = true
      let totalText = this.$t('dashboard_total')
      if (data?.length) {
        data.forEach(res => {
          dataName.push(res.name)
          total += parseFloat(res.value) * 1
        })
        totalFalg = data.some(item => item.value > 0)
      }
      return {
        legend: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          borderWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: params => {
            let item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }
            let html = `<div style="text-align: center;"> ${params.name}<div style="font-family: 'DIN'">${val}</div></div>`
            return html
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            stillShowZeroSum: totalFalg ? false : true,
            avoidLabelOverlap: false,
            zlevel: 1,
            label: {
              show: true,
              position: 'center',
              width: 60,
              height: 34,
              fontWeight: 'bold',
              backgroundColor: '#fff',
              formatter: `{name|${total}}\n{value|${totalText}}`,
              rich: {
                name: {
                  lineHeight: 24,
                  color: 'rgba(0, 0, 0, 0.85)',
                  fontSize: 16,
                  fontWeight: '400'
                },
                value: {
                  color: 'rgba(0, 0, 0, 0.43)',
                  fontSize: 12,
                  fontWeight: '400'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontWeight: 'bold',
                formatter: '{name|{c}}\n{value|{b}}',
                width: 60,
                height: 34,
                rich: {
                  name: {
                    lineHeight: 24,
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontSize: '16',
                    fontWeight: '400'
                  },
                  value: {
                    color: 'rgba(0, 0, 0, 0.43)',
                    fontSize: 12,
                    fontWeight: '400'
                  }
                }
              }
            },
            data: data
          }
        ]
      }
    },
    //获取api列表数据
    getApiList() {
      let { apiListCurrent } = this.page

      let { keyword, status } = this.searchParams

      let where = {}
      if (keyword && keyword.trim()) {
        where.clientName = keyword
      }
      if (status) {
        where.status = status
      }
      let filter = {
        order: 'createTime DESC',
        limit: 5,
        skip: (apiListCurrent - 1) * 5,
        where
      }
      return this.$api('ApiMonitor')
        .apiList({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res.data
          this.apiList = data.items
          this.page.apiListTotal = data.total
        })
    },
    //api 列表筛选
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('task_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('task_list_sync_type'),
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
    //失败率排行榜
    remoteFailedMethod() {
      let { failRateCurrent, size } = this.page
      let filter = {
        where: {
          type: 'failRate'
        },
        order: 'DESC',
        limit: size,
        skip: size * (failRateCurrent - 1)
      }
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
    },
    //响应时间排行榜
    consumingMethod() {
      let { consumingTimeCurrent, size } = this.page
      let filter = {
        where: {
          type: 'latency '
        },
        limit: size,
        skip: size * (consumingTimeCurrent - 1)
      }
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
    min-height: 248px;
  }
  .api-monitor-main {
    width: 100%;
  }
  .api-monitor-total__tittle {
    font-size: 18px;
    font-weight: 600;
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
    width: 240px;
  }
}
</style>
