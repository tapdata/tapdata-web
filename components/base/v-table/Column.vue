<template>
  <ElTableColumn v-bind="item" :key="item.prop" :sortable="item.sortable ? 'custom' : false">
    <template v-if="!children && item.slotName" v-slot="scope">
      <slot :name="item.slotName" :row="scope.row"></slot>
    </template>
    <template v-else-if="!children && item.dataType === 'time'" v-slot="scope">
      <div>{{ formatTime(scope.row[item.prop], item.fmt) || item.default }}</div>
    </template>
    <template v-else-if="!children" v-slot="scope">
      {{ scope.row[item.prop] || item.default }}
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
      return moment(time).format(fmt)
    }
  }
}
</script>
