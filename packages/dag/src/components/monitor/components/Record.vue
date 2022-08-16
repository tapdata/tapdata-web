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
        <TaskStatus :task="scope.row" />
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns" v-if="dataflow.taskRecordId !== scope.row.taskRecordId">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">详情</ElButton>
        </div>
      </template>
    </VTable>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { taskApi } from '@tap/api'
import { TaskStatus } from '@tap/business'

export default {
  name: 'Record',

  components: { VTable, TaskStatus },

  props: {
    dataflow: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
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
      const { id: taskId } = this.dataflow || {}
      let filter = {
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
