<script setup lang="ts">
import { delayTrigger } from '@tap/shared'
import { useDark } from '@vueuse/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'

// Types
interface ChartDataItem {
  value: number
  name: string
  color?: string
  itemStyle?: any
}

interface ChartDataObject {
  x: any[]
  y: any[][]
}

interface ChartEvent {
  name: string
  method: Function
}

interface ChartOptions {
  cover?: boolean
  barWidth?: string | number
  smooth?: boolean | number
  radius?: boolean | [string, string]
  center?: [string, string]
  series?: any[]
  [key: string]: any
}

interface ChartProps {
  type?: string
  data?: ChartDataItem[] | ChartDataObject
  options?: ChartOptions
  extend?: any
  autoresize?: boolean
  noX?: string | any[]
  noY?: number[]
  events?: ChartEvent[]
}

// Props
const props = withDefaults(defineProps<ChartProps>(), {
  autoresize: true,
  noY: () => [0, 1],
  events: () => [],
})

// Refs
const chartRef = ref<any>({})

// Chart option state
const chartOption = ref<any>({})
const isDark = useDark()

// Initialize echarts components
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
  DataZoomComponent,
  MarkLineComponent,
])

// Computed
const chart = computed(() => chartRef.value || {})

const getChartConfig = () => {
  switch (props.type) {
    case 'bar':
      return bar()
    case 'line':
      return line()
    case 'pie':
      return pie()
    default:
      return {}
  }
}

const getBarSeriesItem = () => {
  const { options } = props
  const item: any = {
    type: 'bar',
    data: [],
    colorBy: 'value',
  }
  if (options?.barWidth) {
    item.barWidth = options.barWidth
  }
  return item
}

const getLineSeriesItem = () => {
  const { options } = props
  const item: any = {
    type: 'line',
    smooth: true,
    data: [],
  }
  if (options?.smooth) {
    item.smooth = options.smooth
  }
  return item
}

const setEmptyData = (data: any) => {
  const { noX, noY } = props
  if (!noX || data.xAxis.data?.length) {
    data.yAxis[0].min = null
    data.yAxis[0].max = null
    return
  }
  data.xAxis.data = noX
  data.yAxis[0].min = noY[0] || 0
  data.yAxis[0].max = noY[1] || 1
}

const valueToFixed = (val: number, fixed?: number) => {
  if (fixed) {
    return val.toFixed(fixed)
  }
  return val
}

const bar = () => {
  // 需要传入 [{ value: 1, name: 'A', color: 'red' },{ value: 2, name: 'B', color: 'blue' }...] 单系列
  // 需要传入 { x: [], y: [[], []] },y数组支持多系列
  const obj: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
    },
    grid: {
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      axisLine: {
        show: false,
      },
      axisLabel: {},
      axisTick: {
        show: false,
      },
      data: [] as any[],
      axisPointer: {
        show: false,
        type: 'shadow',
      },
      nameTextStyle: {},
    },
    yAxis: {
      show: false,
    },
    series: [
      {
        type: 'bar',
        data: [] as any[],
        colorBy: 'value',
      },
    ],
  }
  const { data, options } = props
  if (data && Array.isArray(data)) {
    const color = (data as ChartDataItem[]).map((t) => t.color).filter(Boolean)
    obj.xAxis.data = (data as ChartDataItem[]).map((t) => t.name)
    obj.series[0].data = (data as ChartDataItem[]).map((t) => t.value)
    if (color.length) {
      obj.color = color
    }
  } else if (data && typeof data === 'object' && 'x' in data) {
    // 需要传入 { x: [], y: [[], []] },y数组支持多系列
    const chartData = data as ChartDataObject
    obj.xAxis.data = chartData.x
    const series: any[] = []
    chartData.y.forEach((el) => {
      series.push(Object.assign(getBarSeriesItem(), { data: el }))
    })
    obj.series = series
  }
  if (options && options.series) {
    options.series.forEach((el, i) => {
      Object.assign(obj.series[i], el)
      if (el.labelFormat === 'KMT') {
        obj.series[i].itemStyle = {
          normal: {
            label: {
              show: true,
              position: 'top',
              distance: 10,
              formatter(value: any) {
                if (value.data / (1000 * 1000 * 1000) > 1) {
                  return `${valueToFixed(
                    value.data / (1000 * 1000 * 1000),
                    el.fixed,
                  )} T`
                } else if (value.data / (1000 * 1000) > 1) {
                  return `${valueToFixed(value.data / (1000 * 1000), el.fixed)} M`
                } else if (value.data / 1000 > 1) {
                  return `${valueToFixed(value.data / 1000, el.fixed)} K`
                }
              },
            },
          },
        }
      }
    })
  }
  return obj
}

