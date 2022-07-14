<template>
  <div>
    <div v-if="total" class="flex align-items-center mb-2">
      <span class="font-color-normal fw-bold fs-3 din-font">{{ formatNumber(total[0].value) }}</span>
      <span class="ml-2">{{ total[0].label }}</span>
      <ElDivider direction="vertical" class="divider mx-4"></ElDivider>
      <span class="font-color-normal fw-bold fs-3 din-font">{{ formatNumber(total[1].value) }}</span>
      <span class="ml-2">{{ total[1].label }}</span>
    </div>
    <div v-if="total && total[2]">
      <span class="invisible">{{ total[0].label }}</span>
      <span class="ml-2">{{ total[2].label }}</span>
      <span>{{ formatNumber(total[2].value, 'thousands') }}</span>
    </div>
    <Chart :extend="options" :style="{ height }"></Chart>
  </div>
</template>

<script>
import { Chart } from '@tap/component'
import { formatNumber } from '../../../util'

export default {
  name: 'EventChart',
  components: { Chart },
  props: {
    total: {
      type: Array,
      default: () => [
        {
          label: '总输入',
          value: 0
        },
        {
          label: '总输出',
          value: 0
        },
        {
          label: '事件统计（条）累计：',
          value: 0
        }
      ]
    },
    yData: {
      type: Array,
      default: () => ['总输入', '总输出']
    },
    xData: {
      type: Array,
      default: () => [
        {
          label: '插入',
          data: [0, 0]
        },
        {
          label: '更新',
          data: [0, 0]
        },
        {
          label: '删除',
          data: [0, 0]
        },
        {
          label: 'DDL',
          data: [0, 0]
        },
        {
          label: '其他',
          data: [0, 0]
        }
      ]
    },
    height: {
      type: String,
      default: '140px'
    }
  },
  data() {
    return {
      color: ['#88DBDA', '#6ACA26', '#FDD746', '#B682CE', '#00A1F1'],
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
            showMinLabel: false
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
    xData: {
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
      let series = []
      this.xData.forEach((el, index) => {
        series.push({
          type: 'bar',
          stack: 'total',
          barWidth: 12,
          name: el.label,
          color: el.color || this.color[index],
          data: el.value
        })
      })
      this.options.series = series
    },
    formatNumber() {
      return formatNumber(...arguments)
    }
  }
}
</script>

<style lang="scss" scoped></style>
