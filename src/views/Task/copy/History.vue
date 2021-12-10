<template>
  <div>
    <TableList :remoteMethod="remoteMethod" :remote-data="ids" :columns="columns" hide-on-single-page>
      <template slot="desc" slot-scope="scope">
        <span>{{ mapData[scope.row.operation] }}</span>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'

export default {
  name: 'History',
  components: { TableList },
  props: {
    ids: {
      type: Array,
      default: () => []
    },
    operations: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      mapData: {
        start: '启动任务',
        stop: '停止任务',
        forceStop: '强制停止任务'
      },
      columns: [
        {
          label: '任务名称',
          prop: 'parameter1'
        },
        {
          label: '运行时间',
          prop: 'createTime',
          dataType: 'time'
        },
        {
          label: '操作者',
          prop: 'username'
        },
        {
          label: '操作内容',
          prop: 'desc',
          slotName: 'desc'
        }
      ]
    }
  },
  methods: {
    remoteMethod({ page }) {
      let { current, size } = page
      const { ids, operations } = this
      let where = {
        sourceId: {
          inq: ids
        },
        modular: 'migration',
        operation: {
          inq: operations
        }
      }
      let filter = {
        where: where,
        limit: size,
        skip: size * (current - 1)
      }
      return Promise.all([
        this.$axios.get('tm/api/UserLogs/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios.get('tm/api/UserLogs?filter=' + encodeURIComponent(JSON.stringify(filter)))
      ]).then(([countData, data]) => {
        return {
          total: countData.count,
          data: data
        }
      })
    }
  }
}
</script>

<style scoped></style>
