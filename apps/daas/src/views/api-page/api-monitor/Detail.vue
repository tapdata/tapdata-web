<template>
  <section class="api-monitor-detail-wrap flex flex-direction" v-loading="loadingDetail">
    <div class="flex-direction pt-5 mt-8" style="width: 350px">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_visitTotalCount') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.totalCount }}/{{ detail.visitTotalCount || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_visitQuantity') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ handleUnit(detail.visitQuantity) || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_timeConsuming') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ formatMs(detail.timeConsuming) || 0 }}</div>
        </div>
      </div>
      <div class="flex flex-direction flex-1 pb-5 mt-8">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_visitTotalLine') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitTotalLine || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_speed') }}</div>
          <div class="api-monitor-detail-wrap__value">
            {{ detail.speed ? handleUnit(detail.speed) + '/S' : '0 M/S' }}
          </div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_responseTime') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ formatMs(detail.responseTime) || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 pt-3">
      <FilterBar v-model="searchParams" :items="filterItems" :hideRefresh="true" @fetch="getDetail()"> </FilterBar>
      <div v-loading="!qpsDataTime.length" style="height: 200px">
        <Chart ref="chart" :extend="lineOptions" class="type-chart h-100"></Chart>
      </div>
    </div>
    <div class="pt-5 ml-4" style="width: 200px">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
        $t('role_all_check')
      }}</el-checkbox>
      <span class="ml-2">{{ clientName.length }}/{{ clientNameList.length }}</span>
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
import { handleUnit, formatMs } from './utils'
export default {
  name: 'Detail',
  components: { FilterBar, Chart },
  props: ['id'],
  data() {
    return {
      detail: '',
      timer: null,
      filterItems: [],
      searchParams: {
        guanluary: 5,
        type: 'visitTotalLine'
      },
      typesOptions: [
        { label: this.$t('api_monitor_detail_visitTotalLine'), value: 'visitTotalLine' },
        { label: this.$t('api_monitor_detail_timeConsuming'), value: 'latency' },
        { label: this.$t('api_monitor_detail_speed'), value: 'speed' },
        { label: this.$t('api_monitor_detail_responseTime'), value: 'responseTime' }
      ],
      timeList: [
        { label: this.$t('task_info_five_min'), value: 5 },
        { label: this.$t('task_info_ten_min'), value: 10 },
        { label: this.$t('task_info_thirty_min'), value: 30 },
        { label: this.$t('task_info_last_hour'), value: 60 }
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
      qpsDataTime: [],
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
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            }
          },
          axisLine: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        grid: {
          left: '24px', // 没有数据的时候，Y轴单位显示不全。后面可以通过判断设置该值
          right: '25px',
          top: '20px',
          bottom: 0,
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc'
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
            type: 'line',
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
    this.timer = setInterval(() => {
      this.getDetail(true)
    }, 60000) //一分钟一次
    this.allElectionFun()
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    }
  },
  destroyed() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    handleUnit(limit) {
      return handleUnit(limit)
    },
    formatMs(time) {
      if (time === 0 || !time) return 0
      if (time < 1000) return time + ' ms'
      return formatMs(time, '')
    },
    getDetail(hiddenLoading) {
      let data = {
        id: this.id,
        guanluary: this.searchParams.guanluary || 5,
        clientId: [],
        start: new Date().getTime(),
        type: this.searchParams.type || 'visitTotalLine'
      }
      if (!hiddenLoading) {
        this.loadingDetail = true
      }
      this.$api('ApiMonitor')
        .apiDetail(data)
        .then(res => {
          //处理数据
          this.detail = res.data
          this.detail['totalCount'] = (this.detail.visitTotalCount || 0) - (this.detail.errorVisitTotalCount || 0) || 0
          let data = res?.data
          // 折线图
          let qpsDataValue = data.value || []
          this.qpsDataTime = data.time || []
          this.qpsDataTime = this.qpsDataTime.map(t => formatTime(t, 'HH:mm:ss')) // 时间不在这里格式化.map(t => formatTime(t))
          this.$nextTick(() => {
            this.$refs.chart?.chart?.setOption({
              xAxis: {
                data: this.qpsDataTime
              },
              series: [
                {
                  data: qpsDataValue // Object.assign([], this.lineDataDeep.y[0])
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
          label: this.$t('dataExplorer_type'),
          key: 'type',
          type: 'select-inner',
          items: this.typesOptions,
          selectedWidth: '200px',
          clearable: false
        },
        {
          label: this.$t('task_info_statistics_time'),
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
      this.allElection = []
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
