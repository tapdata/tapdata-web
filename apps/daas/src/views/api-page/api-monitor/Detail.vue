<template>
  <section class="api-monitor-detail-wrap flex flex-direction" v-loading="loadingDetail">
    <div class="flex-direction flex-1 pt-5">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitTotalCount || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API传输量</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitQuantity || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问耗时</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.timeConsuming || 0 }}</div>
        </div>
      </div>
      <div class="flex flex-direction flex-1 pb-5">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问行数</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitTotalLine || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API传输速率</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.speed || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API响应时间</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.responseTime || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 pt-3">
      <FilterBar v-model="searchParams" :items="filterItems" :hideRefresh="true" @fetch="getDetail()"> </FilterBar>
      <div v-loading="!lineDataDeep.x.length">
        <Chart ref="chart" type="line" :data="lineData" :options="lineOptions" class="type-chart h-100"></Chart>
      </div>
    </div>
    <div class="pt-5 ml-4" style="width: 200px">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0"></div>
      <el-checkbox-group v-model="clientName" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="item in clientNameList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
      </el-checkbox-group>
    </div>
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import Chart from 'web-core/components/chart'
import { formatTime } from '@/utils/util'
export default {
  name: 'Detail',
  components: { FilterBar, Chart },
  props: ['id'],
  data() {
    return {
      detail: '',
      filterItems: [],
      searchParams: {
        guanluary: 5,
        type: 'visitTotalLine'
      },
      typesOptions: [
        { label: '访问行数', value: 'visitTotalLine' },
        { label: '耗时', value: 'timeConsuming' },
        { label: '传输速率', value: 'speed' },
        { label: '响应时间', value: 'latency' }
      ],
      timeList: [
        { label: '5分钟', value: 5 },
        { label: '10分钟', value: 10 },
        { label: '30分钟', value: 30 },
        { label: '60分钟', value: 60 }
      ],
      allElection: [],
      clientName: [],
      checkAll: false,
      isIndeterminate: true,
      loadingDetail: false,
      clientNameList: [
        {
          name: 'Data Explorer',
          id: '5c0e750b7a5cd42464a5099d'
        }
      ],
      lineData: {
        x: [],
        y: [[]]
      },
      lineDataDeep: {
        x: [],
        y: [[]]
      },
      lineOptions: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 4,
          right: 0,
          show: false
        },
        xAxis: {
          type: 'time'
        },
        yAxis: [
          {
            // max: 'dataMax',
            // name: 'QPS',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          },
          {
            // max: 'dataMax',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          }
        ],
        grid: {
          left: 0,
          right: 0,
          top: '24px',
          bottom: 0
        },
        series: [
          {
            name: this.$t('task_info_input'),
            lineStyle: {
              color: 'rgba(24, 144, 255, 1)',
              width: 1
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.2)'
            },
            symbol: 'none',
            itemStyle: {
              color: 'rgba(24, 144, 255, 1)'
            },
            // type: 'line',
            data: []
          },
          {
            name: this.$t('task_info_output'),
            lineStyle: {
              color: 'rgba(118, 205, 238, 1)',
              width: 1
            },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(118, 205, 238, 0.2)'
            },
            itemStyle: {
              color: 'rgba(118, 205, 238, 1)'
            },
            // type: 'line',
            data: []
          }
        ]
      }
    }
  },
  created() {
    this.getFilterItems()
  },
  mounted() {
    this.getDetail()
    this.allElectionFun()
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    }
  },
  methods: {
    getDetail() {
      let data = {
        id: this.id,
        guanluary: this.searchParams.guanluary || 5,
        clientId: [],
        start: new Date().getTime(),
        type: this.searchParams.type || 'visitTotalLine'
      }
      this.loadingDetail = true
      this.$api('ApiMonitor')
        .apiDetail(data)
        .then(res => {
          this.detail = res.data
          let data = res?.data
          // 折线图
          let qpsDataValue = data.value || []
          let qpsDataTime = data.time || []

          let xArr = qpsDataTime.map(t => formatTime(t, 'YYYY-MM-DD HH:mm:ss.SSS')) // 时间不在这里格式化.map(t => formatTime(t))
          const xArrLen = xArr.length
          if (this.lineDataDeep.x.length > 20) {
            this.lineDataDeep.x.splice(0, xArrLen)
            this.lineDataDeep.y[0].splice(0, xArrLen)
          }
          let inArr = []
          xArr.forEach((el, i) => {
            let time = el
            inArr.push({
              name: time,
              value: [time, qpsDataValue[i]]
            })
          })
          // eslint-disable-next-line
          console.log('挖掘详情x轴：', this.lineDataDeep.x.length, xArr)
          xArr.forEach((el, index) => {
            if (!this.lineDataDeep.x.includes(el)) {
              this.lineDataDeep.x.push(el)
              this.lineDataDeep.y[0].push(inArr[index])
            }
          })
          this.$nextTick(() => {
            this.$refs.chart?.chart?.setOption({
              series: [
                {
                  data: Object.assign([], this.lineDataDeep.y[0])
                }
              ]
            })
          })
          //全选值
          this.allElectionFun()
        })
        .finally(() => {
          this.loadingDetail = false
        })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('task_list_status'),
          key: 'type',
          type: 'select-inner',
          items: this.typesOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('task_list_sync_type'),
          key: 'guanluary',
          type: 'select-inner',
          items: this.timeList
        }
      ]
    },
    handleCheckAllChange(val) {
      this.clientName = val ? this.allElection : []
      this.isIndeterminate = false
    },
    //选择所有
    allElectionFun() {
      for (var i = 0; i < this.clientNameList.length; i++) {
        this.allElection.push(this.clientNameList[i].id)
      }
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.clientNameList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.clientNameList.length
      //刷新数据
      this.getDetail()
    }
  }
}
</script>

<style scoped lang="scss">
.api-monitor-detail-wrap {
  .api-monitor-detail-wrap__text {
    font-size: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    text-align: center;
  }
  .api-monitor-detail-wrap__value {
    font-size: 20px;
    color: #2c65ff;
    line-height: 38px;
    text-align: center;
  }
}
</style>
