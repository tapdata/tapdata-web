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
          <!--          <VButton-->
          <!--            v-if="scope.row.status === 'running'"-->
          <!--            :disabled="!statusBtMap['pause'][scope.row.status]"-->
          <!--            auto-loading-->
          <!--            inner-loading-->
          <!--            type="text"-->
          <!--            @click="pause(scope.row, arguments[0])"-->
          <!--          >-->
          <!--            {{ $t('task_button_pause') }}-->
          <!--          </VButton>-->
          <!--          <VButton-->
          <!--            v-else-if="['pause', 'schedule_failed', 'error'].includes(scope.row.status)"-->
          <!--            :disabled="!statusBtMap['recover'][scope.row.status]"-->
          <!--            auto-loading-->
          <!--            inner-loading-->
          <!--            type="text"-->
          <!--            @click="start(scope.row, arguments[0])"-->
          <!--          >-->
          <!--            {{ $t('task_button_recover') }}-->
          <!--          </VButton>-->
          <ElButton
            :disabled="!statusBtMap['start'][scope.row.status]"
            auto-loading
            inner-loading
            type="text"
            @click="start(scope.row, arguments[0])"
          >
            {{ $t('task_button_start') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <!--          <VButton-->
          <!--            v-if="scope.row.status === 'stopping'"-->
          <!--            :disabled="!statusBtMap['task_button_force_stop'][scope.row.status]"-->
          <!--            class="mr-2"-->
          <!--            type="text"-->
          <!--            @click="stop(scope.row, arguments[0])"-->
          <!--          >-->
          <!--            {{ $t('task_button_force_stop') }}-->
          <!--          </VButton>-->
          <ElButton
            :disabled="!statusBtMap['stop'][scope.row.status]"
            type="text"
            @click="stop(scope.row, arguments[0])"
          >
            {{ $t('task_button_stop') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            :disabled="!statusBtMap['reset'][scope.row.status]"
            type="text"
            @click="renew(scope.row, arguments[0])"
          >
            {{ $t('task_button_reset') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton type="text" @click="toStatistics(scope.row)">{{ $t('page_title_task_stat') }}</ElButton>
        </div>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import VIcon from '@/components/VIcon'
import { deepCopy } from '@/utils/util'
import { subtaskApi } from '@tap/api'

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
        .then(res => {
          let items = res || []
          let data = items.map(item => {
            item.status = item.status === 'edit' ? 'ready' : item.status
            return deepCopy(item)
          })
          return {
            total: data.length,
            data: data
          }
        })
    },
    start(row = {}, resetLoading) {
      subtaskApi
        .start(row.id)
        .then(res => {
          this.$message.success(res?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    stop(row, resetLoading) {
      subtaskApi
        .stop(row.id)
        .then(res => {
          this.$message.success(res?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    renew(row, resetLoading) {
      subtaskApi
        .renew(row.id)
        .then(res => {
          this.$message.success(res?.message || this.$t('message_operation_succuess'))
          this.table.fetch()
        })
        .finally(resetLoading)
    },
    pause(row = {}, resetLoading) {
      subtaskApi
        .pause(row.id)
        .then(res => {
          this.$message.success(res?.message || this.$t('message_operation_succuess'))
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

<style scoped></style>
