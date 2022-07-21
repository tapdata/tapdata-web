<template>
  <section
    v-show="isShow"
    class="verify-panel border-start flex-column"
    :class="{ flex: isShow, 'show-verify': isShow }"
  >
    <div class="flex justify-content-between align-items-center p-4">
      <span class="font-color-normal fw-bold fs-7">数据校验</span>
      <VIcon size="16" @click="$emit('showBottomPanel')">close</VIcon>
    </div>
    <div class="px-4 pb-4 border-bottom">
      <Chart ref="chart" :extend="pieOptions" style="width: 240px; height: 90px"></Chart>
    </div>
  </section>
</template>

<script>
import { Chart } from '@tap/component'
import Locale from '../../mixins/locale'
import { mapGetters } from 'vuex'

export default {
  name: 'VerifyPanel',
  components: { Chart },
  mixins: [Locale],
  props: {
    settings: Object,
    samples: {
      type: Object,
      default: () => {
        return {
          passed: 12,
          diff: 456,
          notSupport: 234
        }
      }
    }
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters('dataflow', ['activeType']),

    isShow() {
      return this.activeType === 'verify'
    },

    pieOptions() {
      let arr = [
        {
          name: '校验一致',
          key: 'passed',
          value: 0,
          color: '#82C647'
        },
        {
          name: '校验不一致',
          key: 'diff',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '不支持校验',
          key: 'notSupport',
          value: 0,
          color: '#88DBDA'
        }
      ]
      return this.getPieOptions(arr, this.samples)
    }
  },

  methods: {
    getPieOptions(items = [], data) {
      let options = {
        tooltip: {
          trigger: 'item'
        },
        textStyle: {
          rich: {
            orgname: {
              width: 80,
              color: '#535F72'
            },
            count: {
              padding: [0, 0, 0, 15],
              color: '#333C4A'
            }
          }
        },
        legend: {
          top: 'center',
          right: 0,
          icon: 'circle',
          orient: 'vertical',
          itemWidth: 6,
          itemHeight: 6,
          formatter: name => {
            const count = 0
            const arr = [`{orgname|${name}}`, `{count|${count}}`]
            return arr.join('')
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '90%'],
            center: ['20%', '50%'],
            label: { show: false },
            labelLine: { show: false },
            data: [],
            top: 'top'
          }
        ]
      }
      if (items.length && data) {
        options.series[0].data = items.map(t => {
          return {
            name: t.name,
            value: data[t.key],
            itemStyle: {
              color: t.color
            }
          }
        })
        options.legend.formatter = name => {
          const count = options.series[0].data?.find(t => t.name === name)?.value || 0
          const arr = [`{orgname|${name}}`, `{count|${count}}`]
          return arr.join('')
        }
      }
      return options
    }
  }
}
</script>
<style lang="scss" scoped>
.verify-panel {
  width: 306px;
}
</style>
