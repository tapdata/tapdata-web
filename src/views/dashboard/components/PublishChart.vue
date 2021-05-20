<!-- 发布数据统计展示（1、增量趋势折线图 2、发布top10柱状图） -->
<template>
<div class="publish-chart">
  <section v-loading="trendLoading"><div ref="trendChart"></div></section>
  <el-divider direction="vertical"/>
  <section v-loading="topLoading"><div ref="topChart"></div></section>
</div>
</template>

<script>
import echarts from '@/plugins/echarts'

export default {
  data() {
    return {
      trendChart: null, // 增量趋势图表实例
      trendData: [], // 增量趋势数据 每一项label表示标签， value表示值
      topChart: null, // 前十发布图表实例
      topData: [], // 前十发布数据 每一项label表示标签， value表示值
      trendLoading: false, // 增量趋势图表加载中
      topLoading: false, // 前十发布图表加载中
    }
  },
  computed: {
    // 增量趋势图表配置
    trendOptions() {
      return {
        title: {
          text: this.$t('dkDashboard.trendData'),
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
          name: this.$t('dkDashboard.spaceUsage'),
          nameGap: 50,
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
    },
    // 前10发布图表配置
    topOptions() {
      return {
        title: {
          text: this.$t('dkDashboard.topRelease'),
          left: 'center',
          textStyle: {
            color: '#666',
            fontSize: 12
          }
        },
        grid: {
          top: '6%',
          left: '1%',
          right: '10%',
          bottom: '1%',
          containLabel: true
        },
        color: '#686be8',
        xAxis: {
          type: 'value',
          splitLine: { show: false },
          axisLine: {
            lineStyle: {
              color: '#d9d9d9'
            }
          },
          axisLabel: {
            color: '#666',
            formatter: val => {
              if (val >= 100000000) {
                return Math.round(val * 100) / 10000000000 + '亿';
              } else if (val >= 10000) {
                return (Math.round(val * 100) / 1000000) + '万';
              } else {
                return val;
              }
            }
          }
        },
        yAxis: {
          type: 'category',
          data: this.topData.map(v => v.label).reverse(),
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
            type: 'bar',
            barMaxWidth: 60,
            label: {
              show: true,
              position: 'right'
            },
            data: this.topData.map(v => v.value).reverse()
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        }
      }
    }
  },
  methods: {
    // 图表resize
    resizeFn() {
      this.trendChart && this.trendChart.resize()
      this.topChart && this.topChart.resize()
    },
    // 增量趋势数据
    getTrendData() {
      this.trendLoading = true
      this.$api('insights').get({
        'filter[limit]': 15,
        'filter[skip]': 0,
        'filter[order]': 'stats_time desc',
        'filter[where][stats_name]': 'total_publish_stats',
        'filter[where][stats_granularity]': 'daily',
        'filter[where][and][0][stats_time][gte]': this.$moment().subtract(15, 'days').format('YYYYMMDD000000'),
        'filter[where][and][1][stats_time][lte]': this.$moment().format('YYYYMMDD000000')
      }).then(({data}) => {
        let list = data || []
        this.trendData = list.map(v => {
          let year = v.stats_time.substring(0, 4)
          let month = v.stats_time.substring(4, 6)
          let day = v.stats_time.substring(6, 8)
          v.label = `${year}-${month}-${day}`
          v.value = Number(v.data.total_data_size/1024/1024/1024).toFixed(2)
          return v
        }).sort((a, b) => a.stats_time - b.stats_time)

        this.trendChart.setOption(this.trendOptions)
      }).finally(() => {
        this.trendLoading = false
      })
    },
    // 处理前十top数据
    getTopData() {
      this.topLoading = true
      this.$api('insights').get({
        'filter[limit]': 10,
        'filter[skip]': 0,
        'filter[order]': 'data.total_records desc',
        'filter[where][stats_name]': 'publish_stats',
        'filter[where][stats_granularity]': 'daily',
        'filter[where][and][0][stats_time]': this.$moment().format('YYYYMMDD000000'),
        //'filter[where][and][1][stats_time][lte]': this.$moment().format('YYYYMMDD000000')
      }).then(({data}) => {
        let list = data || []
        this.topData = list.map(v => ({
          label: v.data.api_name,
          value: v.data.total_records
        }))
        this.topChart.setOption(this.topOptions)
      }).finally(() => {
        this.topLoading = false
      })
    }
  },
  mounted() {
    // 初始化图表
    this.topChart = echarts.init(this.$refs.topChart)
    this.trendChart = echarts.init(this.$refs.trendChart)

    // 获取数据
    this.getTrendData()
    this.getTopData()

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
.publish-chart {
  height: 400px;
  display: flex;
  padding-bottom: 20px;
  >section {
    flex: 1;
  }
  div {
    height: 100%;
  }
}
</style>