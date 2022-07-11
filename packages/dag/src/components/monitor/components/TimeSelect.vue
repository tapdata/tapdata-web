<template>
  <div class="time-select">
    <div class="flex align-items-center mb-4">
      <div>{{ title }}</div>
      <ElSelect v-model="period" size="mini" class="ml-2" @change="changeFnc">
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
    rangeSeparator: String
  },
  data() {
    return {
      period: '',
      time: [],
      items: []
    }
  },
  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.period = this.items[0]?.value
  },
  methods: {
    changeFnc(value) {
      console.log('changeFnc', value, arguments)
      let findOne = this.items.find(t => t.value === value)
      console.log('findOne', findOne)
      if (findOne?.type === 'custom') {
        this.openPicker()
      }
    },
    openPicker() {
      this.$refs.datetime.focus()
    },
    changeTime(val) {
      const { rangeSeparator, formatToString } = this.$refs.datetime
      const label = formatToString(val)?.join(rangeSeparator)
      const valJoin = val.join()
      const findOne = this.items.find(t => t.value === valJoin)
      if (!findOne) {
        this.items.push({
          label: label,
          value: valJoin
        })
      }
      this.period = valJoin
    }
  }
}
</script>

<style lang="scss" scoped>
.time-select {
  position: relative;
}
.datetime {
  position: absolute;
}
</style>
