<template>
  <div class="v-echart-wrapper">
    <v-chart v-if="chartOpt" class="chart" :option="chartOpt" :autoresize="autoresize" />
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, ToolboxComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'VEchart',
  components: {
    VChart
  },
  props: {
    option: Object,
    autoresize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chartOpt: null
    }
  },
  watch: {
    option: {
      deep: true,
      handler(v) {
        v && this.init()
      }
    }
  },
  methods: {
    init() {
      this.chartOpt = this.option
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 100%;
}
</style>
