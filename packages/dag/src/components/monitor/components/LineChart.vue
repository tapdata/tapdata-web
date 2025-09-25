<script>
import { Chart } from '@tap/component'

import i18n from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { debounce, isNumber } from 'lodash-es'

export default {
  name: 'LineChart',

  components: { Chart },

  props: {
    title: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: () => {
        return {
          x: [],
          name: [i18n.t('public_title')],
          value: [],
        }
      },
    },
    color: {
      type: Array,
      default: () => ['#26CF6C'],
    },
    limit: {
      type: Number,
    },
    timeFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss',
    },
    options: {
      type: Object,
    },
    timeValue: {
      type: Boolean,
      default: false,
    },
    // 不支持存在负数的情况
    autoScale: {
      type: Boolean,
      default: false,
    },
    labelUnitType: {
      type: String,
    },
  },

  data() {
    return {
      extend: null,
      end: 100,
      max: 0,
      min: 0,
      minNotZero: 0,
    }
  },

  computed: {
    canScale() {
      const { max, minNotZero } = this
      return this.autoScale && Math.ceil(max / minNotZero / 100) > 1
    },
  },

  watch: {
    data: {
      deep: true,
      handler() {
        this.init()
      },
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.max = 0
      this.min = 0
      this.minNotZero = 0

      const { x, value, name, markLine, yAxisMax } = this.data
      const { limit } = this
      const series = []

      if (Array.isArray(value?.[0])) {
        value.forEach((el, index) => {
          series.push(
            this.getSeriesItem(
              el || [],
              index,
              name?.[index],
              markLine?.[index],
            ),
          )
        })
      } else {
        series.push(this.getSeriesItem(value || []))
      }
      const options = this.getOptions()
      options.series = series
      const seriesNoData = series.every(
        (t) => !t.data.filter((d) => !!d).length,
      )
      if (seriesNoData) {
        options.yAxis.max = isNumber(yAxisMax) ? yAxisMax : 1
        options.yAxis.min = 0
      } else {
        options.yAxis.max = isNumber(yAxisMax) ? yAxisMax : null
      }

      if (x.length) {
        options.xAxis.data = x
      } else {
        const now = Time.now()
        const count = this.limit || 5
        options.xAxis.data = Array.from({ length: count })
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
            startValue: String(x[len - 1 - limit]),
            endValue: String(x[len - 1]),
          },
        ]
        this.$refs.chart.chart?.chart.on(
          'datazoom',
          debounce((params) => {
            const { end } = params?.batch?.[0] || {}
            this.end = end
          }, 100),
        )
      }

      if (this.end === 100) {
        const isEmptyData = options.series.every((t) => !t.data.length)
        this.extend = Object.assign(
          {},
          {
            title: {
              show: isEmptyData,
              textStyle: {
                color: '#86909c',
                fontSize: 14,
                fontWeight: '500',
                opacity: 0.7,
              },
              text: i18n.t('public_data_no_data'),
              left: 'center',
              top: 'center',
            },
          },
          options,
        )

        console.log(this.extend)
      }
    },
    getOptions() {
      const { canScale, max, minNotZero } = this
      const result = {
        tooltip: {
          borderRadius: 12,
          trigger: 'axis',
          backgroundColor: 'rgba(54, 66, 82, 0.9)',
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          formatter: (params) => {
            let result = ''
            params.forEach((item, index) => {
              const { axisValue, marker, seriesName, data } = item
              const markerStr = marker.replaceAll(
                /background-color:#\w+;/g,
                `background-color:${this.color[index]};`,
              )
              if (!index) {
                result += dayjs(Number(axisValue)).format('YYYY-MM-DD HH:mm:ss')
              }
              let val = (canScale && data < 0 ? 0 : data) || 0
              if (![null, undefined].includes(data)) {
                if (this.timeValue) {
                  val = calcTimeUnit(val, 2, {
                    digits: 2,
                  })
                } else if (this.labelUnitType) {
                  val = calcUnit(val, this.labelUnitType)
                } else {
                  val = val.toLocaleString('zh', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }
              }

              result += `<div class="flex justify-content-between"><div>${markerStr}${seriesName}</div><div class="din-font">${val}</div></div>`
            })
            return result
          },
        },
        showRectindicators: true,
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          outerBounds: {
            left: 0,
            top: 0,
            right: 10,
            bottom: 0,
          },
          outerBoundsMode: 'auto',
          outerBoundsContain: 'auto',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: canScale ? '#fff' : '#E9E9E9',
            },
          },
          axisLabel: {
            color: '#535F72',
            formatter: (val) => {
              return dayjs(Number(val)).format(this.timeFormat)
            },
          },
        },
        yAxis: {
          min: !canScale ? null : 0 - Math.ceil(max / minNotZero / 100),
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E9E9E9',
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
          axisLabel: {
            show: true,
            color: '#535F72',
            formatter: (val) => {
              if (canScale) {
                if (val < 0) {
                  val = 0
                } else if (val === 0) {
                  val = null
                }
              }

              return this.timeValue
                ? calcTimeUnit(val || 0, 2, {
                    digits: 2,
                  })
                : calcUnit(val, this.labelUnitType)
            },
            // showMaxLabel: false,
            showMinLabel: canScale ? true : null,
          },
        },
        series: [],
      }
      const op = this.options
      if (op) {
        for (const key of Object.keys(op)) {
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
    getSeriesItem(data = [], index = 0, name = '', markLine) {
      let myData = data

      // 最大值
      const max = Math.max(...myData)
      if (!this.max || max > this.max) {
        this.max = max
      }

      // 最小值
      const min = Math.min(...myData)
      if (!this.min || min < this.min) {
        this.min = min
      }

      // 非零的最小值
      const minNotZero = Math.min(...myData.filter((t) => !!t))
      if (!this.minNotZero || minNotZero < this.minNotZero) {
        this.minNotZero = minNotZero
      }

      if (this.canScale) {
        // 0改成负数，按照比例计算
        const { max, minNotZero } = this
        myData = myData.map((el) => {
          el = el ? el : 0 - Math.ceil(max / minNotZero / 100)
          return el
        })
      }

      return {
        name,
        type: 'line',
        data: myData,
        smooth: true,
        symbol: 'none',
        label: {
          show: false,
        },
        lineStyle: {
          color: this.color[index],
          width: 1,
        },
        areaStyle: {
          color: this.color[index],
          opacity: 0.1,
          origin: 'start',
        },
        markLine,
      }
    },
    reset() {
      this.end = 100
    },
    clear() {
      this.$refs.chart.chart?.chart?.clear()
    },
  },
}
</script>

<template>
  <div class="line-chart flex flex-column">
    <div v-if="title" class="font-color-dark fw-bold">{{ title }}</div>
    <Chart ref="chart" :extend="extend" class="flex-fill" />
  </div>
</template>