const line = () => {
  // 需要传入 { x: [], y: [[], []] },y数组支持多系列
  const obj: any = {
    xAxis: {
      boundaryGap: false,
      data: [] as any[],
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: 'value',
        max: 'dataMax',
        axisLine: {
          show: true,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
    ],
    grid: {
      containLabel: true,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    series: [] as any[],
  }
  const { data } = props
  if (data && typeof data === 'object' && 'x' in data) {
    obj.xAxis.data = (data as ChartDataObject).x || []
    const series: any[] = []
    const chartData = data as ChartDataObject
    if (chartData.y && Array.isArray(chartData.y[0])) {
      chartData.y.forEach((el) => {
        series.push(Object.assign(getLineSeriesItem(), { data: el }))
      })
    } else {
      series.push(Object.assign(getLineSeriesItem(), { data: chartData.y }))
    }
    obj.series = series
    setEmptyData(obj)
  }
  return obj
}

const pie = () => {
  // 需要传入 [{ value: 1, name: 'A', color: 'red' },{ value: 2, name: 'B', color: 'blue' }...]
  // 环形图只需在options中设置 radius: true
  let series: any[] = []
  if (props.data && Array.isArray(props.data)) {
    series = (props.data as ChartDataItem[]).map((el) => {
      if (el.color) {
        if (!el.itemStyle) {
          el.itemStyle = {}
        }
        el.itemStyle.color = el.color
      }
      return el
    })
  }
  const obj: any = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      icon: 'circle',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        label: { show: false },
        labelLine: { show: false },
        data: series,
      },
    ],
  }
  const { options } = props
  if (options) {
    if (options.radius) {
      obj.series[0].radius =
        (options.radius as [string, string])?.length === 2
          ? options.radius
          : ['65%', '90%']
    }
    if (options.center) {
      obj.series[0].center = options.center
    }
  }
  return obj
}

// Methods
const init = () => {
  const { events, extend } = props
  if (events?.length) {
    const getDom = chart.value?.chart
    events.forEach((t) => {
      getDom.on(t.name, t.method)
    })
  }
  if (extend) {
    if (JSON.stringify(chartOption.value) !== JSON.stringify(extend)) {
      if (!extend.backgroundColor) {
        extend.backgroundColor = 'transparent'
      }
      chartOption.value = extend
    }
    return
  }
  if (!props.type) {
    return
  }
  const obj = getChartConfig()
  const { options } = props
  if (options) {
    for (const key in options) {
      // 对象默认合并,其他都是覆盖
      if (Array.isArray(options[key])) {
        if (typeof options[key][0] !== 'object') {
          obj[key] = options[key]
        }
        options[key].forEach((el, i) => {
          if (typeof el === 'object') {
            // 覆盖
            if (el.cover) {
              obj[key][i] = el
            } else if (obj[key]) {
              obj[key][i] = Object.assign({}, obj[key][i] || {}, el || {})
            } else {
              obj[key] = options[key]
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
  if (!obj.backgroundColor) {
    obj.backgroundColor = 'transparent'
  }
  chartOption.value = obj
}

const resize = () => {
  delayTrigger(() => {
    chart.value?.resize?.()
  }, 300)
}

// Watchers
watch(
  () => props.data,
  (v) => {
    v && init()
  },
  { deep: true },
)

watch(
  () => props.extend,
  (v) => {
    if (v) {
      v && init()
    }
  },
  { deep: true },
)

// Lifecycle hooks
onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <VChart
    ref="chartRef"
    :option="chartOption"
    :autoresize="autoresize"
    :theme="isDark ? 'dark' : 'default'"
    class="type-chart-container"
  />
</template>

<style lang="scss" scoped>
.type-chart-container {
  width: 100%;
  height: 100%;
}
</style>
