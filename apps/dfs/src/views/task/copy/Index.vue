<template>
  <div v-loading="loading" class="statistics-container flex flex-column font-color-sub">
    <Info :task="task" class="card-box g-panel-container" @reload="loadTask"></Info>
    <div class="card-box mt-6 pb-6 pt-2 px-6 g-panel-container">
      <ElTabs v-model="activeTab" class="flex flex-column flex-1 overflow-hidden" @tab-click="tabHandler">
        <ElTabPane :label="$t('task_monitor_progress')" name="schedule">
          <Schedule :task="task"></Schedule>
        </ElTabPane>
        <ElTabPane :label="$t('task_monitor_run_log')" name="log" lazy>
          <Log :id="task.id" style="max-height: 450px"></Log>
        </ElTabPane>
        <ElTabPane :label="$t('task_monitor_run_connection')" name="connect" lazy>
          <Connection ref="connection" :ids="connectionIds" @change="loadTask"></Connection>
        </ElTabPane>
        <ElTabPane :label="$t('task_monitor_history_run_record')" name="history" lazy>
          <History :ids="[task.id]" :operations="operations" :task="task"></History>
        </ElTabPane>
        <ElTabPane v-if="showContent" :label="$t('task_monitor_sync_content')" name="content" lazy>
          <FieldMapping
            ref="fieldMapping"
            :readOnly="true"
            :dataSourceModel="task.dataSourceModel"
            :field_process="field_process"
          ></FieldMapping>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<script>
import Info from './Info'
import Schedule from './Schedule'
import Log from '@/views/monitor/Log'
// src/views/monitor/Log.vue
import Connection from './Connection'
import History from './History'
import FieldMapping from '@/components/field-mapping/main'
import { isFinished } from './util'
import dayjs from 'dayjs'

export default {
  name: 'Index',
  components: { Info, Schedule, Log, Connection, History, FieldMapping },
  data() {
    return {
      loading: true,
      task: {},
      selectFlow: 'flow_', // 选中节点
      dataOverviewAll: 'flow',
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('task_info_data_screening'),
          loading: false
        },
        body: {
          outputCount: 0,
          inputCount: 0,
          insertCount: 0,
          updateCount: 0,
          deleteCount: 0
        }
      },
      throughputObj: {
        title: {
          key: 'throughput',
          statsType: 'throughput',
          time: 'second',
          title: this.$t('task_info_input_output'),
          tip: this.$t('task_info_throughputpop'),
          unit: 'QPS',
          class: 'putColor',
          loading: false
        },
        body: null,
        input: 0,
        output: 0
      },
      activeTab: 'schedule',
      showContent: false,
      field_process: [],
      operations: ['start', 'stop', 'forceStop']
    }
  },
  computed: {
    connectionIds() {
      return (
        this.task?.stages?.map(item => {
          return item.connectionId
        }) || []
      )
    }
  },
  created() {
    this.$ws.on('watch', this.taskChange)
    this.$ws.send({
      type: 'watch',
      collection: 'DataFlows',
      filter: {
        where: { 'fullDocument._id': { $in: [this.$route.params.id] } }, //查询条件
        fields: {
          'fullDocument.id': true,
          'fullDocument._id': true,
          'fullDocument.name': true,
          'fullDocument.status': true,
          'fullDocument.executeMode': true,
          'fullDocument.stopOnError': true,
          'fullDocument.last_updated': true,
          'fullDocument.createTime': true,
          'fullDocument.children': true,
          'fullDocument.stats': true,
          'fullDocument.setting': true,
          'fullDocument.cdcLastTimes': true,
          'fullDocument.listtags': true,
          'fullDocument.finishTime': true,
          'fullDocument.startTime': true,
          'fullDocument.errorEvents': true,
          'fullDocument.milestones': true,
          'fullDocument.user': true,
          'fullDocument.mappingTemplate': true,
          'fullDocument.stages': true
        }
      }
    })
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.$ws.off('watch', this.taskChange)
  },
  methods: {
    init() {
      this.loadTask()
    },
    loadTask() {
      let id = this.$route.params?.id
      this.loading = true
      this.$axios
        .get('tm/api/DataFlows/' + id)
        .then(data => {
          this.task = this.formatTask(data)
          this.showContentTab(this.task)
        })
        .finally(() => {
          this.loading = false
        })
    },
    taskChange(data) {
      let task = data.data?.fullDocument || {}
      if (this.task && JSON.stringify(task) !== JSON.stringify(this.task)) {
        this.task = Object.assign({}, this.task, this.formatTask(task))
      }
    },
    formatTask(data) {
      if (!data) {
        return
      }
      data.totalOutput = data.stats?.output?.rows || 0
      data.totalInput = data.stats?.input?.rows || 0
      data.creator = data.createUser || ''
      data.typeText =
        data.mappingTemplate === 'cluster-clone'
          ? this.$t('task_monitor_migration_task')
          : this.$t('task_monitor_sync_task')
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.formatTime(data.startTime)
      data.endTimeFmt = data.startTime ? this.formatTime(data.finishTime) : '-'
      data.cdcTimeFmt = this.formatTime(cdcTime)
      data.isFinished = isFinished(data)
      return data
    },
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    tabHandler() {
      this.$nextTick(() => {
        const { activeTab } = this
        if (activeTab === 'content') {
          this.$refs.fieldMapping.getMetaData(this.task)
          this.field_process = this.task?.stages[0]?.field_process || []
        }
        if (activeTab !== 'connect') {
          this.$refs.connection?.clearInterval?.()
        }
      })
    },
    //是否支持同步内容
    showContentTab(data) {
      let stageId = data?.stages?.[1]?.id || ''
      if (!stageId) {
        return
      }
      let param = {
        stages: data?.stages,
        stageId: stageId
      }
      this.$axios.post('tm/api/DataFlows/tranModelVersionControl', param).then(data => {
        this.showContent = data?.[stageId] || false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-box {
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  ::v-deep {
    .table-list {
      max-height: 400px;
    }
    //.el-tab-pane {
    //  min-height: 400px;
    //  max-height: 600px;
    //}
    .el-tabs__nav-wrap::after {
      height: 1px;
      background-color: #e8e8e8;
    }
    .field-mapping {
      height: 400px;
      .task-form-body {
        max-height: 350px;
      }
    }
    .el-tabs__nav-wrap {
      &::after {
        height: 1px;
      }
    }
    .number-text {
      font-family: DIN;
    }
  }
}
</style>
