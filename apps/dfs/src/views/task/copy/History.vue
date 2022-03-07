<template>
  <div>
    <TableList :remoteMethod="remoteMethod" :remote-data="ids" :columns="columns" :hide-on-single-page="true">
      <template slot="dataFlowStatusLabel" slot-scope="scope">
        <div>
          <img
            :src="imgSrc(scope.row.statusObj.icon)"
            :data-status="scope.row.statusObj.text"
            alt=""
            class="status-img"
          />
        </div>
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'

export default {
  name: 'History',
  components: { TableList },
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
          icon: 'yunxingzhong'
        },
        completed: {
          text: this.$t('task_status_finished'),
          icon: 'yiwancheng'
        },
        paused: {
          text: this.$t('task_status_paused'),
          icon: 'daiqidong'
        },
        error: {
          text: this.$t('task_status_error'),
          icon: 'cuowu'
        }
      },
      lang: localStorage.getItem('tapdata_localize_lang') || 'sc'
    }
  },
  methods: {
    remoteMethod({ page }) {
      let { current, size } = page
      const { task, ids, startTypeMap, dataFlowStatusMap } = this
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
              t.statusObj = dataFlowStatusMap[t.dataFlowStatus] || {}
              return t
            })
          }
        })
    },
    imgSrc(icon) {
      if (this.lang === 'en') {
        return require(`../../../../public/images/task/${icon}.svg`)
      } else {
        return require(`../../../../public/images/task/${icon}.png`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-img {
  height: 25px;
}
</style>
