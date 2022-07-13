<template>
  <div class="pie-chart">
    <Chart :extend="options"></Chart>
  </div>
</template>

<script>
import { Chart } from '@tap/component'

export default {
  name: 'PieChart',

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
          value: [12, 3, 42, 4, 78, 24, 7, 5, 44, 22, 12, 3, 42, 4, 78, 24, 7, 5, 44, 222]
        }
      }
    },
    color: {
      type: String,
      default: '#26CF6C'
    },
    limit: {
      type: Number,
      default: 10
    }
  },

  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis'
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
          data: this.data?.x,
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
            color: '#535F72'
            // showMaxLabel: false,
            // showMinLabel: false
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
            color: '#535F72'
            // showMaxLabel: false,
            // showMinLabel: false
          }
        },
        series: {
          // name: this.title,
          type: 'line',
          data: [],
          smooth: true,
          symbol: 'none',
          label: {
            show: false
          },
          lineStyle: {
            color: this.color
          },
          areaStyle: {
            color: this.color,
            opacity: 0.1
          }
        }
      }
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
      this.options.series.data = this.data.value || []
      const { limit } = this
      if (limit) {
        this.options.dataZoom = [
          {
            type: 'inside',
            zoomLock: true,
            startValue: this.data.x[this.data.value.length - limit]
          }
        ]
      }
    }
  }
}
</script>
