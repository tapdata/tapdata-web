<template>
  <VEchart :option="chartOption" class="type-chart-container"></VEchart>
</template>

<script>
import VEchart from './VEchart'

export default {
  name: 'TypeChart',
  components: { VEchart },
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
          this.chartOption = v
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
        return
      }
      this.chartOption = this[this.type]?.()
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
          show: false
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
      let timeList = []
      let inputCountList = []
      let outputCountList = []
      return {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 0
        },
        grid: {
          left: 0,
          right: 0,
          bottom: '3%',
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc'
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#409EFF',
              width: 1 // 这里是为了突出显示加上的
            }
          },
          data: timeList
        },
        yAxis: {
          max: this.yMax,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#409EFF',
              width: 1
            }
          },
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            }
          }
        },
        series: [
          {
            name: this.$t('task_info_input'),
            type: 'line',
            smooth: true,
            data: inputCountList,
            itemStyle: {
              color: '#2ba7c3'
            },
            lineStyle: {
              color: '#2ba7c3'
            },
            areaStyle: {
              color: '#2ba7c3'
            }
          },
          {
            name: this.$t('task_info_output'),
            type: 'line',
            smooth: true,
            data: outputCountList,
            itemStyle: {
              color: '#61a569'
            },
            lineStyle: {
              color: '#8cd5c2'
            },
            areaStyle: {
              color: '#8cd5c2'
            }
          }
        ]
      }
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
            data: series,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      const { options } = this
      if (options) {
        if (options.radius) {
          obj.series[0].radius = options.radius?.length === 2 ? options.radius : ['40%', '70%']
        }
        if (options.center) {
          obj.series[0].center = options.center
        }
        for (let key in options) {
          Object.assign(obj[key] || {}, options[key] || {})
        }
      }
      return obj
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
