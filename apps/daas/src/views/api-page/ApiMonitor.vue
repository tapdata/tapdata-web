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
          <div class="api-monitor-total__text">{{ previewData.visitTotalCount }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api访问总行数</header>
          <div class="api-monitor-total__text">{{ previewData.visitTotalLine }}</div>
        </div>
        <div class="flex-1 mt-5 text-center">
          <header class="api-monitor-total__tittle">api传输总量</header>
          <div class="api-monitor-total__text">{{ previewData.transmitTotal }}</div>
        </div>
      </section>
      <section class="flex flex-direction api-monitor-card mb-5">
        <div class="flex flex-column api-monitor-chart api-monitor-card api-monitor__min__height bg-white pl-5 pt-5">
          <div class="api-monitor-chart__tex mb-2">api 告警数</div>
          <Chart type="pie" :extend="getPieOption()" class="type-chart"></Chart>
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
        <div class="flex flex-column flex-1 bg-white api-monitor-card api-monitor__min__height pl-5 pt-5">
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
      <section class="flex flex-column bg-white api-monitor-card api-monitor__min__height mb-4 pl-5 pt-5">
        <header class="api-monitor-chart__text mb-2">API列表</header>
        <TablePage
          ref="table"
          row-key="id"
          class="data-flow-list"
          :remoteMethod="getApiList"
          :default-sort="{ prop: 'createTime', order: 'descending' }"
          @sort-change="handleSortTable"
        >
          <template slot="search">
            <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
          </template>
        </TablePage>
        <TableList
          :has-pagination="false"
          :data="apiList"
          :columns="apiListColumns"
          height="100%"
          ref="tableList"
        ></TableList>
        <el-pagination
          layout="->,total, prev, next"
          :current-page="page.apiListCurrent"
          :total="page.apiListTotal"
          @current-change="remoteFailedMethod"
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
import TablePage from '@/components/TablePage'
export default {
  name: 'ApiMonitor',
  components: { Chart, TableList, FilterBar, TablePage },
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
      apiListColumns: [
        {
          label: 'API ID',
          prop: 'name'
        },
        {
          label: 'API名称',
          prop: 'name'
        },
        {
          label: 'API状态',
          prop: 'status'
        },
        {
          label: 'API访问行数',
          prop: 'visitLine'
        },
        {
          label: 'API访问次数',
          prop: 'visitCount'
        },
        {
          label: 'API访问传输量',
          prop: 'transitQuantity'
        }
      ],
      previewData: {},
      chartData: [],
      failRateList: [{ name: '1234567', failed: '85%' }],
      consumingTimeList: [{ name: '1234567', failed: '85%' }],
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
        status: ''
      },
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        { label: '已发布', value: 'active' },
        { label: '待发布', value: 'pending' }
      ]
    }
  },
  mounted() {
    this.getPreview()
    this.getList()
    this.getApiList()
  },
  methods: {
    getPreview() {
      this.$api('ApiMonitor')
        .preview()
        .then(res => {
          this.previewData = res.data
        })
    },
    getList() {
      let filter = {
        limit: 5,
        skip: 0
      }
      this.$api('ApiMonitor')
        .rankLists({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          //map
          let data = res.data.items.map(item => {
            let objArr = []
            for (let key in item) {
              let abj = {
                name: key,
                failed: item[key]
              }
              objArr.push(abj)
            }
            return objArr
          })
          this.page.failRateTotal = res.data.total
          this.failRateList = data || []
        })
    },
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
    getApiList({ page }) {
      let { apiListCurrent, size } = page

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
        limit: size,
        skip: (apiListCurrent - 1) * size,
        where
      }
      return this.$api('ApiMonitor')
        .apiList({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res.data
          this.apiList = res.data
          return {
            total: data.total,
            data: data.items
          }
        })
    },
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
          key: 'progress',
          type: 'select-inner',
          items: this.progressOptions
        },
        {
          placeholder: this.$t('task_list_search_placeholder'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    remoteFailedMethod({ page }) {
      let { failRateCurrent, size } = page
      let filter = {
        where: {
          type: 'failRate'
        },
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
            let objArr = []
            for (let key in item) {
              let abj = {
                name: key,
                failed: item[key]
              }
              objArr.push(abj)
            }
            return objArr
          })
          this.page.failRateTotal = res.data.total
          this.failRateList = data || []
        })
    },
    consumingMethod({ page }) {
      let { consumingTimeCurrent, size } = page
      let filter = {
        where: {
          type: 'consumingTime'
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
            let objArr = []
            for (let key in item) {
              let abj = {
                name: key,
                failed: item[key]
              }
              objArr.push(abj)
            }
            return objArr
          })
          this.page.consumingTimeTotal = res.data.total
          this.consumingTimeList = data || []
        })
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
    width: 280px;
  }
}
</style>
