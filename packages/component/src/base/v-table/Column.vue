<script>
import dayjs from 'dayjs'
import { defineAsyncComponent } from 'vue'
export default {
  name: 'Column',
  components: { Column: defineAsyncComponent(() => import('./Column')) },
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  computed: {
    children() {
      return this.item?.children
    },
  },
  methods: {
    formatTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
      return time ? dayjs(time).format(fmt) : ''
    },
    formatNumber(val) {
      return typeof val === 'number' ? val.toLocaleString() : ''
    },
    getValue(row, item) {
      const val = row[item.prop]
      if ([undefined, null].includes(val)) {
        return item.default
      }
      const map = {
        time: this.formatTime,
        number: this.formatNumber,
      }
      if (map[item.dataType]) {
        return map[item.dataType]?.(val, item.format) || item.default
      }
      return val
    },
  },
}
</script>

<template>
  <ElTableColumn
    v-bind="item"
    :key="item.prop"
    :sortable="item.sortable ? 'custom' : false"
  >
    <!--  列表头  -->
    <template v-if="item.headerSlot" #header>
      <slot :name="item.headerSlot" />
    </template>
    <!--  表体  -->
    <template v-if="!children && item.slotName" #default="scope">
      <slot :name="item.slotName" :row="scope.row" :prop="item.prop" />
    </template>
    <template v-else-if="!children && !item.type" #default="scope">
      {{ getValue(scope.row, item) }}
    </template>
    <!--  多表头  -->
    <template v-if="!item.type">
      <Column
        v-for="temp in children"
        :key="temp.prop"
        v-bind="temp"
        :item="temp"
      />
    </template>
  </ElTableColumn>
</template>
