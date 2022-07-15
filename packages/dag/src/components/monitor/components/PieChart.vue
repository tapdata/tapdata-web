<template>
  <div class="pie-chart">
    <Chart ref="chart" :extend="extend"></Chart>
  </div>
</template>

<script>
import { Chart } from '@tap/component'

export default {
  name: 'PieChart',

  components: { Chart },

  props: {
    title: {
      type: String,
      default: '标题'
    },
    data: {
      type: Array,
      default: () => {
        return [
          { value: 1048, name: 'Search Engine111', color: 'red' },
          { value: 735, name: 'Direct', color: 'red' },
          { value: 580, name: 'Email', color: 'red' },
          { value: 484, name: 'Union Ads', color: 'red' },
          { value: 300, name: 'Video Ads', color: 'red' }
        ]
      }
    },
    center: {
      type: Array,
      default: () => ['50%', '30%']
    }
  },

  data() {
    return {
      extend: null
    }
  },

  watch: {
    data: {
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
      let options = this.getOptions()
      options.series[0].data = this.data.map(t => {
        return {
          name: t.name,
          value: t.value,
          itemStyle: {
            color: t.color
          }
        }
      })
      this.extend = options
    },
    getOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        textStyle: {
          rich: {
            orgname: {
              width: 80
            },
            count: {
              padding: [0, 0, 0, 15]
            }
          }
        },
        legend: {
          bottom: 0,
          icon: 'circle',
          orient: 'vertical',
          itemWidth: 6,
          itemHeight: 6,
          formatter: (name, val) => {
            const count = 12345
            const arr = [`{orgname|${name}}`, `{count|${count}}`]
            return arr.join('')
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: this.center,
            label: { show: false },
            labelLine: { show: false },
            data: [],
            top: 'top'
          }
        ]
      }
    }
  }
}
</script>
