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
      <template #status="{ row }">
        <ElTag :type="row.statusType" size="small">{{ row.status }}</ElTag>
      </template>
      <template #operation="{ row }">
        <div class="operate-columns">
          <ElButton size="mini" type="text">
            {{ $t('public_button_details') }}
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
import { taskInspectApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import InspectDetailDialog from './InspectDetailDialog.vue'
import dayjs from 'dayjs'

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
          prop: 'beginTime',
          minWidth: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_end_time'),
          prop: 'endTime',
          minWidth: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_status'),
          prop: 'status',
          slotName: 'status',
          minWidth: 100
        },

        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          width: 100
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

      return taskInspectApi
        .getHistories(taskId, params)
        .then(data => {
          return {
            total: data.total || 0,
            data:
              data.items?.map(item => {
                return {
                  id: item.id,
                  type: this.getInspectTypeName(item.inspectMethod || item.type),
                  beginTime: dayjs(item.beginTime).format('YYYY-MM-DD HH:mm:ss'),
                  endTime: item.endTime ? dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss') : '',
                  ...this.makeStatus(item.status)
                  // taskId: item.taskId,
                  // inspectId: item.id,
                  // rawData: item
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

    makeStatus(status) {
      const statusMap = {
        RUNNING: i18n.t('public_status_running'),
        STOPPED: i18n.t('public_status_stop'),
        DONE: i18n.t('public_status_finished'),
        ERROR: i18n.t('public_status_error')
      }

      const typeMap = {
        RUNNING: 'success',
        STOPPED: 'info',
        DONE: 'primary',
        ERROR: 'danger'
      }

      return {
        status: statusMap[status],
        statusType: typeMap[status]
      }
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
