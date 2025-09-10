<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  //   LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import type { WorkerCallData } from '@tap/api'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  //   LegendComponent,
])

// Props interface
interface Props {
  workerMetrics?: WorkerCallData['workerMetrics']
  selectedWorker?: string
  height?: string | number
  colors?: string[]
  granularity?: number // 查询粒度：0-分钟，1-小时，2-天，3-周，4-月
}

const props = withDefaults(defineProps<Props>(), {
  workerMetrics: undefined,
  selectedWorker: '',
  height: '300px',
  colors: undefined,
  granularity: 0,
})

const chartRef = ref()

// Emits
const emit = defineEmits<{
  workerSelect: [workerName: string]
}>()

// Get display point count based on granularity
const getDisplayPointCount = (granularity: number): number => {
  // 默认显示过去5分钟的数据点
  const basePoints = 5

  switch (granularity) {
    case 0: // 分钟
      return basePoints // 5个点
    case 1: // 小时
      return 12 // 12个点（每小时一个点，过去12小时）
    case 2: // 天
      return 7 // 7个点（每天一个点，过去7天）
    case 3: // 周
      return 4 // 4个点（每周一个点，过去4周）
    case 4: // 月
      return 6 // 6个点（每月一个点，过去6个月）
    default:
      return basePoints
  }
}

// Computed chart data
const chartData = computed(() => {
  // 即使没有数据也返回空结构，不显示"暂无数据"
  if (!props.workerMetrics) {
    return {
      x: [],
      series: [],
    }
  }

  // 如果 workerMetrics 为空数组，返回空结构但保持图表显示
  if (props.workerMetrics.length === 0) {
    return {
      x: [],
      series: [],
    }
  }

  // Collect all unique time points from all workers
  const allTimePoints = new Set<number>()
  props.workerMetrics.forEach((worker) => {
    if (worker.workerMetric?.time) {
      worker.workerMetric.time.forEach((timestamp) => {
        allTimePoints.add(timestamp)
      })
    }
  })

  if (allTimePoints.size === 0) {
    return {
      x: [],
      series: [],
    }
  }

  // Sort time points and limit by granularity
  const sortedTimePoints = Array.from(allTimePoints).sort((a, b) => a - b)
  const maxPoints = getDisplayPointCount(props.granularity)
  const displayTimePoints = sortedTimePoints.slice(-maxPoints) // 取最新的N个点

  // Format time labels for category axis
  const formattedTimeLabels = displayTimePoints.map((timestamp) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  })

  // Create a map for quick time lookup
  const timeIndexMap = new Map<number, number>()
  displayTimePoints.forEach((timestamp, index) => {
    timeIndexMap.set(timestamp, index)
  })

  // Process all workers' data with aligned time points
  const series = props.workerMetrics.map((worker) => {
    const workerTime = worker.workerMetric?.time || []
    const workerRps = worker.workerMetric?.rps || []

    // Create aligned data array for category axis
    const alignedData: (number | null)[] = Array.from(
      { length: displayTimePoints.length },
      () => null,
    )

    workerTime.forEach((timestamp, index) => {
      const timeIndex = timeIndexMap.get(timestamp)
      if (timeIndex !== undefined && index < workerRps.length) {
        const rpsValue = workerRps[index]
        alignedData[timeIndex] =
          rpsValue === null ? 0 : Number(rpsValue.toFixed(2)) || 0
      }
    })

    return {
      name: worker.workerName,
      data: alignedData,
    }
  })

  return {
    x: formattedTimeLabels,
    series,
  }
})

// Chart options
const chartOptions = computed(() => {
  const baseOptions = {
    legend: {
      show: false,
      bottom: 0,
      type: 'scroll',
      pageIconColor: '#409EFF',
      pageIconInactiveColor: '#ccc',
      pageTextStyle: {
        color: '#666',
      },
    },
    tooltip: {
      trigger: 'axis',
      borderRadius: 12,
      borderColor: '#dee0e3',
      extraCssText:
        'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    },
    grid: {
      left: 20,
      right: 20,
      bottom: 0,
      top: 10,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.x,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#666',
        fontSize: 12,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: chartData.value.series.map((worker) => {
      return {
        name: worker.name,
        type: 'line',
        data: worker.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          focus: 'series',
        },
        // Add click event
        select: {
          itemStyle: {
            borderColor: '#409EFF',
            borderWidth: 4,
          },
        },
      }
    }),
  }

  // Add colors to options if provided
  if (props.colors && props.colors.length > 0) {
    return {
      ...baseOptions,
      color: props.colors,
    }
  }

  return baseOptions
})

// Handle resize
const handleResize = () => {
  if (chartRef.value) {
    chartRef.value.resize()
  }
}

// Handle chart click events
const handleChartClick = (params: any) => {
  if (params && params.seriesName) {
    emit('workerSelect', params.seriesName)
  }
}

// Watch for data changes to trigger chart updates
watch(
  () => props.workerMetrics,
  () => {
    nextTick(() => {
      if (chartRef.value) {
        chartRef.value.setOption(chartOptions.value, true)
        // Re-bind click events after chart update
        chartRef.value.chart.on('click', handleChartClick)
        // Apply highlight after chart update
        applyHighlight()
      }
    })
  },
  { deep: true },
)

// Watch for selectedWorker changes to apply highlight
watch(
  () => props.selectedWorker,
  () => {
    nextTick(() => {
      applyHighlight()
    })
  },
)

// Apply highlight to selected worker
const applyHighlight = () => {
  if (chartRef.value && props.selectedWorker) {
    // First, downplay all series
    chartRef.value.dispatchAction({
      type: 'downplay',
    })

    // Then highlight the selected worker
    chartRef.value.dispatchAction({
      type: 'highlight',
      seriesName: props.selectedWorker,
    })
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)

  // Bind click events after chart is mounted
  nextTick(() => {
    if (chartRef.value) {
      chartRef.value.chart.on('click', handleChartClick)
      // Apply initial highlight
      applyHighlight()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // Remove click events
  if (chartRef.value) {
    chartRef.value.chart.off('click', handleChartClick)
  }
})
</script>

<template>
  <div
    class="worker-rps-chart"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <VChart ref="chartRef" :option="chartOptions" :autoresize="true" />
  </div>
</template>

<style lang="scss" scoped>
.worker-rps-chart {
  width: 100%;
  position: relative;
  background: #fff;
  border-radius: 8px;
}
</style>
