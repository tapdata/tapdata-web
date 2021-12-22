<template>
  <div :class="['etl-status-item', { 'inline-layout': inline }]">
    <div v-for="(item, index) in result" :key="index" class="etl-status-item__box">
      <span
        :class="['circle-icon', 'mr-2', !!item.type && `bg-color-${item.type}`]"
        :style="{ 'background-color': item.color }"
      ></span>
      <span class="etl-status-item__text font-color-sub">{{ item.text }}</span>
      <span v-if="showCount" class="etl-status-item__count font-color-sub">{{ ': ' + (item.count || 0) }}</span>
    </div>
  </div>
</template>

<script>
import { ETL_STATUS_MAP, ETL_SUB_STATUS_MAP } from '@/const'
import { deepCopy } from '@/utils/util'
export default {
  name: 'StatusItem',
  props: {
    rows: {
      type: Array,
      default: () => []
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      result: [],
      statusMap: {
        running: ['scheduling', 'running', 'pausing', 'stopping', 'scheduling'],
        not_running: ['wait_run', 'pause', 'stop', 'complete', 'schedule_failed'],
        error: ['error']
      }
    }
  },
  computed: {
    showCount() {
      return this.result.length > 1
    }
  },
  watch: {
    rows: {
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
      this.result = this.getData(this.rows)
      this.$emit('input', this.result)
    },
    getData(rows = []) {
      const len = rows.length
      let result
      switch (len) {
        case 0:
          result = [Object.assign({ count: 1 }, ETL_STATUS_MAP['not_running'])]
          break
        case 1:
          result = [Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP[rows[0]?.status])]
          break
        default:
          result = this.formatResult()
          break
      }
      return result
    },
    formatResult() {
      const { rows, statusMap } = this
      let result = []
      let obj = deepCopy(ETL_STATUS_MAP)
      for (let key in obj) {
        obj[key].count = 0
        rows.forEach(el => {
          if (statusMap[key].includes(el.status)) {
            obj[key].count++
          }
        })
        result.push(obj[key])
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.etl-status-item {
  font-size: 12px;
  line-height: 16px;
  &.inline-layout {
    display: flex;
    .etl-status-item__box {
      &:not(:first-child) {
        margin-left: 12px;
      }
    }
  }
}
.circle-icon {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
