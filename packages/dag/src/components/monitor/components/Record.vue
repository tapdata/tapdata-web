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
import { taskApi } from '@tap/api'

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
          prop: 'startDate',
          dataType: 'time'
        },
        {
          label: '运行结束时间',
          prop: 'endDate',
          dataType: 'time'
        },
        {
          label: '操作人',
          prop: 'operator'
        },
        {
          label: '运行结果',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '输入事件总量',
          prop: 'inputTotal',
          dataType: 'number'
        },
        {
          label: '输出事件总量',
          prop: 'outputTotal',
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
      const { current, size } = page
      const { id: taskId } = this.$attrs.dataflow || {}
      let filter = {
        // taskId,
        limit: size,
        skip: size * (current - 1)
      }
      return taskApi.records(taskId, filter).then(data => {
        return {
          total: data.total,
          data: data.items || []
        }
      })
    },

    getStatusItem(status) {
      return this.statusMap[status] || {}
    },

    handleDetail(row = {}) {
      const { taskId, taskRecordId, startDate, endDate } = row
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      this.$router.push({
        name: 'MigrationMonitorViewer',
        params: {
          id: taskId
        },
        query: {
          taskRecordId,
          start,
          end
        }
      })
    }
  }
}
</script>

<style scoped></style>
