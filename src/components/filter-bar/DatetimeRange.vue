<template>
  <div class="filter-datetime-range flex">
    <div v-if="!!label" class="filter-datetime-range__title">{{ label }}</div>
    <Datetime
      v-model="start"
      v-bind="$attrs"
      :picker-options="startOptions"
      :placeholder="startPlaceholder"
      ref="startTime"
      class="none-border"
      @change="changeStart"
    ></Datetime>
    <Datetime
      v-model="end"
      v-bind="$attrs"
      :picker-options="endOptions"
      :placeholder="endPlaceholder"
      ref="endTime"
      title="至"
      class="none-border"
      @change="changeEnd"
    ></Datetime>
  </div>
</template>

<script>
import Datetime from './Datetime'

export default {
  name: 'DatetimeRange',
  components: { Datetime },
  props: {
    value: [String, Array, Number, Object],
    label: {
      type: String,
      default: ''
    },
    startPlaceholder: {
      type: String,
      default: '开始时间'
    },
    endPlaceholder: {
      type: String,
      default: '结束时间'
    },
    timeDiff: {
      type: Number,
      default: 1000 // ms
    }
  },
  data() {
    return {
      start: '',
      end: '',
      startOptions: {
        disabledDate: time => {
          const { end, timeDiff } = this
          if (end) {
            if (this.getTimestamp(end) === this.getDayStartTimestamp(end)) {
              return this.getTimestamp(time) > this.getDayStartTimestamp(end) - timeDiff
            }
            return this.getTimestamp(time) > this.getDayStartTimestamp(end)
          }
        },
        selectableRange: null
      },
      endOptions: {
        disabledDate: time => {
          const { start, timeDiff } = this
          if (start) {
            if (this.getTimestamp(start) === this.getDayEndTimestamp(start)) {
              return this.getTimestamp(time) < this.getDayStartTimestamp(start) + timeDiff
            }
            return this.getTimestamp(time) < this.getDayStartTimestamp(start)
          }
        },
        selectableRange: null
      },
      startRange: '00:00:00',
      endRange: '23:59:59'
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
    }
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
      this.$emit('input', arr).$emit('change', arr)
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
      const { end, timeDiff } = this
      if (!end || !this.isSameDay()) {
        this.resetRange()
      } else {
        this.startOptions.selectableRange = this.startRange + '-' + this.getHMs(this.end, -timeDiff)
      }
    },
    setEndRange() {
      const { start, timeDiff } = this
      if (!start || !this.isSameDay()) {
        this.resetRange()
      } else {
        this.endOptions.selectableRange = this.getHMs(this.start, timeDiff) + '-' + this.endRange
      }
    },
    setStartValue() {
      const { start, end, timeDiff } = this
      if (start && end && start >= end - timeDiff) {
        this.start = end - timeDiff
      }
    },
    setEndValue() {
      console.log('123')
      const { start, end, timeDiff } = this
      if (start && end && start + timeDiff >= end) {
        this.end = start + timeDiff
      }
    },
    isSameDay() {
      const { start, end } = this
      return this.getDayStartTimestamp(start) === this.getDayStartTimestamp(end)
    },
    // 获取时分秒，自动补零
    getHMs(timestamp, diff) {
      if (!timestamp) {
        return
      }
      let date = new Date(timestamp)
      if (diff) {
        date = new Date(date.getTime() + diff)
      }
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
      return new Date(new Date(timestamp).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1000).getTime()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-datetime-range {
  padding: 0 8px;
  cursor: pointer;
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
    color: map-get($fontColor, sub);
  }
}
</style>
