<template>
  <div>
    <TableList :remoteMethod="remoteMethod" :columns="columns" :hide-on-single-page="true">
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
      let filter = {
        where: {
          sourceId: {
            in: ids
          },
          modular: 'migration',
          operation: {
            inq: operations
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$api('UserLogs')
        .get({
          filter: JSON.stringify(filter)
        })
        .then((res) => {
          let { items, total } = res.data
          let data = items
          return {
            total: total,
            data: data
          }
        })
    }
  }
}
</script>

<style scoped></style>
