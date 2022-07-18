<template>
  <div class="time-select__picker">
    <div class="flex align-items-center">
      <div class="time-select__title">{{ title }}</div>
      <ElSelect v-model="period" :class="{ 'is-time': isTime }" size="mini" class="ml-2" @change="changeFnc">
        <ElOption v-for="(item, index) in items" :key="index" :label="item.label" :value="item.value"></ElOption>
      </ElSelect>
      <VIcon class="color-primary ml-2" @click="openPicker">timer</VIcon>
    </div>
    <ElDatePicker
      v-model="time"
      ref="datetime"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      format="yyyy-MM-dd HH:mm:ss"
      value-format="timestamp"
      style="height: 0; border: 0"
      class="position-absolute overflow-hidden p-0 m-0"
      @change="changeTime"
      @blur="blur"
    >
    </ElDatePicker>
  </div>
</template>

<script>
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
          label: '本次运行累计',
          value: 'now'
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
    }
  },
  data() {
    return {
      period: '',
      time: [],
      items: [],
      isTime: false
    }
  },
  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.period = this.items[0]?.value
  },
  methods: {
    changeFnc(value) {
      let findOne = this.items.find(t => t.value === value)
      if (findOne?.type === 'custom') {
        this.openPicker()
        return
      }
      this.isTime = !!findOne?.isTime
      // this.$emit(this.isTime ? 'time' : 'value', findOne.value)
      this.$emit('change', findOne.value, this.isTime, findOne)
    },
    openPicker() {
      if (this.period && this.period !== 'custom') {
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
        this.items.push({
          label: label,
          value: valJoin,
          isTime: true
        })
        this.isTime = true
      }
      this.period = valJoin
      // this.$emit('time', valJoin)
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
