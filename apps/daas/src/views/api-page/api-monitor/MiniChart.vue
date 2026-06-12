<script setup lang="ts">
import { dayjs } from '@tap/business/src/shared/dayjs'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { isNumber } from 'lodash-es'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

// Register ECharts components
use([CanvasRenderer, LineChart, TooltipComponent, GridComponent])

interface MiniChartProps {
  data: number[]
  time: number[]
  color?: string
  height?: number
  label?: string
  unit?: string
}

const props = withDefaults(defineProps<MiniChartProps>(), {
  color: '#409EFF',
  height: 60,
  unit: '%',
})

const chartOption = computed<EChartsOption>(() => ({
  grid: {
    left: 0,
    right: 0,
    top: 8,
    bottom: 8,
  },
  xAxis: {
    type: 'category',
    show: false,
    boundaryGap: false,
    data: props.time,
  },
  yAxis: {
    type: 'value',
    show: false,
    min: 0,
    max: 100,
  },
  tooltip: {
    trigger: 'axis',
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
    // borderColor: 'transparent',
    // textStyle: {
    //   color: '#fff',
    //   fontSize: 12,
    // },
    borderRadius: 12,
    borderColor: '#dee0e3',
    extraCssText:
      'box-shadow: 0px 4px 16px 4px rgba(31,35,41,0.03),0px 4px 8px 0px rgba(31,35,41,0.02),0px 2px 4px -4px rgba(31,35,41,0.02);',
    padding: [8, 12],
    formatter: (params: any) => {
      const dataIndex = params[0]?.dataIndex ?? 0
      const value = isNumber(params[0]?.value)
        ? params[0].value + props.unit
        : '--'
      const timestamp = props.time[dataIndex]
      if (!timestamp) return `${props.label || 'Value'}: ${value}`
      const timeStr = dayjs.unix(timestamp).format('MM-DD HH:mm:ss')
      return `${timeStr}<br/>${props.label || 'Value'}: ${value}`
    },
  },
  series: [
    {
      type: 'line',
      data: props.data,
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: props.color,
        width: 1,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: `${props.color}40`, // 25% opacity
            },
            {
              offset: 1,
              color: `${props.color}05`, // 2% opacity
            },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <div :style="{ height: `${height}px`, width: '100%' }">
    <VChart :option="chartOption" :autoresize="true" />
  </div>
</template>

<style lang="scss" scoped>
div {
  width: 100%;
}
</style>
