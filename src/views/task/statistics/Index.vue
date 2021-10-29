<template>
  <div class="statistics-container flex flex-column h-100 font-color-sub">
    <Info :task="task" class="card-box"></Info>
    <div class="card-box mt-6 p-6 flex-1">
      <ElTabs v-model="activeTab" class="flex flex-column flex-1 overflow-hidden h-100">
        <ElTabPane label="任务进度" name="schedule" class="h-100">
          <Schedule :task="task"></Schedule>
        </ElTabPane>
        <ElTabPane label="运行日志" name="log" class="h-100" lazy>
          <Log :id="task.id"></Log>
        </ElTabPane>
        <ElTabPane label="连接" name="connect" class="h-100" lazy>
          <Connection :task="task" @change="loadTask"></Connection>
        </ElTabPane>
        <ElTabPane label="历史运行记录" name="history" class="h-100" lazy>历史运行记录</ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<script>
import Info from './Info'
import Schedule from './Schedule'
import Log from './Log'
import Connection from './Connection'

export default {
  name: 'Index',
  components: { Info, Schedule, Log, Connection },
  data() {
    return {
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
      activeTab: 'schedule'
    }
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.$ws.off('dataFlowInsight')
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
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatTask(data) {
      data.totalOutput = data.stats?.output?.rows || 0
      data.totalInput = data.stats?.input?.rows || 0
      data.creator = data.creator || data.createUser || data.username || data.user?.username || '-'
      data.typeText = data.mappingTemplate === 'cluster-clone' ? '迁移任务' : '同步任务'
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.formatTime(data.startTime)
      data.endTimeFmt = data.startTime ? this.formatTime(data.finishTime) : '-'
      data.cdcTimeFmt = this.formatTime(cdcTime)
      return data
    },
    formatTime(time) {
      return time ? this.$moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    getOverview(data) {
      let overview = data.statsData.data_overview || {}
      if (JSON.stringify(overview) === '{}') {
        return
      }
      this.overviewObj.body = overview
    },
    getThroughputOpt(data) {
      let timeList = [],
        inputCountList = [],
        outputCountList = [],
        timeType = data.granularity['throughput']?.split('_')[1]
      data.statsData.throughput.forEach(item => {
        timeList.push(this.formatTime(item.t, timeType))
        inputCountList.push(item.inputCount)
        outputCountList.push(item.outputCount)
      })

      this.throughputObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 50
        },
        grid: {
          left: '5%',
          right: '10%',
          bottom: '3%',
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc'
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#409EFF',
              width: 1 // 这里是为了突出显示加上的
            }
          },
          data: timeList
        },
        yAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: '#409EFF',
              width: 1
            }
          },
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            }
          }
        },
        series: [
          {
            name: this.$t('dataFlow.input'),
            type: 'line',
            smooth: true,
            data: inputCountList,
            itemStyle: {
              color: '#2ba7c3'
            },
            lineStyle: {
              color: '#2ba7c3'
            },
            areaStyle: {
              color: '#2ba7c3'
            }
          },
          {
            name: this.$t('dataFlow.output'),
            type: 'line',
            smooth: true,
            data: outputCountList,
            itemStyle: {
              color: '#61a569'
            },
            lineStyle: {
              color: '#8cd5c2'
            },
            areaStyle: {
              color: '#8cd5c2'
            }
          }
        ]
      }
      this.throughputObj.input = inputCountList[inputCountList.length - 1] || 0
      this.throughputObj.output = outputCountList[outputCountList.length - 1] || 0
    }
  }
}
</script>

<style lang="scss" scoped>
.card-box {
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}
</style>
