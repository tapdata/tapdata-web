<template>
  <div class="statistics-container flex flex-column font-color-slight h-100 section-wrap">
    <div class="statistics-container-box">
      <Info
        :task="task"
        class="card-box card-box__info"
        :syncData="syncData"
        :remote-method="infoRemoteMethod"
        @reload="loadTask"
      ></Info>
      <div class="flex-1 mt-6 pb-12 section-wrap-box">
        <ElTabs v-model="activeTab" class="flex flex-column flex-1 overflow-hidden h-100">
          <ElTabPane :label="$t('task_monitor_progress')" name="schedule" lazy>
            <Schedule :task="task" @sync="getSyncData"></Schedule>
          </ElTabPane>
          <ElTabPane :label="$t('task_monitor_run_log')" name="log" lazy>
            <Log :id="task.id"></Log>
          </ElTabPane>
          <ElTabPane :label="$t('task_monitor_mining_task')" name="sharedMing" lazy>
            <ShareMining :id="task.id"></ShareMining>
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
  </div>
</template>

<script>
import Info from './Info'
import Schedule from './Schedule'
import ShareMining from './ShareMining'
import Log from '@/components/logs/Index'
import dayjs from 'dayjs'

export default {
  name: 'Statistics',
  components: { Info, Schedule, Log, ShareMining },
  data() {
    return {
      timer: null,
      task: {},
      selectFlow: 'flow_', // 选中节点
      dataOverviewAll: 'flow',
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('dataFlow.dataScreening'),
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
          title: this.$t('dataFlow.inputOutput'),
          tip: this.$t('dataFlow.throughputpop'),
          unit: 'QPS',
          class: 'putColor',
          loading: false
        },
        body: null,
        input: 0,
        output: 0
      },
      activeTab: 'schedule',
      syncData: {}
    }
  },
  created() {
    this.$ws.on('watch', this.taskChange)
    this.$ws.send({
      type: 'watch',
      collection: 'DataFlows',
      filter: {
        where: { 'fullDocument._id': { $in: [this.$route.params.subId] } }, //查询条件
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
      let id = this.$route.params?.subId
      if (!hiddenLoading) {
        this.loading = true
      }
      this.$api('SubTask')
        .get([id])
        .then(res => {
          if (JSON.stringify(this.formatTask(res.data)) === JSON.stringify(this.task)) {
            return
          }
          this.task = this.formatTask(res.data)
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
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.formatTime(data.startTime)
      data.endTimeFmt = this.formatTime(data.finishTime)
      data.cdcTimeFmt = this.formatTime(cdcTime)
      return data
    },
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    infoRemoteMethod(params) {
      return this.$api('Measurement')
        .query(params)
        .then(res => {
          return res.data
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
  overflow-y: auto;
  .statistics-container-box {
    // overflow-y: auto;
    ::v-deep {
      .scroller {
        min-height: 50px;
        overflow-y: auto;
      }
    }
  }
}
.card-box {
  background-color: map-get($bgColor, white);
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  ::v-deep {
    .table-list {
      height: 300px;
    }
  }
}
.card-box__info {
  border-bottom: 1px solid #e4e7ed;
}
</style>
