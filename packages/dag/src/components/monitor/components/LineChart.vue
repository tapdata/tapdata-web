<template>
  <div class="line-chart flex flex-column">
    <div v-if="title" class="font-color-dark fw-bold">{{ title }}</div>
    <Chart ref="chart" :extend="extend" class="flex-fill"></Chart>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { debounce } from 'lodash-es'
import dayjs from 'dayjs'
import { Chart } from '@tap/component'
import { calcUnit, calcTimeUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'

export default {
  name: 'LineChart',

  components: { Chart },

  props: {
    title: {
      type: String,
      default: ''
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
          name: [i18n.global.t('packages_dag_components_linechart_biaoti')],
          value: [12, 3, 42, 4, 78, 24, 7, 5, 44, 22, 12, 3, 42, 4, 78, 24, 7, 5, 44, 222]
        }
      }
    },
    color: {
      type: Array,
      default: () => ['#26CF6C']
    },
    limit: {
      type: Number
    },
    timeFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    options: {
      type: Object
    },
    timeValue: {
      type: Boolean,
      default: false
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
          series.push(this.getSeriesItem(el?.map(t => Math.abs(t || 0)) || [], index, name?.[index]))
        })
      } else {
        series.push(this.getSeriesItem(value?.map(t => Math.abs(t || 0)) || []))
      }
      options.series = series
      const seriesNoData = series.every(t => !t.data.length)
      options.yAxis.max = seriesNoData ? 1 : null
      options.yAxis.min = seriesNoData ? 0 : null
      if (x.length) {
        options.xAxis.data = x
      } else {
        const now = Time.now()
        const count = this.limit || 5
        options.xAxis.data = Array(count)
          .fill()
          .map((t, index) => now - (count - index - 1) * 5000)
      }

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
        this.$refs.chart.chart?.chart.on(
          'datazoom',
          debounce(params => {
            const { end } = params?.batch?.[0] || {}
            this.end = end
          }, 100)
        )
      }

      if (this.end === 100) {
        const isEmptyData = options.series.every(t => !t.data.length)
        this.extend = Object.assign(
          {},
          {
            title: {
              show: isEmptyData,
              textStyle: {
                color: '#86909c',
                fontSize: 14,
                fontWeight: '500',
                opacity: 0.7
              },
              text: i18n.global.t('packages_dag_dag_dialog_field_mapping_no_data'),
              left: 'center',
              top: 'center'
            }
          },
          options
        )
      }
    },
    getOptions() {
      let result = {
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
              let markerStr = marker.replace(/background-color:#\w+;/g, `background-color:${this.color[index]};`)
              if (!index) {
                result += dayjs(Number(axisValue)).format('YYYY-MM-DD HH:mm:ss')
              }
              let val = data
              if (![null, undefined].includes(data)) {
                if (this.timeValue) {
                  val = calcTimeUnit(data || 0, 2, {
                    digits: 2
                  })
                } else {
                  val = (data || 0).toLocaleString('zh', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }
              }

              result += `<div class="flex justify-content-between"><div>${markerStr}${seriesName}</div><div class="din-font">${val}</div></div>`
            })
            return result
          }
        },
        grid: {
          top: '8px',
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
              return this.timeValue
                ? calcTimeUnit(val || 0, 2, {
                    digits: 2
                  })
                : calcUnit(val)
            }
            // showMaxLabel: false,
            // showMinLabel: false
          }
        },
        series: []
      }
      const op = this.options
      if (op) {
        for (let key in op) {
          if (key === 'series') {
            result[key].forEach((el, index) => {
              Object.assign(el, op[key][index])
            })
          } else {
            Object.assign(result[key], op[key])
          }
        }
      }
      return result
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
    },
    reset() {
      this.end = 100
    },
    clear() {
      this.$refs.chart.chart?.chart?.clear()
    }
  }
}
</script>
