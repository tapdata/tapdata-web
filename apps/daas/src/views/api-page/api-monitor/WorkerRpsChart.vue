<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
// import type { WorkerCallData } from '@tap/api'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

// Chart data interface
interface ChartData {
  x: string[]
  series: {
    name: string
    data: (number | null)[]
    color?: string
  }[]
}

// Props interface
interface Props {
  chartData?: ChartData
  selectedWorker?: string
  height?: string | number
  colors?: string[]
  legend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  chartData: undefined,
  selectedWorker: '',
  height: '300px',
  colors: undefined,
  legend: false,
})

const chartRef = ref()

// Emits
const emit = defineEmits<{
  workerSelect: [workerName: string]
}>()

// Use the chart data directly from props
const chartData = computed(() => {
  return props.chartData || { x: [], series: [] }
})

// Chart options
const chartOptions = computed(() => {
  const baseOptions = {
    legend: {
      show: props.legend,
      top: 0,
      left: 0,
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

    grid: [
      {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        outerBounds: {
          left: 0,
          top: props.legend ? 28 : 0,
          right: 0,
          bottom: 0,
        },
        outerBoundsMode: 'auto',
      },
    ],
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
        color: worker.color,
        connectNulls: true,
        // smooth: true,
        // symbolSize: 2,
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
  () => props.chartData,
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
