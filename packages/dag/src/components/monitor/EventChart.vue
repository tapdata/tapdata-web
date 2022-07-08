<template>
  <div>
    <div class="flex align-items-center mb-2">
      <span class="font-color-normal fw-bold fs-3 din-font">{{ total[0].value }}</span>
      <span class="ml-2">{{ total[0].label }}</span>
      <ElDivider direction="vertical" class="divider mx-4"></ElDivider>
      <span class="font-color-normal fw-bold fs-3 din-font">{{ total[1].value }}</span>
      <span class="ml-2">{{ total[1].label }}</span>
    </div>
    <div>
      <span class="invisible">{{ total[0].label }}</span>
      <span class="ml-2">事件统计（条）累计：</span>
      <span>3,456,789</span>
    </div>
    <Chart type="bar" :extend="barOptions" :style="{ height }"></Chart>
  </div>
</template>

<script>
import { Chart } from '@tap/component'

export default {
  name: 'EventChart',
  components: { Chart },
  props: {
    total: {
      type: Array,
      default: () => [
        {
          label: '总输入',
          value: '70.3K'
        },
        {
          label: '总输出',
          value: '29.7K'
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
          name: '插入',
          data: [10, 6]
        },
        {
          name: '更新',
          data: [10, 6]
        },
        {
          name: '删除',
          data: [10, 6]
        },
        {
          name: 'DDL',
          data: [10, 6]
        },
        {
          name: '其他',
          data: [10, 6]
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
      barOptions: {
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
          name: el.name,
          color: el.color || this.color[index],
          data: el.data
        })
      })
      this.barOptions.series = series
    }
  }
}
</script>

<style lang="scss" scoped></style>
