<template>
  <div class="time-select__picker">
    <div class="flex align-items-center">
      <div class="time-select__title">{{ title }}</div>
      <ElSelect v-model="period" :class="{ 'is-time': isTime }" size="mini" class="ml-2" @change="changeFnc">
        <ElOption v-for="(item, index) in items" :key="index" :label="item.label" :value="item.value"></ElOption>
      </ElSelect>
      <VIcon class="color-primary ml-1" @click="openPicker">timer</VIcon>
    </div>
    <ElDatePicker
      v-model="time"
      :picker-options="pickerOptions"
      ref="datetime"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      format="yyyy-MM-dd HH:mm"
      value-format="timestamp"
      style="height: 0; border: 0"
      class="position-absolute overflow-hidden p-0 m-0"
      @change="changeTime"
      @blur="blur"
    ></ElDatePicker>
  </div>
</template>

<script>
import dayjs from 'dayjs'
const DateFormat = 'YYYY-MM-DD'
const TimeFormat = 'HH:mm:ss'
const StartTimeFormat = '00:00:00'
const ENDTimeFormat = '23:59:59'

export default {
  name: 'TimeSelect',

  props: {
    title: {
      type: String,
      default: '周期'
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '任务全周期',
          value: 'all'
        },
        {
          label: '最近5分钟',
          value: 5 * 60 * 1000
        },
        {
          label: '最新1小时',
          value: 60 * 60 * 1000
        },
        {
          label: '最近1天',
          value: 24 * 60 * 60 * 1000
        },
        {
          label: '自定义时间',
          type: 'custom',
          value: 'custom'
        }
      ]
    },
    rangeSeparator: String,
    interval: {
      type: Number,
      default: 1000
    },
    range: {
      type: Array,
      default: () => ['2022-07-18 23:59:50', '2022-07-21 01:00:00']
    }
  },

  data() {
    return {
      period: '',
      time: [],
      items: [],
      isTime: false,
      pickerOptions: {
        disabledDate: time => {
          const [start, end] = this.range
          const d = new Date(time).getTime()
          const pickDate = dayjs(time).format(DateFormat)
          const startDate = dayjs(start).format(DateFormat)
          const startTime = dayjs(start).format(TimeFormat)
          const startStamp = new Date(start).getTime()
          const endStamp = new Date(end).getTime()
          if (pickDate === startDate && startTime !== ENDTimeFormat) {
            return false
          }
          return d < startStamp || d >= endStamp
        },
        onPick: ({ minDate, maxDate }) => {
          if (!(minDate && maxDate)) {
            return
          }
          const picker = this.$refs.datetime?.picker
          const { minTimePicker, maxTimePicker } = picker.$refs
          const [start, end] = this.range
          const pickStartDate = dayjs(minDate).format(DateFormat)
          const pickEndDate = dayjs(maxDate).format(DateFormat)
          const startDate = dayjs(start).format(DateFormat)
          const startTime = dayjs(start).format(TimeFormat)
          const endDate = dayjs(end).format(DateFormat)
          const endTime = dayjs(end).format(TimeFormat)
          // 开始日期
          if (pickStartDate === startDate) {
            minTimePicker.selectableRange = [
              [new Date(`${startDate} ${startTime}`), new Date(`${startDate} ${ENDTimeFormat}`)]
            ]
          } else {
            minTimePicker.selectableRange = []
          }
          // 结束日期
          if (pickEndDate === endDate) {
            maxTimePicker.selectableRange = [
              [new Date(`${endDate} ${StartTimeFormat}`), new Date(`${endDate} ${endTime}`)]
            ]
          } else {
            maxTimePicker.selectableRange = []
          }
        }
      }
    }
  },

  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.period = this.items[0]?.value
    this.changeFnc(this.period)
  },

  methods: {
    changeFnc(value) {
      let findOne = this.items.find(t => t.value === value)
      if (findOne?.type === 'custom') {
        this.openPicker()
        return
      }
      this.isTime = !!findOne?.isTime
      this.$emit('change', findOne.value, this.isTime, findOne)
    },

    openPicker() {
      if (this.isTime && this.period && this.period !== 'custom') {
        this.time = this.period.split(',')
      }
      this.$refs.datetime.focus()
    },

    changeTime(val) {
      const { rangeSeparator, formatToString } = this.$refs.datetime
      const label = formatToString(val)?.join(rangeSeparator)
      const valJoin = val?.join()
      if (!valJoin) {
        return
      }
      const findOne = this.items.find(t => t.value === valJoin)
      if (!findOne) {
        this.items = this.items.filter(t => !t.isTime)
        this.items.push({
          label: label,
          value: valJoin,
          isTime: true
        })
        this.isTime = true
      }
      this.period = valJoin
      this.$emit('change', valJoin, true, val)
    },

    blur() {
      if (!this.time?.length) {
        let t = Date.now()
        this.changeTime([t - this.interval, t])
      }
      this.time = []
    }
  }
}
</script>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;
}
.time-select__title {
  white-space: nowrap;
}
.datetime {
  position: absolute;
}
.is-time {
  flex: 1;
}
</style>
