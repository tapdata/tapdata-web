<template>
  <VChart class="chart" :option="chartOption" :autoresize="autoresize" />
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, ToolboxComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'TypeChart',
  components: { VChart },
  props: {
    type: {
      type: String,
      default: 'bar'
    },
    data: {
      type: [Array, Object]
    },
    options: {
      type: Object
    },
    extend: {
      type: Object
    },
    autoresize: {
      type: Boolean,
      default: true
    },
    noX: {
      type: [String, Array]
    },
    noY: {
      type: Array,
      default: () => [0, 1]
    }
  },
  data() {
    return {
      chartOption: {}
    }
  },
  watch: {
    data: {
      deep: true,
      handler(v) {
        v && this.init()
      }
    },
    extend: {
      deep: true,
      handler(v) {
        if (v) {
          v && this.init()
        }
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.extend) {
        this.chartOption = this.extend
        return
      }
      let obj = this[this.type]?.()
      const { options } = this
      if (options) {
        for (let key in options) {
          if (key === 'series') {
            options[key].forEach((el, i) => {
              obj[key][i] = Object.assign({}, obj[key][i] || {}, el || {})
            })
          } else {
            obj[key] = Object.assign({}, obj[key] || {}, options[key] || {})
          }
        }
      }
      this.chartOption = obj
    },
    bar() {
      let seriesData = []
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          show: true,
          axisLine: {
            show: false,
            lineStyle: {
              color: '#666',
              width: 0
            }
          },
          axisLabel: {
            margin: 30
          },
          axisTick: {
            show: false
          },
          data: [
            this.$t('dataFlow.totalOutput'),
            this.$t('dataFlow.totalInput'),
            this.$t('dataFlow.totalInsert'),
            this.$t('dataFlow.totalUpdate'),
            this.$t('dataFlow.totalDelete')
          ],
          axisPointer: {
            type: 'shadow'
          },
          nameTextStyle: {
            verticalAlign: 'bottom',
            color: '#F00'
          }
        },
        yAxis: {
          // show: false
        },
        series: [
          {
            type: 'bar',
            data: seriesData,
            barWidth: '50%',
            barGap: '-100%',
            itemStyle: {
              normal: {
                color: function (params) {
                  let colorList = ['#7ba75d', '#409EFF', '#d9742c', '#e6b451', '#e06c6c']
                  return colorList[params.dataIndex]
                },
                label: {
                  show: true,
                  position: 'bottom',
                  distance: 10,
                  formatter: function (value) {
                    if (value.data / (1000 * 1000 * 1000) > 1) {
                      return (value.data / (1000 * 1000 * 1000)).toFixed(1) + ' T'
                    } else if (value.data / (1000 * 1000) > 1) {
                      return (value.data / (1000 * 1000)).toFixed(1) + ' M'
                    } else if (value.data / 1000 > 1) {
                      return (value.data / 1000).toFixed(1) + ' K'
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    line() {
      let obj = {
        xAxis: {
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#409EFF',
              width: 1
            }
          }
        },
        grid: {
          left: '24px',
          right: '24px',
          top: '24px',
          bottom: '24px'
        },
        series: []
      }
      const { data } = this
      obj.xAxis.data = data.x || []
      let series = []
      if (data.y && data.y[0] instanceof Array) {
        data.y.forEach(el => {
          series.push(Object.assign(this.getLineSeriesItem(), { data: el }))
        })
      } else {
        series.push(Object.assign(this.getLineSeriesItem(), { data: data.y }))
      }
      obj.series = series
      this.setEmptyData(obj)
      return obj
    },
    pie() {
      // 需要传入 [{ value: 1, name: 'A', color: 'red' },{ value: 2, name: 'B', color: 'blue' }...]
      let series = this.data.map(el => {
        if (el.color) {
          if (!el.itemStyle) {
            el.itemStyle = {}
          }
          el.itemStyle.color = el.color
        }
        return el
      })
      let obj = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          icon: 'circle'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            label: { show: false },
            labelLine: { show: false },
            data: series
          }
        ]
      }
      const { options } = this
      if (options) {
        if (options.radius) {
          obj.series[0].radius = options.radius?.length === 2 ? options.radius : ['65%', '90%']
        }
        if (options.center) {
          obj.series[0].center = options.center
        }
      }
      return obj
    },
    getLineSeriesItem() {
      const { options } = this
      let item = {
        type: 'line',
        smooth: true,
        data: []
      }
      if (options) {
        if (options.smooth) {
          item.smooth = options.smooth
        }
      }
      return item
    },
    setEmptyData(data) {
      const { noX, noY } = this
      if (!noX || data.xAxis.data?.length) {
        data.yAxis.min = null
        data.yAxis.max = null
        return
      }
      let result
      let stamp = new Date().getTime()
      if (typeof noX === 'string') {
        switch (noX) {
          case 'second':
          case 'min':
          case 'hour':
          case 'day':
          case 'time':
            result = new Array(10).fill().map((t, i) => {
              let time = stamp + i * 10000
              return this.formatTime(noX, time)
            })
            break
          default:
            result = new Array(10).fill().map((t, i) => i++)
            break
        }
      } else {
        result = noX
      }
      data.xAxis.data = result
      data.yAxis.min = noY[0] || 0
      data.yAxis.max = noY[1] || 1
    },
    formatTime(type, time) {
      let map = {
        second: 'HH:mm:ss',
        min: 'HH:mm',
        hour: 'HH:00',
        day: 'MM-DD'
      }
      return this.$moment(time).format(map[type] || 'YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style lang="scss" scoped>
.type-chart-container {
  width: 100%;
  height: 100%;
}
</style>
