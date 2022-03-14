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
          <VButton
            :disabled="!statusBtMap['start'][scope.row.status]"
            auto-loading
            inner-loading
            type="text"
            @click="start(scope.row, arguments[0])"
          >
            {{ $t('task_button_start') }}
          </VButton>
          <!--          <VButton-->
          <!--            v-if="scope.row.status === 'stopping'"-->
          <!--            :disabled="!statusBtMap['task_button_force_stop'][scope.row.status]"-->
          <!--            class="mr-2"-->
          <!--            type="text"-->
          <!--            @click="stop(scope.row, arguments[0])"-->
          <!--          >-->
          <!--            {{ $t('task_button_force_stop') }}-->
          <!--          </VButton>-->
          <VButton
            :disabled="!statusBtMap['stop'][scope.row.status]"
            class="mr-2"
            type="text"
            @click="stop(scope.row, arguments[0])"
          >
            {{ $t('task_button_stop') }}
          </VButton>
          <VButton
            :disabled="!statusBtMap['reset'][scope.row.status]"
            class="mr-2"
            type="text"
            @click="renew(scope.row, arguments[0])"
          >
            {{ $t('task_button_reset') }}
          </VButton>
          <VButton type="text" @click="toStatistics(scope.row)">{{ $t('task_details_running_statistics') }}</VButton>
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
        start: {
          edit: true,
          stop: true,
          complete: true
        },
        pause: {
          running: true
        },
        recover: {
          pause: true,
          schedule_failed: true,
          error: true
        },
        stop: {
          pause: true,
          schedule_failed: true,
          error: true,
          running: true
        },
        reset: {
          pause: true,
          stop: true,
          complete: true,
          schedule_failed: true,
          error: true
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
    },
    renew(row, resetLoading) {
      this.$api('SubTask')
        .renew(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    },
    pause(row = {}, resetLoading) {
      this.$api('SubTask')
        .pause(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
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
