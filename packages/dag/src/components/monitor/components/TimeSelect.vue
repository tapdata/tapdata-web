<template>
  <div class="time-select__picker">
    <div class="picker__item inline-flex align-items-center cursor-pointer" @click="openSelect">
      <div class="time-select__title">{{ title }}</div>
      <ElSelect
        v-model="period"
        :class="{ 'is-time': isTime }"
        :popper-append-to-body="false"
        popper-class="time-select__popper"
        class="ml-2 dark"
        size="mini"
        ref="select"
        @change="changeFnc"
      >
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
      class="el-date-picker position-absolute overflow-hidden p-0 m-0"
      @change="changeTime"
      @blur="blur"
    ></ElDatePicker>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'TimeSelect',

  props: {
    value: String,
    title: {
      type: String,
      default: '周期'
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '最近5分钟',
          value: '5m'
        },
        {
          label: '最新1小时',
          value: '1h'
        },
        {
          label: '最近1天',
          value: '1d'
        },
        {
          label: '任务全周期',
          value: 'full'
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
      default: 60 * 1000
    },
    range: {
      type: Array,
      default: () => [Date.now() - this.interval, Date.now()]
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
          const [start, end] = this.getRangeTime()
          const d = new Date(time).getTime()
          const pickDate = dayjs(time).format(this.timeFormat.date)
          const startDate = dayjs(start).format(this.timeFormat.date)
          const startTime = dayjs(start).format(this.timeFormat.time)
          const startStamp = new Date(start).getTime()
          const endStamp = new Date(end).getTime()
          if (pickDate === startDate && startTime !== this.timeFormat.endTime) {
            return false
          }
          return d < startStamp || d >= endStamp
        },
        onPick: this.handleTimeRangeDisabled
      },
      timeFormat: {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        startTime: '00:00:00',
        endTime: '23:59:59'
      }
    }
  },

  watch: {
    value(v) {
      this.setPeriod(v)
    }
  },

  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.setPeriod(this.value || this.items[0]?.value)
    // this.changeFnc(this.period)
    this.$once('setMinAndMaxTime', () => {
      const picker = this.$refs.datetime?.picker
      const [startTime, endTime] = this.getRangeTime()
      picker.minDate = new Date(startTime)
      picker.maxDate = new Date(endTime)
      const minDate = this.formatTime(startTime, this.timeFormat.date)
      const maxDate = this.formatTime(endTime, this.timeFormat.date)
      this.handleTimeRangeDisabled({
        minDate,
        maxDate
      })
    })
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
      this.$nextTick(() => {
        this.$emit('setMinAndMaxTime')
      })
    },

    changeTime(val) {
      const { rangeSeparator, formatToString } = this.$refs.datetime
      const label = formatToString(val)?.join(rangeSeparator)
      const valJoin = val?.map(t => new Date(t).getTime()).join()
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
      this.$emit(
        'change',
        valJoin,
        true,
        Object.assign(
          {},
          this.items.find(t => t.type === 'custom'),
          {
            value: val
          }
        )
      )
    },

    blur() {
      if (!this.time?.length) {
        this.changeTime(this.range)
      }
      this.time = []
    },

    openSelect() {
      if (this.isTime) {
        this.$refs.datetime.focus()
      } else {
        this.$refs.select?.$el?.click()
      }
    },

    handleTimeRangeDisabled({ minDate, maxDate }) {
      if (!(minDate && maxDate)) {
        return
      }
      const picker = this.$refs.datetime?.picker
      const { minTimePicker, maxTimePicker } = picker.$refs
      const [start, end] = this.getRangeTime()
      const pickStartDate = dayjs(minDate).format(this.timeFormat.date)
      const pickEndDate = dayjs(maxDate).format(this.timeFormat.date)
      const startDate = dayjs(start).format(this.timeFormat.date)
      const startTime = dayjs(start).format(this.timeFormat.time)
      const endDate = dayjs(end).format(this.timeFormat.date)
      const endTime = dayjs(end).format(this.timeFormat.time)
      // 控件日期、开始日期、结束日期，都是同一天
      if (pickStartDate === startDate && startDate === endDate) {
        minTimePicker.selectableRange = [[new Date(`${startDate} ${startTime}`), new Date(`${endDate} ${endTime}`)]]
        maxTimePicker.selectableRange = [[new Date(`${startDate} ${startTime}`), new Date(`${endDate} ${endTime}`)]]
      } else {
        // 控件日期 等于 开始日期
        if (pickStartDate === startDate) {
          minTimePicker.selectableRange = [
            [new Date(`${startDate} ${startTime}`), new Date(`${startDate} ${this.timeFormat.endTime}`)]
          ]
        } else {
          minTimePicker.selectableRange = []
        }
        // 控件日期 等于 结束日期
        if (pickEndDate === endDate) {
          maxTimePicker.selectableRange = [
            [new Date(`${endDate} ${this.timeFormat.startTime}`), new Date(`${endDate} ${endTime}`)]
          ]
        } else {
          maxTimePicker.selectableRange = []
        }
      }
    },

    formatTime(date, format) {
      return dayjs(date).format(format)
    },

    getRangeTime() {
      return this.range.map(t => t || Date.now())
    },

    setPeriod(value) {
      let findOne = this.items.find(t => t.value === value)
      if (!findOne) {
        this.changeTime(value.split(',').map(t => Number(t)))
        return
      }
      this.period = value
    },

    getPeriod(value) {
      return this.items.find(t => t.value === (value || this.period))
    }
  }
}
</script>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;
  ::v-deep {
    .time-select__popper {
      width: 270px;
      transform: translateX(-40px);
    }
    // 灰色风格下拉框
    .el-select {
      &.dark {
        .el-input__inner {
          border: none;
          background-color: inherit;
        }
        .el-icon-arrow-up:before {
          content: '\e78f';
        }
      }
    }
    .el-date-picker {
      height: 0;
      border: 0;
      bottom: 0;
      left: 0;
    }
  }
}
.time-select__title {
  white-space: nowrap;
}
.datetime {
  position: absolute;
}
.is-time {
  //flex: 1;
  width: 260px;
}
.picker__item {
  padding: 0 4px;
  &:hover {
    background: #eef3ff;
  }
}
</style>
