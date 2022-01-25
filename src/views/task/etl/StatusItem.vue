<template>
  <div :class="['etl-status-item', { 'inline-layout': inline }]">
    <div v-for="(item, index) in comList" :key="index" class="etl-status-item__box">
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
import { getSubTaskStatus } from './util'
export default {
  name: 'StatusItem',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Array,
      default: () => []
    },
    inline: {
      type: Boolean,
      default: false
    },
    showAll: {
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
    },
    comList() {
      if (!this.showAll) {
        return this.result.filter(t => t.count > 0)
      }
      return this.result
    }
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.init()
      }
    },
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
      const { value, rows } = this
      console.log('init', value)
      if (value.length) {
        this.result = value
      } else if (rows.length) {
        this.result = getSubTaskStatus(rows)
        this.$emit('input', this.result)
      }
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
