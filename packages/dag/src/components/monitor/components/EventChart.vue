<template>
  <div class="event-chart">
    <div v-if="total" class="total-line flex align-items-center">
      <span class="font-color-normal fw-bold fs-3 din-font">{{ calcUnit(total.input) }}</span>
      <span class="ml-2">总输入</span>
      <ElDivider direction="vertical" class="divider mx-4"></ElDivider>
      <span class="font-color-normal fw-bold fs-3 din-font">{{ calcUnit(total.output) }}</span>
      <span class="ml-2">总输出</span>
    </div>
    <Chart :extend="options" :style="{ height }"></Chart>
  </div>
</template>

<script>
import { Chart } from '@tap/component'
import { calcUnit } from '@tap/shared'

export default {
  name: 'EventChart',
  components: { Chart },
  props: {
    samples: {
      type: Object,
      required: true
    },
    yData: {
      type: Array,
      default: () => ['总输入', '总输出']
    },
    height: {
      type: String,
      default: '140px'
    }
  },
  data() {
    return {
      color: ['#88DBDA', '#6ACA26', '#FDD746', '#B682CE', '#00A1F1'],
      total: {
        input: 0,
        output: 0
      },
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        legend: {
          right: 0,
          bottom: 0,
          itemWidth: 12,
          itemHeight: 6,
          itemGap: 16,
          textStyle: {
            color: '#535F72'
          }
        },
        grid: {
          top: 0,
          left: 0,
          right: 0,
          bottom: '24px',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#535F72',
            showMaxLabel: false,
            showMinLabel: false,
            formatter: val => {
              return calcUnit(val)
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E9E9E9'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#E9E9E9'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#535F72'
          },
          data: this.yData
        },
        series: []
      }
    }
  },
  watch: {
    samples: {
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
      const { input, output } = this.samples || {}
      if (!(input && output)) {
        return
      }
      this.total.input = eval(Object.values(input).join('+'))
      this.total.output = eval(Object.values(output).join('+'))
      let arr = [
        {
          label: '插入',
          key: 'inserted',
          color: '#88DBDA'
        },
        {
          label: '更新',
          key: 'updated',
          color: '#6ACA26'
        },
        {
          label: '删除',
          key: 'deleted',
          color: '#FDD746'
        },
        {
          label: 'DDL',
          key: 'ddl',
          color: '#B682CE'
        },
        {
          label: '其他',
          key: 'other',
          color: '#00A1F1'
        }
      ]
      let series = arr.map(t => {
        return {
          type: 'bar',
          stack: 'total',
          barWidth: 12,
          name: t.label,
          color: t.color,
          data: [input[t.key], output[t.key]]
        }
      })
      this.options.series = series
    },

    calcUnit() {
      return calcUnit(...arguments)
    }
  }
}
</script>

<style lang="scss" scoped>
.total-line {
  margin-bottom: 8px;
}
</style>
