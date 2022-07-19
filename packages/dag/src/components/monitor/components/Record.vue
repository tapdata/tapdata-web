<template>
  <div class="p-6">
    <VTable :remoteMethod="remoteMethod" :columns="columns" ref="table" class="table-list" hide-on-single-page>
      <template slot="status" slot-scope="scope">
        <span v-if="scope.row.status" :class="['status-' + getStatusItem(scope.row.status).type, 'status-block']">
          {{ getStatusItem(scope.row.status).label }}
        </span>
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">详情</ElButton>
        </div>
      </template>
    </VTable>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { userLogsApi } from '@tap/api'

export default {
  name: 'Record',

  components: { VTable },

  data() {
    return {
      statusMap: {
        finish: {
          type: 'finish',
          label: '已完成'
        },
        error: {
          type: 'error',
          label: '错误'
        },
        running: {
          type: 'running',
          label: '运行中'
        }
      },
      columns: [
        {
          label: '运行开始时间',
          prop: 'createTime'
        },
        {
          label: '运行结束时间',
          prop: 'last_updated'
        },
        {
          label: '操作人',
          prop: 'username'
        },
        {
          label: '运行结果',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '同步数据量',
          prop: 'count'
        },
        {
          label: '差异数据（行）',
          prop: 'diff'
        },
        {
          label: '操作',
          slotName: 'operation'
        }
      ]
    }
  },

  methods: {
    remoteMethod({ page }) {
      let { current, size } = page
      let ids = [this.$attrs.dataflow?.id]
      let operations = ['start', 'stop', 'forceStop']
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
      return userLogsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: (data?.items || []).map(t =>
              Object.assign({}, t, {
                status: 'finish',
                count: 12,
                diff: 23
              })
            )
          }
        })
    },

    getStatusItem(status) {
      return this.statusMap[status] || {}
    },

    handleDetail(row) {
      console.log('handleDetail', row)
    }
  }
}
</script>

<style scoped></style>
