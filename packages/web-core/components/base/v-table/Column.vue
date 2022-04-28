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
    <template v-else-if="!children && item.dataType === 'time'" v-slot="scope">
      <div>{{ getValue(formatTime(scope.row[item.prop], item.fmt), item.default) }}</div>
    </template>
    <template v-else-if="!children" v-slot="scope">
      {{ getValue(scope.row[item.prop], item.default) }}
    </template>
    <!--  多表头  -->
    <template v-for="temp in children">
      <Column :item="temp" v-bind="temp" :key="temp.prop"></Column>
    </template>
  </ElTableColumn>
</template>

<script>
import Column from './Column'
import moment from 'moment'
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
      if (!time) {
        return
      }
      return moment(time).format(fmt)
    },
    getValue(val, d) {
      return val ?? d
    }
  }
}
</script>
