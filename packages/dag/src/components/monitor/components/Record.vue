<template>
  <div class="p-4 h-100">
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
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
            $t('packages_dag_components_record_xiangqing')
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
          label: i18n.t('packages_dag_components_record_yunxingkaishishi'),
          prop: 'startDate',
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_components_record_yunxingjieshushi'),
          prop: 'endDate',
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
          label: i18n.t('packages_dag_components_record_caozuo'),
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
    }
  }
}
</script>
