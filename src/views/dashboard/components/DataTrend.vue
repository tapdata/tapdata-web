<!-- 数据增量趋势统计（1、数据增量折线图 2、增量统计表格） -->
<template>
<div class="data-trend">
  <section v-loading="trendLoading"><div ref="trendChart"></div></section>
  <el-divider direction="vertical"/>
  <section><div></div></section>
</div>
</template>

<script>
import echarts from '@/plugins/echarts'

export default {
  data() {
    return {
      trendChart: null, // 增量趋势图表实例
      trendData: [], // 增量趋势数据 每一项label表示标签， value表示值
      trendLoading: false, // 增量趋势图表加载中
    }
  },
  computed: {
    // 增量趋势图表配置
    trendOptions() {
      return {
        title: {
          text: '数据增量',
          left: 'center',
          textStyle: {
            color: '#666',
            fontSize: 12
          }
        },
        grid: {
          top: '6%',
          bottom: '1%',
          containLabel: true
        },
        color: '#686be8',
        xAxis: {
          type: 'category',
          data: this.trendData.map(v => v.label),
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#d9d9d9'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          name: '占用空间（条）',
          nameGap: 80,
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#666'
          },
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#d9d9d9'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            type: 'line',
            smooth: true,
            data: this.trendData.map(v => v.value),
            lineStyle: {
              width: 3
            }
          }
        ],
        tooltip: {
          trigger: 'axis'
        }
      }
    }
  },
  methods: {
    // 图表resize
    resizeFn() {
      this.trendChart && this.trendChart.resize()
    },
    // 增量表格数据请求Promise
    trendPromise(start, end) {
      return this.$api('insights').get({
        'filter[skip]': 0,
        //'filter[order]': 'stats_time asc',
        'filter[where][stats_name]': 'trend_stats_increment',
        'filter[where][stats_granularity]': 'minute',
        'filter[where][and][0][stats_time][gte]': start,
        'filter[where][and][1][stats_time][lt]': end
      })
    },
    // 获取表格增量统计数据
    getStatisticData() {
      // 1个月
      const month = [
        this.$moment().subtract(30, 'days').format('YYYYMMDD000000'),
        this.$moment().format('YYYYMMDD235959')     
      ]
      // 昨天
      const yesterday = [
        this.$moment().subtract(1, 'days').format('YYYYMMDD000000'),
        this.$moment().subtract(1, 'days').format('YYYYMMDD235959')
      ]
      // 今天
      const today = [
        this.$moment().format('YYYYMMDD000000'),
        this.$moment().format('YYYYMMDD235959')        
      ]

      this.trendLoading = true
      Promise.all([
        this.trendPromise(...month), 
        this.trendPromise(...yesterday),
        this.trendPromise(...today)
      ]).then(([{data: monthData}, {data: yesterdayData}, {data: today}]) => {
        console.log(monthData, yesterdayData, today)
        // let list = data || []
        // this.trendData = list
        // this.trendChart.setOption(this.trendOptions)
      }).finally(() => {
        this.trendLoading = false
      })
    },
    // 获取增量趋势图表数据
    getTrendData() {
      this.trendLoading = true
      this.$api('insights').get({
        'filter[order]': 'stats_time desc',
        'filter[where][stats_name]': 'trend_stats',
        'filter[where][stats_granularity]': 'minute',
        'filter[where][stats_time][gt]': this.$moment().subtract(5, 'days').format('YYYYMMDD000000')
      }).then(({data}) => {
        let list = data || []
        this.trendData = list.map(v => {
          let year = v.stats_time.substring(0, 4)
          let month = v.stats_time.substring(4, 6)
          let day = v.stats_time.substring(6, 8)
          let hours = v.stats_time.substring(8, 10)
          let minute = v.stats_time.substring(10, 12)
          v.label = `${year}-${month}-${day} ${hours}:${minute}`
          v.value = v.data.create
          return v
        }).reverse()
        this.trendChart.setOption(this.trendOptions)
      }).finally(() => {
        this.trendLoading = false
      })
    }
  },
  mounted() {
    // 初始化图表
    this.trendChart = echarts.init(this.$refs.trendChart)

    // 获取数据
    this.getTrendData()

    // 窗口变化重绘图表
    window.addEventListener('resize', this.resizeFn)
  },
  beforeDestroy() {
    // 移除resize事件
    window.removeEventListener('resize', this.resizeFn)
  }
}
</script>

<style lang="scss" scoped>
.data-trend {
  height: 400px;
  display: flex;
  padding: 20px 0;
  >section {
    flex: 1;
  }
  div {
    height: 100%;
  }
}
</style>