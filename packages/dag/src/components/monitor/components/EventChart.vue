<template>
  <div class="event-chart">
    <ElRadioGroup
      v-if="showAll"
      v-model:value="dataType"
      size="mini"
      class="event-chart__radio"
      @change="loadBarData"
    >
      <ElRadioButton :label="0">{{
        $t('packages_dag_components_eventchart_renwuyunxinglei')
      }}</ElRadioButton>
      <ElRadioButton :label="1">{{
        $t('packages_dag_components_eventchart_suoxuanzhouqilei')
      }}</ElRadioButton>
    </ElRadioGroup>
    <div v-if="total" class="total-line flex align-items-center">
      <ElTooltip
        transition="tooltip-fade-in"
        :content="total.input.toLocaleString()"
      >
        <span class="font-color-normal fw-bold fs-3 din-font">{{
          calcUnit(total.input)
        }}</span>
      </ElTooltip>
      <span class="ml-2">{{
        $t('packages_dag_components_eventchart_zongshuru')
      }}</span>
      <ElDivider direction="vertical" class="divider mx-4"></ElDivider>
      <ElTooltip
        transition="tooltip-fade-in"
        :content="total.output.toLocaleString()"
      >
        <span class="font-color-normal fw-bold fs-3 din-font">{{
          calcUnit(total.output)
        }}</span>
      </ElTooltip>
      <span class="ml-2">{{
        $t('packages_dag_components_eventchart_zongshuchu')
      }}</span>
    </div>
    <Chart :extend="options" :style="{ height }"></Chart>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { Chart } from '@tap/component'
import { calcUnit } from '@tap/shared'

export default {
  name: 'EventChart',
  components: { Chart },
  props: {
    samples: {
      type: Array,
      required: true,
    },
    yData: {
      type: Array,
      default: () => [
        i18n.t('packages_dag_components_eventchart_zongshuru'),
        i18n.t('packages_dag_components_eventchart_zongshuchu'),
      ],
    },
    height: {
      type: String,
      default: '140px',
    },
    showAll: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      dataType: 0,
      total: {
        input: 0,
        output: 0,
      },
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
          },
        },
        legend: {
          right: 0,
          bottom: 0,
          itemWidth: 12,
          itemHeight: 6,
          itemGap: 16,
          textStyle: {
            color: '#535F72',
          },
        },
        grid: {
          top: 0,
          left: 0,
          right: 0,
          bottom: '24px',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#535F72',
            showMaxLabel: false,
            showMinLabel: false,
            formatter: (val) => {
              return calcUnit(val)
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E9E9E9',
            },
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        yAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#E9E9E9',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#535F72',
          },
          data: this.yData,
        },
        series: [],
      },
    }
  },
  watch: {
    samples: {
      deep: true,
      handler() {
        this.init()
      },
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loadBarData()
    },

    loadBarData() {
      const { input, output } = this.samples?.[this.dataType] || {}
      if (!(input && output)) {
        return
      }
      let inData = {}
      let outData = {}
      for (let key in input) {
        inData[key.toLowerCase()] = input[key]
        outData[key.toLowerCase()] = output[key]
      }
      this.total.input = eval(Object.values(inData).join('+'))
      this.total.output = eval(Object.values(outData).join('+'))
      let arr = [
        {
          label: i18n.t('packages_dag_components_eventchart_charu'),
          key: 'InsertTotal',
          color: '#88DBDA',
        },
        {
          label: i18n.t('packages_dag_components_eventchart_gengxin'),
          key: 'UpdateTotal',
          color: '#6ACA26',
        },
        {
          label: i18n.t('packages_dag_button_delete'),
          key: 'DeleteTotal',
          color: '#FDD746',
        },
        {
          label: 'DDL',
          key: 'DdlTotal',
          color: '#B682CE',
        },
        {
          label: i18n.t('packages_dag_components_eventchart_qita'),
          key: 'OthersTotal',
          color: '#00A1F1',
        },
      ]
      let series = arr.map((t) => {
        const k = t.key.toLowerCase()
        return {
          type: 'bar',
          stack: 'total',
          barWidth: 12,
          name: t.label,
          color: t.color,
          data: [inData[k], outData[k]],
        }
      })
      this.options.series = series
    },

    calcUnit() {
      return calcUnit(...arguments)
    },
  },
}
</script>

<style lang="scss" scoped>
.total-line {
  margin-bottom: 8px;
}
.event-chart__radio {
  margin: 8px 0;
}
</style>
