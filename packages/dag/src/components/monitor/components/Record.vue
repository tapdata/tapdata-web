<template>
  <div class="py-6 pl-6 h-100">
    <VTable
      :remoteMethod="remoteMethod"
      :columns="columns"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      ref="table"
      height="100"
      class="table-list"
      hide-on-single-page
    >
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

export default {
  name: 'Record',

  components: { VTable },

  data() {
    return {
      statusMap: {
        finish: {
          type: 'edit',
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
          prop: 'startTime',
          dataType: 'time'
        },
        {
          label: '运行结束时间',
          prop: 'stopTime',
          dataType: 'time'
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
          prop: 'count',
          dataType: 'number'
        },
        {
          label: '差异数据（行）',
          prop: 'diff',
          dataType: 'number'
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
      return new Promise((resolve, rejust) => {
        let list = Array(20)
          .fill()
          .map((t, index) => {
            return {
              id: Date.now() + index,
              startTime: Date.now(),
              stopTime: Date.now(),
              username: 'kennen',
              status: ['finish', 'running', 'error'][index] || 'error',
              count: Math.ceil(Math.random() * 10000),
              diff: Math.ceil(Math.random() * 10000)
            }
          })
        resolve({
          total: 10000,
          data: list
        })
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
