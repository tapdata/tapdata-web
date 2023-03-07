<template>
  <div class="record-wrap py-4 pl-4 h-100">
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
        <TaskStatus :task="scope.row" />
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
            $t('public_button_details')
          }}</ElButton>
        </div>
      </template>
    </VTable>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { VTable } from '@tap/component'
import { taskApi } from '@tap/api'
import { TaskStatus } from '@tap/business'
import { openUrl } from '@tap/shared'
import Time from '@tap/shared/src/time'

export default {
  name: 'Record',

  components: { VTable, TaskStatus },

  props: {
    dataflow: {
      type: Object,
      default: () => {}
    },
    taskRecord: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: []
        }
      }
    }
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_dag_components_record_yunxingkaishishi'),
          prop: 'startDate',
          width: 160,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_components_record_yunxingjieshushi'),
          prop: 'endDate',
          width: 160,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_components_record_caozuoren'),
          prop: 'operator'
        },
        {
          label: i18n.t('packages_dag_components_record_yunxingjieguo'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: i18n.t('packages_dag_components_record_shurushijianzong'),
          prop: 'inputTotal',
          dataType: 'number'
        },
        {
          label: i18n.t('packages_dag_components_record_shuchushijianzong'),
          prop: 'outputTotal',
          dataType: 'number'
        },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation'
        }
      ]
    }
  },

  watch: {
    taskRecord: {
      deep: true,
      handler(v) {
        const page = this.getPage() || {}
        if (
          page.current === 1 &&
          (v?.total !== page.total || JSON.stringify(v?.items) !== JSON.stringify(this.getTableData()))
        ) {
          this.fetch()
        }
      }
    }
  },

  methods: {
    remoteMethod({ page }) {
      const { current, size } = page
      const { id: taskId } = this.dataflow || {}
      let filter = {
        page: current,
        size: size
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
      const start = startDate ? new Date(startDate).getTime() - 1000 : Time.now()
      const end = endDate ? new Date(endDate).getTime() : Time.now()
      const routeUrl = this.$router.resolve({
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
      openUrl(routeUrl.href)
    },

    fetch() {
      this.$refs.table?.fetch(...arguments)
    },

    getPage() {
      return this.$refs.table?.getPage()
    },

    getTableData() {
      return this.$refs.table?.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.record-wrap {
  width: calc(100% - 16px);
}
</style>
