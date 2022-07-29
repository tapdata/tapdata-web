<template>
  <div class="line-chart">
    <Chart ref="chart" :extend="extend"></Chart>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { Chart } from '@tap/component'
import { calcUnit } from '@tap/shared'

export default {
  name: 'LineChart',

  components: { Chart },

  props: {
    title: {
      type: String,
      default: '标题'
    },
    data: {
      type: Object,
      default: () => {
        return {
          x: [
            '2000-06-01',
            '2000-06-02',
            '2000-06-03',
            '2000-06-04',
            '2000-06-05',
            '2000-06-06',
            '2000-06-07',
            '2000-06-08',
            '2000-06-09',
            '2000-06-10',
            '2000-06-11',
            '2000-06-12',
            '2000-06-13',
            '2000-06-14',
            '2000-06-15',
            '2000-06-16',
            '2000-06-17',
            '2000-06-18',
            '2000-06-19',
            '2000-06-20'
          ],
          name: ['标题'],
          value: [12, 3, 42, 4, 78, 24, 7, 5, 44, 22, 12, 3, 42, 4, 78, 24, 7, 5, 44, 222]
        }
      }
    },
    color: {
      type: Array,
      default: () => ['#26CF6C']
    },
    limit: {
      type: Number,
      default: 10
    },
    timeFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    }
  },

  data() {
    return {
      extend: null,
      end: 100
    }
  },

  watch: {
    data: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      const { x, value, name } = this.data
      const { limit } = this
      let options = this.getOptions()
      let series = []
      if (value?.[0] instanceof Array) {
        value.forEach((el, index) => {
          series.push(this.getSeriesItem(el || [], index, name?.[index]))
        })
      } else {
        series.push(this.getSeriesItem(value || []))
      }
      options.series = series
      options.xAxis.data = x

      if (limit && x?.length) {
        const len = x?.[0]?.length || x.length
        options.dataZoom = [
          {
            type: 'inside',
            zoomLock: true,
            zoomOnMouseWheel: false,
            moveOnMouseWheel: false,
            startValue: x[len - 1 - limit] + '',
            endValue: x[len - 1] + ''
          }
        ]
      }
      this.$refs.chart.chart?.chart.on(
        'datazoom',
        debounce(params => {
          const { end } = params?.batch?.[0] || {}
          this.end = end
        }, 100)
      )
      if (this.end === 100) {
        this.extend = options
      }
    },
    getOptions() {
      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#364252',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: params => {
            let result = ''
            params.forEach((item, index) => {
              const { axisValue, marker, seriesName, data } = item
              if (!index) {
                result += dayjs(Number(axisValue)).format('YYYY-MM-DD HH:mm:ss')
              }
              result += `<div class="flex justify-content-between"><div>${marker}${seriesName}</div><div class="din-font">${calcUnit(
                data
              )}</div></div>`
            })
            return result
          }
        },
        grid: {
          top: '20px',
          // top: 0,
          left: 0,
          right: 0,
          // bottom: '24px',
          bottom: 0,
          containLabel: true
        },
        xAxis: {
          type: 'category',
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
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E9E9E9'
            }
          },
          axisLabel: {
            color: '#535F72',
            formatter: val => {
              return dayjs(Number(val)).format(this.timeFormat)
            }
          }
        },
        yAxis: {
          name: this.title,
          nameTextStyle: {
            color: 'rgba(0,0,0,0.6500)',
            align: 'left',
            verticalAlign: 'top'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E9E9E9'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#535F72',
            formatter: val => {
              return calcUnit(val)
            }
            // showMaxLabel: false,
            // showMinLabel: false
          }
        },
        series: []
      }
    },
    getSeriesItem(data = [], index = 0, name = '') {
      return {
        name,
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'none',
        label: {
          show: false
        },
        lineStyle: {
          color: this.color[index],
          width: 1
        },
        areaStyle: {
          color: this.color[index],
          opacity: 0.1
        }
      }
    }
  }
}
</script>
