<template>
  <div>
    <TableList :remoteMethod="remoteMethod" :remote-data="ids" :columns="columns" :hide-on-single-page="true">
      <template slot="dataFlowStatusLabel" slot-scope="scope">
        <StatusTag type="tag" :status="scope.row.dataFlowStatus" :statusMap="dataFlowStatusMap"></StatusTag>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'History',
  components: { TableList, StatusTag },
  props: {
    ids: {
      type: Array,
      default: () => []
    },
    operations: {
      type: Array,
      default: () => []
    },
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      mapData: {
        start: this.$t('task_start_task'),
        stop: this.$t('task_stop_task'),
        forceStop: this.$t('task_info_forced_stop_task')
      },
      columns: [
        {
          label: this.$t('task_name'),
          prop: 'dataFlowName'
        },
        {
          label: this.$t('task_info_running_time'),
          prop: 'dataFlowStartTime',
          dataType: 'time',
          default: '-'
        },
        {
          label: this.$t('task_info_running_end_time'),
          prop: 'dataFlowEndTime',
          dataType: 'time',
          default: '-'
        },
        {
          label: this.$t('task_info_history_start_type'),
          prop: 'startTypeLabel'
        },
        {
          label: this.$t('task_info_history_running_status'),
          prop: 'dataFlowStatusLabel',
          slotName: 'dataFlowStatusLabel'
        }
      ],
      startTypeMap: {
        manual: this.$t('task_info_history_start_type_manual'),
        auto: this.$t('task_info_history_start_type_auto')
      },
      dataFlowStatusMap: {
        running: {
          text: this.$t('task_status_running'),
          type: 'success'
        },
        completed: {
          text: this.$t('task_status_finished'),
          type: 'success'
        },
        paused: {
          text: this.$t('task_milestone_paused'),
          type: 'info'
        },
        error: {
          text: this.$t('task_status_error'),
          type: 'danger'
        }
      }
    }
  },
  methods: {
    remoteMethod({ page }) {
      let { current, size } = page
      const { task, ids, startTypeMap } = this
      let where = {
        dataFlowId: ids[0]
      }
      let filter = {
        where: where,
        limit: size,
        skip: size * (current - 1)
      }
      return this.$axios
        .get('tm/api/DataFlowRecord?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          return {
            total: data.total,
            data: data.items.map(t => {
              t.dataFlowName = task.name || '-'
              t.startTypeLabel = startTypeMap[t.startType]
              return t
            })
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.status-img {
  height: 25px;
}
</style>
