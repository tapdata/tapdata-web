<template>
  <ElTableColumn v-bind="item" :key="item.prop" :sortable="item.sortable ? 'custom' : false">
    <!--  列表头  -->
    <template v-if="item.headerSlot" slot="header">
      <slot :name="item.headerSlot"></slot>
    </template>
    <!--  表体  -->
    <template v-if="!children && item.slotName" v-slot="scope">
      <slot :name="item.slotName" :row="scope.row" :prop="item.prop"></slot>
    </template>
    <template v-else-if="!children && !item.type" v-slot="scope">
      {{ getValue(scope.row, item) }}
    </template>
    <!--  多表头  -->
    <template v-for="temp in children">
      <Column :item="temp" v-bind="temp" :key="temp.prop"></Column>
    </template>
  </ElTableColumn>
</template>

<script>
import Column from './Column'
import dayjs from 'dayjs'
export default {
  name: 'Column',
  components: { Column },
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    children() {
      return this.item?.children
    }
  },
  methods: {
    formatTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
      return time ? dayjs(time).format(fmt) : ''
    },
    formatNumber(val) {
      return val ? val.toLocaleString() : ''
    },
    getValue(row, item) {
      const val = row[item.prop]
      if ([undefined, null].includes(val)) {
        return item.default
      }
      const map = {
        time: this.formatTime,
        number: this.formatNumber
      }
      if (map[item.dataType]) {
        return map[item.dataType]?.(val)
      }
      return val
    }
  }
}
</script>
