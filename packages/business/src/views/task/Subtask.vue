<template>
  <div class="subtask-container">
    <TableList
      v-if="taskId"
      :remoteMethod="remoteMethod"
      :columns="columns"
      :page-options="{
        'hide-on-single-page': true
      }"
      max-height="100%"
      ref="tableList"
    >
      <template slot="status" slot-scope="scope">
        <span :class="['status-' + scope.row.status, 'status-block']">
          {{ $t('task_preview_status_' + scope.row.status) }}
        </span>
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
            :disabled="!statusBtMap['start'][scope.row.status]"
            auto-loading
            inner-loading
            type="text"
            @click="start(scope.row, arguments[0])"
          >
            {{ $t('task_button_start') }}
          </VButton>
          <ElDivider direction="vertical"></ElDivider>
          <VButton
            auto-loading
            inner-loading
            :disabled="!statusBtMap['stop'][scope.row.status]"
            type="text"
            @click="stop(scope.row, arguments[0])"
          >
            {{ $t('task_button_stop') }}
          </VButton>
          <ElDivider direction="vertical"></ElDivider>
          <VButton
            auto-loading
            inner-loading
            :disabled="!statusBtMap['reset'][scope.row.status]"
            type="text"
            @click="renew(scope.row, arguments[0])"
          >
            {{ $t('task_button_reset') }}
          </VButton>
          <ElDivider direction="vertical"></ElDivider>
          <VButton auto-loading inner-loading type="text" @click="toStatistics(scope.row)">{{
            $t('page_title_task_stat')
          }}</VButton>
        </div>
      </template>
    </TableList>
  </div>
</template>

<script>
import { subtaskApi } from '@tap/api'
import { VIcon, TableList } from '@tap/component'
import { deepCopy } from '@tap/shared'

let timeout = null
export default {
  name: 'Subtask',
  components: { TableList, VIcon },
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
          label: this.$t('task_info_subtasks_name'),
          prop: 'name'
        },
        {
          label: this.$t('task_info_subtasks_status'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: this.$t('column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      statusBtMap: {
        start: {
          ready: true,
          edit: true,
          stop: true,
          error: true,
          complete: true,
          schedule_failed: true
        },
        stop: {
          scheduling: true,
          preparing: true,
          running: true,
          wait_run: true
        },
        reset: {
          stop: true,
          error: true,
          complete: true,
          schedule_failed: true
        }
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
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.$refs.tableList.fetch(null, 0, true)
    }, 5000)
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    remoteMethod({ page }) {
      const { taskId } = this
      let { current, size } = page
      let filter = {
        limit: size,
        skip: size * (current - 1)
      }
      return subtaskApi
        .byTaskId(taskId, {
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let items = data || []
          let list = items.map(item => {
            item.status = item.status === 'edit' ? 'ready' : item.status
            return deepCopy(item)
          })
          return {
            total: list.length,
            data: list
          }
        })
    },
    start(row = {}, resetLoading) {
      subtaskApi
        .start(row.id)
        .then(data => {
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    stop(row, resetLoading) {
      subtaskApi
        .stop(row.id)
        .then(data => {
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    renew(row, resetLoading) {
      subtaskApi
        .renew(row.id)
        .then(data => {
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    pause(row = {}, resetLoading) {
      subtaskApi
        .pause(row.id)
        .then(data => {
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    toStatistics(row = {}) {
      this.$router.push({
        name: 'dataflowStatistics',
        params: {
          id: this.task.id,
          subId: row.id
        }
      })
    }
  }
}
</script>
