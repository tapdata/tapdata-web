<script>
import { Chart } from '@tap/component/src/chart'
import { FilterBar } from '@tap/component/src/filter-bar'
import { formatTime } from '@/utils/util'
import { apiMonitorApi } from '@tap/api'
import Time from '@tap/shared/src/time'
import { calcUnit } from '@tap/shared'
import { formatMs } from './utils'

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
        type: 'visitTotalLine',
      },
      typesOptions: [
        { label: this.$t('api_monitor_detail_visitTotalLine'), value: 'visitTotalLine' },
        { label: this.$t('api_monitor_detail_speed'), value: 'speed' },
        {
          label: this.$t('api_monitor_detail_responseTime'),
          value: 'responseTime',
        },
        { label: this.$t('api_monitor_detail_timeConsuming'), value: 'latency' }
      ],
      timeList: [
        { label: this.$t('public_time_five_min'), value: 5 },
        { label: this.$t('public_time_ten_min'), value: 10 },
        { label: this.$t('public_time_thirty_min'), value: 30 },
        { label: this.$t('public_time_last_hour'), value: 60 },
      ],
      allElection: [],
      clientName: [],
      checkAll: true,
      isIndeterminate: false,
      loadingDetail: false,
      clientNameList: [
        {
          name: 'Data Explorer',
          id: '5c0e750b7a5cd42464a5099d',
        },
      ],
      qpsDataTime: [],
      lineOptions: {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          top: 4,
          right: 0,
          show: false,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: {
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            },
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        grid: {
          left: '24px', // 没有数据的时候，Y轴单位显示不全。后面可以通过判断设置该值
          right: '25px',
          top: '20px',
          bottom: 0,
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc',
        },
        series: [
          {
            name: this.$t('public_time_input'),
            lineStyle: {
              color: 'rgba(24, 144, 255, 1)',
              width: 1,
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.2)',
            },
            symbol: 'none',
            itemStyle: {
              color: 'rgba(24, 144, 255, 1)',
            },
            type: 'line',
            data: [],
          },
        ],
      },
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
    this.handleCheckAllChange(true) //默认全选
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    },
  },
  unmounted() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    calcUnit() {
      return calcUnit(...arguments)
    },
    formatMs(time) {
      if (time === 0 || !time) return 0
      if (time < 1000) return time + ' ms'
      return formatMs(time, '')
    },
    getDetail(hiddenLoading, type) {
      if (type) {
        this.searchParams.type = type
      }
      let data = {
        id: this.id,
        guanluary: this.searchParams.guanluary || 5,
        clientId: [],
        start: Time.now(),
        type: this.searchParams.type || 'visitTotalLine',
      }
      if (!hiddenLoading) {
        this.loadingDetail = true
      }
      apiMonitorApi
        .apiDetail(data)
        .then((data) => {
          //处理数据
          this.detail = data
          this.detail['totalCount'] = (this.detail.visitTotalCount || 0) - (this.detail.errorVisitTotalCount || 0) || 0
          // 折线图
          let qpsDataValue = data.value || []
          this.qpsDataTime = data.time || []
          this.qpsDataTime = this.qpsDataTime.map((t) => formatTime(t, 'HH:mm:ss')) // 时间不在这里格式化.map(t => formatTime(t))
          this.$nextTick(() => {
            this.$refs.chart?.chart?.setOption({
              xAxis: {
                data: this.qpsDataTime,
              },
              series: [
                {
                  data: qpsDataValue, // Object.assign([], this.lineDataDeep.y[0])
                },
              ],
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
          label: this.$t('api_monitor_detail_Monitoring_conditions'),
          key: 'type',
          type: 'select-inner',
          items: this.typesOptions,
          selectedWidth: '200px',
          clearable: false,
        },
        {
          label: this.$t('api_monitor_detail_monitoring_period'),
          key: 'guanluary',
          type: 'select-inner',
          items: this.timeList,
        },
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
    },
  },
}
</script>

<template>
  <section class="api-monitor-detail-wrap flex flex-direction" v-loading="loadingDetail">
    <div class="flex-direction pt-5 mt-8" style="width: 350px">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_visitTotalCount') }}</div>
          <el-tooltip
            :open-delay="400"
            :disabled="!detail.totalCount || detail.totalCount < 1000"
            :content="`${detail.totalCount}`"
            placement="bottom"
          >
            <div class="api-monitor-detail-wrap__value">{{ calcUnit(detail.totalCount) }}</div>
          </el-tooltip>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">
            {{ $t('api_monitor_detail_visitQuantity') }}
          </div>
          <div class="api-monitor-detail-wrap__value">
            {{ calcUnit(detail.visitQuantity, 'b') || 0 }}
          </div>
        </div>
        <div class="flex-1 cursor-pointer" @click="getDetail(false, 'visitTotalLine')">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_visitTotalLine') }}</div>
          <el-tooltip
            :open-delay="400"
            :disabled="!detail.visitTotalLine || detail.visitTotalLine < 1000"
            :content="`${detail.visitTotalLine}`"
            placement="bottom"
          >
            <div class="api-monitor-detail-wrap__value">{{ calcUnit(detail.visitTotalLine || 0) }}</div>
          </el-tooltip>
        </div>
      </div>
      <div class="flex flex-direction flex-1 pb-5 mt-8">
        <div class="flex-1 cursor-pointer" @click="getDetail(false, 'speed')">
          <div class="api-monitor-detail-wrap__text">
            {{ $t('api_monitor_detail_speed') }}
          </div>
          <div class="api-monitor-detail-wrap__value">
            {{ detail.speed ? calcUnit(detail.speed, 'b') + '/S' : '0 M/S' }}
          </div>
        </div>
        <!--<div class="flex-1 cursor-pointer" @click="getDetail(false, 'responseTime')">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_responseTime') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ formatMs(detail.responseTime) || 0 }}</div>
        </div>-->
        <div class="flex-1 cursor-pointer" @click="getDetail(false, 'latency')">
          <div class="api-monitor-detail-wrap__text">{{ $t('api_monitor_detail_timeConsuming') }}</div>
          <div class="api-monitor-detail-wrap__value">{{ formatMs(detail.timeConsuming) || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 pt-3">
      <FilterBar v-model:value="searchParams" :items="filterItems" :hideRefresh="true" @fetch="getDetail()">
      </FilterBar>
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

<style lang="scss" scoped>
.api-monitor-detail-wrap {
  .api-monitor-detail-wrap__text {
    font-size: 12px;
    font-weight: 500;
    height: 30px;
    color: var(--text-normal);
    text-align: center;
  }
  .api-monitor-detail-wrap__value {
    font-size: 20px;
    color: var(--color-primary);
    line-height: 38px;
    text-align: center;
  }
}
</style>
