<template>
  <div class="filter-datetime-range flex">
    <div v-if="!!label" class="filter-datetime-range__title">{{ label }}</div>
    <Datetime
      v-bind="$attrs"
      v-model:value="start"
      :picker-options="startOptions"
      :placeholder="startPlaceholder"
      ref="startTime"
      class="none-border"
      @change="changeStart"
    ></Datetime>
    <Datetime
      v-bind="$attrs"
      v-model:value="end"
      :picker-options="endOptions"
      :placeholder="endPlaceholder"
      ref="endTime"
      :title="$t('packages_component_filter_bar_datetimerange_zhi')"
      class="none-border"
      @change="changeEnd"
    ></Datetime>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import Datetime from './Datetime'

export default {
  name: 'DatetimeRange',
  components: { Datetime },
  props: {
    value: [String, Array, Number, Object],
    label: {
      type: String,
      default: '',
    },
    startPlaceholder: {
      type: String,
      default: () => {
        return i18n.t(
          'packages_component_filter_bar_datetimerange_kaishishijian'
        )
      },
    },
    endPlaceholder: {
      type: String,
      default: () => {
        return i18n.t(
          'packages_component_filter_bar_datetimerange_jieshushijian'
        )
      },
    },
    range: {
      type: Number,
    },
  },
  data() {
    return {
      start: '',
      end: '',
      startOptions: {
        disabledDate: (time) => {
          const { end } = this
          if (this.range) {
            return (
              Math.abs(
                (end ? this.getTimestamp(end) : Date.now()) -
                  this.getTimestamp(time)
              ) > this.range
            )
          }
          if (end) {
            if (this.getTimestamp(end) === this.getDayStartTimestamp(end)) {
              return (
                this.getTimestamp(time) > this.getDayStartTimestamp(end) - 1
              )
            }
            return this.getTimestamp(time) > this.getDayStartTimestamp(end)
          }
        },
        selectableRange: null,
      },
      endOptions: {
        disabledDate: (time) => {
          const { start } = this
          if (this.range) {
            return (
              Math.abs(
                this.getTimestamp(time) -
                  (start ? this.getTimestamp(start) : Date.now())
              ) > this.range
            )
          }
          if (start) {
            if (this.getTimestamp(start) === this.getDayEndTimestamp(start)) {
              return (
                this.getTimestamp(time) < this.getDayStartTimestamp(start) + 1
              )
            }
            return this.getTimestamp(time) < this.getDayStartTimestamp(start)
          }
        },
        selectableRange: null,
      },
      startRange: '00:00:00',
      endRange: '23:59:59',
    }
  },
  watch: {
    start() {
      this.setStartValue()
      this.setStartRange()
    },
    end() {
      this.setEndValue()
      this.setEndRange()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const { value } = this
      if (value) {
        this.start = Number(value[0])
        this.end = Number(value[1])
      }
    },
    changeStart() {
      this.setEndRange()
      this.emitFnc()
    },
    changeEnd() {
      this.setStartRange()
      this.emitFnc()
    },
    emitFnc() {
      const { start, end } = this
      const arr = [start, end]
      $emit(this.$emit('update:value', arr), 'change', arr)
    },
    resetRange(type) {
      const { startRange, endRange } = this
      const all = startRange + '-' + endRange
      switch (type) {
        case 'start':
          this.startOptions.selectableRange = all
          break
        case 'end':
          this.endOptions.selectableRange = all
          break
        default:
          this.startOptions.selectableRange = all
          this.endOptions.selectableRange = all
          break
      }
    },
    setStartRange() {
      if (!this.end || !this.isSameDay()) {
        this.resetRange()
      } else {
        this.startOptions.selectableRange =
          this.startRange + '-' + this.getHMs(this.end - 1000)
      }
    },
    setEndRange() {
      if (!this.start || !this.isSameDay()) {
        this.resetRange()
      } else {
        this.endOptions.selectableRange =
          this.getHMs(this.start + 1000) + '-' + this.endRange
      }
    },
    setStartValue() {
      const { start, end } = this
      if (start && end && start >= end) {
        this.start = end - 1000
      }
    },
    setEndValue() {
      const { start, end } = this
      if (start && end && start >= end) {
        this.end = start + 1000
      }
    },
    isSameDay() {
      const { start, end } = this
      return this.getDayStartTimestamp(start) === this.getDayStartTimestamp(end)
    },
    // 获取时分秒，自动补零
    getHMs(timestamp) {
      if (!timestamp) {
        return
      }
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return hours + ':' + minutes + ':' + seconds
    },
    getTimestamp(timestamp) {
      return new Date(timestamp).getTime()
    },
    // 获取当天00:00:00时间戳
    getDayStartTimestamp(timestamp) {
      return new Date(new Date(timestamp).setHours(0, 0, 0, 0)).getTime()
    },
    // 获取当天23:59:59时间戳，精确到s
    getDayEndTimestamp(timestamp) {
      return new Date(
        new Date(timestamp).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1000
      ).getTime()
    },
  },
  emits: ['change', 'update:value'],
}
</script>

<style lang="scss" scoped>
.filter-datetime-range {
  padding: 0 8px;
  cursor: pointer;
  font-size: $fontBaseTitle;
  &:hover {
    background-color: #eff1f4;
    border-radius: 2px;
    ::v-deep {
      input {
        background-color: #eff1f4;
        cursor: pointer;
      }
    }
  }
  .filter-datetime-range__title {
    color: map-get($fontColor, slight);
  }
}
</style>
