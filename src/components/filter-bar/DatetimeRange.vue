<template>
  <div class="filter-datetime-range flex">
    <div class="filter-datetime-range__title">{{ title }}</div>
    <Datetime
      v-model="start"
      v-bind="$attrs"
      :picker-options="startOptions"
      :placeholder="startPlaceholder"
      type="datetime"
      ref="startTime"
      class="none-boder"
      @change="changeStart"
    ></Datetime>
    <Datetime
      v-model="end"
      v-bind="$attrs"
      :picker-options="endOptions"
      :placeholder="endPlaceholder"
      type="datetime"
      ref="endTime"
      title="至"
      class="none-boder"
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
    title: {
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
    }
  },
  data() {
    return {
      start: '',
      end: '',
      startOptions: {
        disabledDate: time => {
          const { end } = this
          if (end) {
            return time.getTime() > new Date(end).getTime()
          }
        }
      },
      endOptions: {
        disabledDate: time => {
          const { start } = this
          if (start) {
            return time.getTime() < new Date(start).getTime() - 1
          }
        }
      }
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
      this.emitFnc()
    },
    changeEnd() {
      this.emitFnc()
    },
    emitFnc() {
      const { start, end } = this
      const arr = [start, end]
      this.$emit('input', arr).$emit('change', arr)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-datetime-range {
  //padding-left: 8px;
  cursor: pointer;
  &:hover {
    background-color: #fafafa;
    ::v-deep {
      input {
        background-color: #fafafa;
        cursor: pointer;
      }
    }
  }
  .filter-datetime-range__title {
    font-size: 14px;
    color: map-get($fontColor, sub);
  }
}
</style>
