<template>
  <VChart ref="chart" :option="chartOption" :autoresize="autoresize" class="type-chart-container" />
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

export default {
  name: 'Chart',
  components: { VChart },
  props: {
    type: {
      type: String,
      default: 'bar'
    },
    data: {
      type: [Array, Object]
    },
    // 和默认配置，合并再渲染
    options: {
      type: Object
    },
    // 当做完整配置，直接渲染
    extend: {
      type: Object
    },
    autoresize: {
      type: Boolean,
      default: true
    },
    // 横坐标没数据，string传入指定类型，Array直接渲染横坐标
    noX: {
      type: [String, Array]
    },
    // 纵坐标，需要传入最小、大值数组 [min, max]
    noY: {
      type: Array,
      default: () => [0, 1]
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartOption: {}
    }
  },
  computed: {
    chart() {
      return this.$refs.chart || {}
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
    window.addEventListener('resize', this.resize)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.resize)
    })
  },
  methods: {
    init() {
      const { events, extend, chart } = this
      if (events.length) {
        let getDom = chart?.chart
        events.forEach(t => {
          getDom.on(t.name, t.method)
        })
      }
      if (extend) {
        if (JSON.stringify(this.chartOption) !== JSON.stringify(extend)) {
          this.chartOption = extend
        }
        return
      }
      let obj = this[this.type]?.()
      const { options } = this
      if (options) {
        for (let key in options) {
          // 对象默认合并，其他都是覆盖
          if (options[key] instanceof Array) {
            if (typeof options[key][0] !== 'object') {
              obj[key] = options[key]
            }
            options[key].forEach((el, i) => {
              if (typeof el === 'object') {
                // 覆盖
                if (el.cover) {
                  obj[key][i] = el
                } else {
                  if (obj[key]) {
                    obj[key][i] = Object.assign({}, obj[key][i] || {}, el || {})
                  } else {
                    obj[key] = options[key]
                  }
                }
              } else {
                obj[key][i] = el
              }
            })
          } else if (typeof options[key] === 'object') {
            // 覆盖
            if (options[key].cover) {
              obj[key] = options[key]
            } else {
              // 合并
              obj[key] = Object.assign({}, obj[key] || {}, options[key] || {})
            }
          } else {
            obj[key] = options[key]
          }
        }
      }
      this.chartOption = obj
    },
    bar() {
      // 需要传入 [{ value: 1, name: 'A', color: 'red' },{ value: 2, name: 'B', color: 'blue' }...] 单系列
      // 需要传入 { x: [], y: [[], []] }，y数组支持多系列
      let obj = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        grid: {
          // left: '10%',
          // right: '10%',
          // bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          // show: true,
          axisLine: {
            show: false
            // lineStyle: {
            //   type: 'dashed'
            //   // color: '#666',
            //   // width: 0
            // }
          },
          axisLabel: {
            // margin: 30
          },
          axisTick: {
            show: false
          },
          data: [],
          axisPointer: {
            show: false,
            type: 'shadow'
          },
          nameTextStyle: {
            // verticalAlign: 'bottom',
            // color: '#F00'
          }
        },
        yAxis: {
          show: false
        },
        series: [
          {
            type: 'bar',
            data: [],
            colorBy: 'value'
            // barWidth: '50%',
            // barGap: '-100%'
            // itemStyle: {
            //   normal: {
            //     // color: function (params) {
            //     //   let colorList = ['#7ba75d', '#409EFF', '#d9742c', '#e6b451', '#e06c6c']
            //     //   return colorList[params.dataIndex]
            //     // },
            //     label: {
            //       show: true,
            //       position: 'bottom',
            //       distance: 10,
            //       formatter: function (value) {
            //         if (value.data / (1000 * 1000 * 1000) > 1) {
            //           return (value.data / (1000 * 1000 * 1000)).toFixed(1) + ' T'
            //         } else if (value.data / (1000 * 1000) > 1) {
            //           return (value.data / (1000 * 1000)).toFixed(1) + ' M'
            //         } else if (value.data / 1000 > 1) {
            //           return (value.data / 1000).toFixed(1) + ' K'
            //         }
            //       }
            //     }
            //   }
            // }
          }
        ]
      }
      const { data, options } = this
      if (data instanceof Array) {
        let color = data.map(t => t.color)
        obj.xAxis.data = data.map(t => t.name)
        obj.series[0].data = data.map(t => t.value)
        if (color.length) {
          obj.color = color
        }
      } else {
        // 需要传入 { x: [], y: [[], []] }，y数组支持多系列
        obj.xAxis.data = data.x
        let series = []
        data.y.forEach(el => {
          series.push(Object.assign(this.getBarSeriesItem(), { data: el }))
        })
        obj.series = series
      }
      if (options) {
        if (options.series) {
          options.series.forEach((el, i) => {
            Object.assign(obj.series[i], el)
            if (el.labelFormat === 'KMT') {
              const { valueToFixed } = this
              obj.series[i].itemStyle = {
                normal: {
                  label: {
                    show: true,
                    position: 'top',
                    distance: 10,
                    formatter: function (value) {
                      if (value.data / (1000 * 1000 * 1000) > 1) {
                        return valueToFixed(value.data / (1000 * 1000 * 1000), el.fixed) + ' T'
                      } else if (value.data / (1000 * 1000) > 1) {
                        return valueToFixed(value.data / (1000 * 1000), el.fixed) + ' M'
                      } else if (value.data / 1000 > 1) {
                        return valueToFixed(value.data / 1000, el.fixed) + ' K'
                      }
                    }
                  }
                }
              }
            }
          })
        }
      }
      return obj
    },
    line() {
      // 需要传入 { x: [], y: [[], []] }，y数组支持多系列
      let obj = {
        xAxis: {
          boundaryGap: false,
          data: [],
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          },
          axisTick: {
            show: false
          }
        },
        yAxis: [
          {
            type: 'value',
            max: 'dataMax',
            axisLine: {
              show: true
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          }
        ],
        grid: {
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc'
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
      // 环形图只需在options中设置radius: true
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
    getBarSeriesItem() {
      const { options } = this
      let item = {
        type: 'bar',
        data: [],
        colorBy: 'value'
      }
      if (options) {
        if (options.barWidth) {
          item.barWidth = options.barWidth
        }
      }
      return item
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
        data.yAxis[0].min = null
        data.yAxis[0].max = null
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
            result = new Array(20).fill().map((t, i) => {
              let time = stamp + i * 10000
              return this.formatTime(noX, time)
            })
            break
          default:
            result = new Array(20).fill().map((t, i) => i++)
            break
        }
      } else {
        result = noX
      }
      data.xAxis.data = result
      data.yAxis[0].min = noY[0] || 0
      data.yAxis[0].max = noY[1] || 1
    },
    formatTime(type, time) {
      let map = {
        second: 'HH:mm:ss',
        min: 'HH:mm',
        hour: 'HH:00',
        day: 'MM-DD'
      }
      return dayjs(time).format(map[type] || 'YYYY-MM-DD HH:mm:ss')
    },
    valueToFixed(val, fixed) {
      if (fixed) {
        return val.toFixed(fixed)
      }
      return val
    },
    resize() {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.chart?.resize?.()
      }, 300)
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
