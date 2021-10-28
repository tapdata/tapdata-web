<template>
  <div class="statistics-container flex flex-column h-100 font-color-sub">
    <div class="card-box p-6">
      <div class="flex justify-content-between">
        <div class="info-line">
          <span class="mr-4 fs-6 font-color-main">{{ task.name }}</span>
          <StatusTag
            type="text"
            target="task"
            :status="task.isFinished ? 'finished' : task.status || 'running'"
            only-img
          ></StatusTag>
          <span class="ml-6 font-color-sub">
            创建人：<span>{{ task.creator }}</span>
          </span>
          <span class="ml-6 font-color-sub">
            开始时间：<span>{{ task.last_updated }}</span>
          </span>
        </div>
        <div class="operation">
          <VButton type="primary">启动</VButton>
          <VButton type="danger">停止</VButton>
          <VButton>编辑</VButton>
        </div>
      </div>
      <div class="flex justify-content-between mt-6">
        <div class="p-6" style="background-color: #fafafa; min-width: 240px">
          <div class="mb-2">总输入</div>
          <div class="mb-4 fs-4 font-color-main">{{ overviewObj.body.inputCount }}</div>
          <div class="mb-2">总输出</div>
          <div class="mb-6 fs-4 font-color-main">{{ overviewObj.body.outputCount }}</div>
          <div class="flex justify-content-between">
            <div>
              <div class="mb-3">总插入</div>
              <div class="fs-6 font-color-main">{{ overviewObj.body.insertCount }}</div>
            </div>
            <div>
              <div class="mb-3">总更新</div>
              <div class="fs-6 font-color-main">{{ overviewObj.body.updateCount }}</div>
            </div>
            <div>
              <div class="mb-3">总删除</div>
              <div class="fs-6 font-color-main">{{ overviewObj.body.deleteCount }}</div>
            </div>
          </div>
        </div>
        <div class="flex-1" style="min-height: 250px">
          <div class="flex justify-content-between" style="padding-left: 5%">
            <ElRadioGroup v-model="throughputObj.title.time" size="mini" @change="changeUtil">
              <ElRadioButton label="second">{{ $t('dataFlow.second') }}</ElRadioButton>
              <ElRadioButton label="minute">{{ $t('dataFlow.min') }}</ElRadioButton>
              <ElRadioButton label="hour">{{ $t('dataFlow.hour') }}</ElRadioButton>
              <ElRadioButton label="day">{{ $t('dataFlow.day') }}</ElRadioButton>
            </ElRadioGroup>
            <div
              class="px-2"
              style="line-height: 27px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box"
            >
              QPS
            </div>
          </div>
          <VEchart :option="throughputObj.body" class="v-echart" style="height: 100%"></VEchart>
        </div>
      </div>
    </div>
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
import StatusTag from '@/components/StatusTag'
import VEchart from '@/components/VEchart'
import Schedule from './Schedule'
import Log from './Log'
import Connection from './Connection'

let lastMsg
export default {
  name: 'Index',
  components: { StatusTag, VEchart, Schedule, Log, Connection },
  data() {
    return {
      task: {},
      chart: {},
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
      this.loadWS()
      this.sendMsg()
    },
    loadWS() {
      this.$ws.on('dataFlowInsight', data => {
        this.getOverview(data) // 事件统计
        this.getThroughputOpt(data) // 输入输出统计
      })
    },
    // 获取节点类型（是否是全部节点）
    sendMsg() {
      if (this.stageId === 'all') {
        this.selectFlow = 'flow_'
      } else {
        this.selectFlow = 'stage_'
      }

      let msg = {
        type: 'dataFlowInsight',
        granularity: {
          throughput: this.selectFlow + this.throughputObj.title.time,
          trans_time: this.selectFlow + 'minute',
          repl_lag: this.selectFlow + 'minute',
          data_overview: this.dataOverviewAll
        },
        dataFlowId: this.task.id
      }
      if (this.stageId !== 'all') {
        msg['stageId'] = this.stageId
      }
      let msgStr = JSON.stringify(msg)
      if (lastMsg !== msgStr) {
        this.$ws.ready(() => {
          lastMsg = msgStr
          this.$ws.send(msg)
        })
      }
    },
    loadTask() {
      let id = this.$route.params?.id
      this.loading = true
      this.$axios
        .get('tm/api/DataFlows/' + id)
        .then(data => {
          this.task = this.formatTask(data)
          // let params = {
          //   statsType: 'throughput',
          //   granularity: 'flow_' + this.throughputObj.title.time
          // }
          // this.loadData(params)
          this.loadHttp()
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadHttp() {
      let arr = ['overviewObj', 'throughputObj']
      arr.forEach(el => {
        let item = this[el]?.title
        let params = {
          statsType: item.statsType,
          granularity: item.time ? 'flow_' + item.time : 'flow'
        }
        this.loadData(params, item)
      })
    },
    // 通过api获取数据
    loadData(params) {
      params['dataFlowId'] = this.task.id
      this.$axios
        .get('tm/api/DataFlowInsights/runtimeMonitor', {
          params: params
        })
        .then(res => {
          let result = res[0] || {}
          let data = {
            statsData: {},
            granularity: {}
          }
          data.statsData[result.statsType] = result.statsData
          data.granularity[result.statsType] = result.granularity
          // 组合成ws返回的格式

          switch (result.statsType) {
            case 'throughput':
              this.getThroughputOpt(data) // 输入输出统计
              break
          }
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
    },
    changeUtil() {
      console.log(arguments)
      this.sendMsg()
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
