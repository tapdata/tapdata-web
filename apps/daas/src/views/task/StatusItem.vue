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
export default {
  name: 'StatusItem',
  props: {
    value: {
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
      statusMap: {
        running: ['preparing', 'scheduling', 'running', 'stopping', 'wait_run'],
        not_running: ['edit', 'stop', 'complete'],
        error: ['error', 'schedule_failed']
      }
    }
  },
  computed: {
    showCount() {
      return this.value.length > 1
    },
    comList() {
      if (!this.showAll) {
        return this.value.filter(t => t.count > 0)
      }
      return this.value
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
