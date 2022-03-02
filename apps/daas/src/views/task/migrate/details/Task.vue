<template>
  <div class="connection-container">
    <TableList
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="ids"
      height="100%"
      :has-pagination="false"
      ref="tableList"
    >
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{ $t('button_details') }}</ElButton>
        </div>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'

export default {
  name: 'Task',
  components: { TableList },
  props: {
    id: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      fetchTimer: null,
      columns: [
        {
          label: this.$t('task_monitor_mining_task_name'),
          slotName: 'name'
        },
        {
          label: this.$t('task_monitor_mining_task_point_time'),
          prop: 'point'
        },
        {
          label: this.$t('task_monitor_mining_task_status'),
          prop: 'status'
        },
        {
          label: this.$t('column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ]
    }
  },
  methods: {
    remoteMethod({ page }) {
      const { ids } = this
      let { current, size } = page
      let filter = {
        where: {
          id: {
            inq: ids
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res.data.total,
            data: res.data.items
          }
        })
    },
    getTableData() {
      return this.$refs.tableList?.getData()
    },
    fetch() {
      this.$refs.tableList?.fetch(null, null, true)
    },
    handleDetail() {}
  }
}
</script>
