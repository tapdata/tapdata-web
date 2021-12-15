<template>
  <div class="subtask-container">
    <TableList
      v-if="taskId"
      :remoteMethod="remoteMethod"
      :columns="columns"
      :page-options="{
        'hide-on-single-page': true
      }"
      height="100%"
      ref="tableList"
    >
      <template slot="status" slot-scope="scope">
        <StatusTag type="text" target="etlSub" :status="scope.row.status"></StatusTag>
      </template>
      <template slot="schemaHeader">
        <div>
          {{ $t('connection_list_column_schema_status') }}
          <ElTooltip placement="top" :content="$t('connection_list_column_schema_status_tips')">
            <VIcon class="color-primary" size="14">info</VIcon>
          </ElTooltip>
        </div>
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <VButton
            :disabled="startDisabled(scope.row)"
            auto-loading
            inner-loading
            type="text"
            @click="start(scope.row, arguments[0])"
          >
            运行
          </VButton>
          <VButton :disabled="stopDisabled(scope.row)" class="mr-2" type="text" @click="stop(scope.row, arguments[0])">
            停止
          </VButton>
          <VButton type="text">运行统计</VButton>
        </div>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import StatusTag from '@/components/StatusTag'
import VIcon from '@/components/VIcon'
import { deepCopy } from '@/utils/util'

export default {
  name: 'Subtask',
  components: { TableList, StatusTag, VIcon },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      list: [],
      timer: null,
      fetchTimer: null,
      columns: [
        {
          label: '子任务名称',
          prop: 'name'
        },
        {
          label: '状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '操作',
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      statusBtMap: {
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true }
      }
    }
  },
  computed: {
    taskId() {
      return this.task?.id
    },
    table() {
      return this.$refs.tableList
    }
  },
  methods: {
    init() {},
    remoteMethod({ page }) {
      const { taskId } = this
      let { current, size } = page
      let filter = {
        limit: size,
        skip: size * (current - 1)
      }
      return this.$api('SubTask')
        .byTaskId(taskId, {
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let items = res.data
          let data = items.map(item => {
            return deepCopy(item)
          })
          return {
            total: data.length,
            data: data
          }
        })
    },
    startDisabled(row) {
      return false
      // return !this.statusBtMap['run'][row.status] || (row.status === 'draft' && row.checked === false)
    },
    stopDisabled(row) {
      return false
      // return !this.statusBtMap['stop'][row.status]
    },
    start(row = {}, resetLoading) {
      this.$api('SubTask')
        .start(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    },
    stop(row, resetLoading) {
      this.$api('SubTask')
        .stop(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    }
  }
}
</script>

<style scoped></style>
