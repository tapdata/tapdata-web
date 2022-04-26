<template>
  <div class="connection-container">
    <TableList
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="id"
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
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      list: [],
      fetchTimer: null,
      columns: [
        {
          label: this.$t('task_monitor_mining_task_name'),
          prop: 'name',
          slotName: 'name'
        },
        {
          label: this.$t('task_monitor_mining_task_point_time'),
          prop: 'pointTime'
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
      const { id } = this
      let { current, size } = page
      let filter = {
        where: {
          connections: [id]
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$api('logcollector')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res.data?.items || []
          let pointTime = new Date()

          return {
            total: res.data.total,
            data: list.map(item => {
              this.$set(item, 'pointTime', pointTime)
              if (item.syncTimePoint === 'current') {
                item.pointTime = this.$moment(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
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
