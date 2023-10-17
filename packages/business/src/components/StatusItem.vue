<template>
  <div :class="['etl-status-item', { 'inline-layout': inline }]">
    <div
      v-for="(item, index) in comList"
      :key="index"
      class="etl-status-item__box"
    >
      <span
        :class="['circle-icon', 'mr-2', !!item.type && `bg-color-${item.type}`]"
        :style="{ 'background-color': colorMap[item.type] }"
      ></span>
      <span class="etl-status-item__text font-color-light">{{
        item.text
      }}</span>
      <span v-if="showCount" class="etl-status-item__count font-color-slight">{{
        ': ' + (item.count || 0)
      }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusItem',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    inline: {
      type: Boolean,
      default: false,
    },
    showAll: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showCount() {
      return this.value.length > 1
    },
    comList() {
      if (!this.showAll) {
        return this.value.filter((t) => t.count > 0)
      }
      return this.value
    },
  },
  data() {
    return {
      colorMap: {
        ready: '#C39700',
        edit: '#0083C7',
        scheduling: '#2C65FF',
        schedule_failed: '#D44D4D',
        wait_run: '#2C65FF',
        running: '#178061',
        stopping: '#C39700',
        stop: '#C88500',
        complete: '#008B58',
        error: '#D44D4D',
      },
    }
  },
  emits: ['update:value'],
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
  margin-top: -3px;
  width: 6px;
  height: 6px;
  vertical-align: middle;
  border-radius: 50%;
}
</style>
