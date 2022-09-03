<template>
  <div v-loading="loading" class="statistics-container font-color-slight">
    <Info
      :task="task"
      :syncData="syncData"
      class="card-box card-box__info"
      :remote-method="infoRemoteMethod"
      @reload="loadTask"
    ></Info>
    <div class="card-box__content card-box px-6 py-2 mt-6">
      <ElTabs v-model="activeTab" class="flex flex-column flex-1 overflow-hidden h-100">
        <ElTabPane :label="$t('packages_business_task_monitor_progress')" name="schedule">
          <Schedule :task="task" @sync="getSyncData"></Schedule>
        </ElTabPane>
        <ElTabPane :label="$t('packages_business_task_monitor_run_log')" name="log" lazy>
          <Log :id="task.id" style="max-height: 450px"></Log>
        </ElTabPane>
        <ElTabPane :label="$t('packages_business_task_monitor_run_connection')" name="connect" lazy>
          <Connection ref="connection" :ids="connectionIds" @change="loadTask"></Connection>
        </ElTabPane>
        <ElTabPane :label="$t('packages_business_task_monitor_history_run_record')" name="history" lazy>
          <History :ids="[task.parentId]" :operations="operations"></History>
        </ElTabPane>
        <ElTabPane :label="$t('packages_business_task_monitor_mining_task')" name="sharedMing" lazy>
          <ShareMining :id="task.id"></ShareMining>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<script>
import { measurementApi, subtaskApi } from '@tap/api'

import { Log } from '../../../../components'
import Info from './Info'
import Schedule from './Schedule'
import Connection from './Connection'
import History from './History'
import ShareMining from '../../etl/statistics/ShareMining'

export default {
  name: 'Index',
  components: { Info, Schedule, Log, Connection, History, ShareMining },
  data() {
    return {
      timer: null,
      loading: true,
      task: {},
      selectFlow: 'flow_', // 选中节点
      dataOverviewAll: 'flow',
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('packages_business_task_info_data_screening'),
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
          title: this.$t('packages_business_task_info_input_output'),
          tip: this.$t('packages_business_task_info_throughputpop'),
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
      operations: ['start', 'stop', 'forceStop'],
      syncData: {}
    }
  },
  computed: {
    connectionIds() {
      return (
        this.task?.dag?.nodes?.map(item => {
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
        where: { 'fullDocument._id': { $in: [this.$route.query.id] } }, //查询条件
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
          'fullDocument.mappingTemplate': true
        }
      }
    })
    this.timer = setInterval(() => {
      this.loadTask(true)
    }, 5000)
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.$ws.off('watch', this.taskChange)
    this.timer && clearInterval(this.timer)
  },
  methods: {
    init() {
      this.loadTask()
    },
    async loadTask(hiddenLoading) {
      if (!hiddenLoading) {
        this.loading = true
      }
      let id = this.$route.query?.subId
      subtaskApi
        .get([id])
        .then(data => {
          if (JSON.stringify(this.formatTask(data)) === JSON.stringify(this.task)) {
            return
          }
          this.task = this.formatTask(data)
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
      data.totalOutput = data.stats?.output?.rows || 0
      data.totalInput = data.stats?.input?.rows || 0
      data.creator = data.creator || data.createUser || data.username || data.user?.username || '-'
      data.typeText = data.mappingTemplate === 'cluster-clone' ? '迁移任务' : '同步任务'
      return data
    },
    infoRemoteMethod(params) {
      return measurementApi.query(params).then(data => {
        return data
      })
    },
    clearTimer() {
      this.timer && clearInterval(this.timer)
    },
    //接收全量同步的实时数据
    getSyncData(data) {
      this.syncData = data
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-container {
  font-size: 12px;
  overflow: auto !important;
}
.card-box {
  background-color: map-get($bgColor, white);
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  ::v-deep {
    // .table-list {
    //height: 300px;
    // }
    .el-tab-pane {
      height: 100%;
      min-height: 400px;
    }
    .field-mapping {
      min-height: 400px;
      .task-form-body {
        max-height: 350px;
      }
    }
  }
}
.card-box__info {
  border-bottom: 1px solid #e4e7ed;
}
.card-box__content {
  flex: 1;
  ::v-deep {
    .el-tabs__content {
      flex: 1;
      height: calc(100% - 70px);
      overflow-y: auto;
    }
    .el-tab-pane {
      height: 100%;
    }
  }
}
</style>
