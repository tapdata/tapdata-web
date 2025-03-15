<template>
  <div class="inspect-wrap py-4 pl-4 h-100 w-100">
    <VTable
      :remoteMethod="remoteMethod"
      :columns="columns"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      ref="table"
      height="100%"
      hide-on-single-page
    >
      <template slot="status" slot-scope="scope">
        <ElTag :type="getStatusType(scope.row.status)" size="small">{{ scope.row.status }}</ElTag>
      </template>
      <template slot="result" slot-scope="scope">
        <ElTag :type="getResultType(scope.row.result)" size="small">{{ scope.row.result }}</ElTag>
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">
            {{ $t('public_button_details') }}
          </ElButton>
          <ElButton
            size="mini"
            type="text"
            @click="handleCheck(scope.row)"
            v-if="scope.row.status === 'error' && scope.row.result === '错误'"
          >
            {{ $t('public_button_view') }}
          </ElButton>
        </div>
      </template>
    </VTable>

    <!-- Inspect detail dialog -->
    <InspectDetailDialog :visible.sync="detailDialogVisible" :inspectId="currentInspectId" />
  </div>
</template>

<script>
import i18n from '@tap/i18n'
import { VTable } from '@tap/component'
import { taskApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import InspectDetailDialog from './InspectDetailDialog.vue'

export default {
  name: 'TaskInspect',

  components: { VTable, InspectDetailDialog },

  props: {
    dataflow: {
      type: Object,
      default: () => ({})
    },
    currentTab: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_dag_inspect_type'),
          prop: 'type',
          minWidth: 100
        },
        {
          label: i18n.t('packages_dag_inspect_start_time'),
          prop: 'startTime',
          width: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_end_time'),
          prop: 'endTime',
          width: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_status'),
          prop: 'status',
          slotName: 'status',
          minWidth: 100
        },
        {
          prop: 'result',
          slotName: 'result',
          minWidth: 100
        },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          minWidth: 100
        }
      ],
      detailDialogVisible: false,
      currentInspectId: ''
    }
  },

  watch: {
    currentTab(val) {
      if (val === 'inspect') {
        this.fetch()
      }
    }
  },

  methods: {
    remoteMethod({ page }) {
      const { current, size } = page
      const { id: taskId } = this.dataflow || {}

      if (!taskId) return Promise.resolve({ total: 0, data: [] })

      const params = {
        page: current,
        size: size
      }

      return taskApi
        .autoInspectResults(taskId, params)
        .then(data => {
          return {
            total: data.total || 0,
            data:
              data.items?.map(item => {
                return {
                  id: item.id,
                  type: this.getInspectTypeName(item.inspectMethod || item.type),
                  startTime: item.startTime || item.lastStartTime,
                  endTime: item.endTime || item.lastEndTime,
                  status: this.getStatusName(item.status),
                  result: this.getResultName(item.result),
                  taskId: item.taskId,
                  inspectId: item.id,
                  rawData: item
                }
              }) || []
          }
        })
        .catch(err => {
          console.error('Failed to fetch inspection results:', err)
          return { total: 0, data: [] }
        })
    },

    getInspectTypeName(type) {
      const typeMap = {
        row_count: i18n.t('packages_dag_components_inspect_type_count'),
        hash: i18n.t('packages_dag_components_inspect_type_hash'),
        field: i18n.t('packages_dag_components_inspect_type_field'),
        jointField: i18n.t('packages_dag_components_inspect_type_jointField'),
        full: i18n.t('packages_dag_components_inspect_type_full'),
        increment: i18n.t('packages_dag_components_inspect_type_increment')
      }
      return typeMap[type] || type
    },

    getStatusName(status) {
      const statusMap = {
        scheduling: i18n.t('packages_dag_components_inspect_status_scheduling'),
        running: i18n.t('packages_dag_components_inspect_status_running'),
        done: i18n.t('packages_dag_components_inspect_status_done'),
        error: i18n.t('packages_dag_components_inspect_status_error')
      }
      return statusMap[status] || status
    },

    getResultName(result) {
      const resultMap = {
        passed: i18n.t('packages_dag_components_inspect_result_passed'),
        failed: i18n.t('packages_dag_components_inspect_result_failed'),
        error: i18n.t('packages_dag_components_inspect_result_error')
      }
      return resultMap[result] || result
    },

    getStatusType(status) {
      const typeMap = {
        运行中: 'primary',
        已完成: 'success',
        错误: 'danger'
      }
      return typeMap[status] || 'info'
    },

    getResultType(result) {
      const typeMap = {
        一致: 'success',
        错误: 'danger'
      }
      return typeMap[result] || 'info'
    },

    handleDetail(row) {
      if (!row.inspectId) return

      // Open the detail dialog
      this.currentInspectId = row.inspectId
      this.detailDialogVisible = true
    },

    handleCheck(row) {
      if (!row.inspectId) return

      // Navigate to check page to view error details
      const routeUrl = this.$router.resolve({
        name: 'dataVerifyResult',
        params: {
          id: row.inspectId
        }
      })
      openUrl(routeUrl.href)
    },

    fetch() {
      this.$refs.table?.fetch(...arguments)
    },

    getPage() {
      return this.$refs.table?.getPage()
    }
  }
}
</script>

<style lang="scss" scoped>
.inspect-wrap {
  width: calc(100% - 16px);
}
</style>
