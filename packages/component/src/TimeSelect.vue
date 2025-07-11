<script>
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'

import dayjs from 'dayjs'
import { $emit, $off, $on, $once } from '../utils/gogocodeTransfer'
import { IconButton } from './icon-button'

export default {
  name: 'TimeSelect',
  components: { IconButton },
  props: {
    value: String,
    title: {
      type: String,
      default: () => {
        return i18n.t('public_time_period')
      },
    },
    options: {
      type: Array,
      default: () => [
        {
          label: i18n.t('packages_dag_components_timeselect_zuijinfenzhong'),
          value: '5m',
        },
        {
          label: i18n.t('packages_dag_components_timeselect_zuixinxiaoshi'),
          value: '1h',
        },
        {
          label: i18n.t('public_time_last_day'),
          value: '1d',
        },
        {
          label: i18n.t('packages_dag_components_timeselect_renwuzuijinyi'),
          value: 'lastStart',
        },
        {
          label: i18n.t('packages_dag_components_timeselect_renwuquanzhouqi'),
          value: 'full',
        },
        {
          label: i18n.t('public_time_custom_time'),
          type: 'custom',
          value: 'custom',
        },
      ],
    },
    rangeSeparator: String,
    interval: {
      type: Number,
      default: 60 * 1000,
    },
    range: {
      type: Array,
      default: () => [Time.now() - 5 * 60 * 1000, Time.now()],
    },
  },
  emits: ['change', 'setMinAndMaxTime', 'update:value', , , 'update:value'],
  data() {
    return {
      period: '',
      time: [],
      items: [],
      isTime: false,
      pickerOptions: {
        disabledDate: (time) => {
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
        onPick: this.handleTimeRangeDisabled,
      },
      timeFormat: {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        startTime: '00:00:00',
        endTime: '23:59:59',
      },
    }
  },
  computed: {
    optionsAndValue() {
      const { value, options } = this
      return { value, options }
    },
  },
  watch: {
    optionsAndValue: {
      deep: true,
      handler() {
        this.items = JSON.parse(JSON.stringify(this.options))
        if (this.value) {
          this.setPeriod(this.value)
        }
      },
    },
  },
  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.setPeriod(this.value || this.items[0]?.value)
    $once(this, 'setMinAndMaxTime', () => {
      const picker = this.$refs.datetime?.picker
      const [startTime, endTime] = this.getRangeTime()
      picker.minDate = new Date(startTime)
      picker.maxDate = new Date(endTime)
      const minDate = this.formatTime(startTime, this.timeFormat.date)
      const maxDate = this.formatTime(endTime, this.timeFormat.date)
      this.handleTimeRangeDisabled({
        minDate,
        maxDate,
      })
    })
  },
  methods: {
    changeFnc(value) {
      const findOne = this.items.find((t) => t.value === value)
      if (findOne?.type === 'custom') {
        this.openPicker()
        return
      }
      this.isTime = !!findOne?.isTime
      $emit(this, 'change', findOne.value, this.isTime, findOne)
    },

    openPicker() {
      if (this.isTime && this.period && this.period !== 'custom') {
        this.time = this.period.split(',')
      }
      this.$refs.datetime.focus()
      this.$nextTick(() => {
        $emit(this, 'setMinAndMaxTime')
      })
    },

    changeTime(result) {
      // 不能超出时间范围
      const [start, end] = this.getRangeTime()
      const val = result || []
      if (val[0] < start) {
        val[0] = start
      }
      if (val[1] > end) {
        val[1] = end
      }

      const { rangeSeparator, formatToString } = this.$refs.datetime

      const label = formatToString(val)?.join?.(` ${rangeSeparator} `) || ''
      const valJoin = val?.map((t) => new Date(t).getTime()).join()
      if (!valJoin) {
        return
      }
      const findOne = this.items.find((t) => t.value === valJoin)
      if (!findOne) {
        this.items = this.items.filter((t) => !t.isTime)
        this.items.push({
          label,
          value: valJoin,
          isTime: true,
        })
        this.isTime = true
      }
      this.period = valJoin
      $emit(
        this,
        'change',
        valJoin,
        true,
        Object.assign(
          {},
          this.items.find((t) => t.type === 'custom'),
          {
            value: val,
          },
        ),
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
      if (!minDate || !maxDate) {
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
        minTimePicker.selectableRange = [
          [
            new Date(`${startDate} ${startTime}`),
            new Date(`${endDate} ${endTime}`),
          ],
        ]
        maxTimePicker.selectableRange = [
          [
            new Date(`${startDate} ${startTime}`),
            new Date(`${endDate} ${endTime}`),
          ],
        ]
      } else {
        // 控件日期 等于 开始日期
        if (pickStartDate === startDate) {
          minTimePicker.selectableRange = [
            [
              new Date(`${startDate} ${startTime}`),
              new Date(`${startDate} ${this.timeFormat.endTime}`),
            ],
          ]
        } else {
          minTimePicker.selectableRange = []
        }
        // 控件日期 等于 结束日期
        if (pickEndDate === endDate) {
          maxTimePicker.selectableRange = [
            [
              new Date(`${endDate} ${this.timeFormat.startTime}`),
              new Date(`${endDate} ${endTime}`),
            ],
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
      return this.range.map((t) => t || Date.now())
    },

    setPeriod(value) {
      const findOne = this.items.find((t) => t.value === value)
      if (!findOne) {
        this.changeTime(value?.split(',').map((t) => Number(t)))
        return
      }
      this.period = value
    },

    getPeriod(value) {
      return this.items.find((t) => t.value === (value || this.period))
    },
  },
}
</script>

<template>
  <div class="time-select__picker flex align-center">
    <div
      class="w-100 picker__item inline-flex align-items-center"
      @click="openSelect"
    >
      <div class="time-select__title">{{ title }}</div>
      <ElSelect
        ref="select"
        v-model="period"
        :class="{ 'is-time': isTime }"
        popper-class="time-select__popper"
        class="ml-2 dark flex-1"
        style="min-width: 180px"
        @change="changeFnc"
      >
        <ElOption
          v-for="(item, index) in items"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>
    <IconButton class="color-primary" @click.stop="openPicker"
      >timer</IconButton
    >
    <ElDatePicker
      ref="datetime"
      v-model="time"
      :picker-options="pickerOptions"
      type="datetimerange"
      :range-separator="$t('packages_dag_components_timeselect_zhi')"
      :start-placeholder="$t('packages_dag_components_timeselect_kaishiriqi')"
      :end-placeholder="$t('packages_dag_components_timeselect_jieshuriqi')"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="x"
      class="el-date-picker position-absolute overflow-hidden p-0 m-0"
      @change="changeTime"
      @blur="blur"
    />
  </div>
</template>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;

  :deep(.time-select__popper) {
    width: 270px;
    min-width: 270px !important;
    transform: translateX(-40px);
  }

  :deep(.el-select) {
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

  :deep(.el-date-picker) {
    height: 0;
    border: 0;
    bottom: 0;
    left: 0;
  }
}

.time-select__title {
  white-space: nowrap;
  line-height: 1.5;
}

.datetime {
  position: absolute;
}

.is-time {
  //flex: 1;
  //width: 260px;
}

.picker__item {
  padding: 0 8px;
  border-radius: 4px;

  //&:hover {
  //  background: #eef3ff;
  //}
}
</style>
