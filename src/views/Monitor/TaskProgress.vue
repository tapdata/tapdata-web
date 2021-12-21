<template>
  <div class="task-progress font-color-main">
    <div class="task-overview flex">
      <div class="flex-shrink-0" style="width: 300px">
        <!-- 非增量 -->
        <div v-if="task && task.setting.sync_type !== 'cdc'" style="height: 310px">
          <div>
            <span class="dots">{{ $t('task_monitor_full_sync') }}</span>
          </div>
          <div>
            <div class="progress-box flex justify-content-center align-items-center position-relative">
              <el-progress
                type="circle"
                color="rgba(44, 101, 255, 1)"
                :percentage="progressBar"
                :show-text="false"
                :width="120"
              ></el-progress>
              <div class="progress-box__value flex justify-content-center align-items-center">{{ progressBar }}%</div>
            </div>
          </div>
          <div class="py-6 text-center">
            {{ $t('task_monitor_full_completion_time') }}：<span>{{ completeTime }}</span>
          </div>
        </div>
        <!-- 非全量 -->
        <div v-if="task && task.setting.sync_type !== 'initial_sync'">
          <div>
            <span class="dots">{{ $t('task_monitor_cdc_overview') }}</span>
          </div>
          <div class="pb-6">
            <div class="progress-box flex justify-content-center align-items-center position-relative">
              <el-progress
                type="circle"
                color="rgba(44, 101, 255, 1)"
                :percentage="100"
                :show-text="false"
                :width="120"
              ></el-progress>
              <div class="progress-box__value flex flex-column justify-content-center align-items-center">
                <div class="fs-5">{{ replicateObj.currentStatus || $t('task_monitor_delay') }}</div>
                <div class="mt-2" v-if="!replicateObj.currentStatus">{{ replicateObj.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="task-overview__detail flex-fill pl-4">
        <!-- 非增量 -->
        <div v-if="task && task.setting.sync_type !== 'cdc'" style="height: 310px">
          <div class="mb-10 fs-7 dots">{{ $t('task_monitor_progress_details') }}</div>
          <div v-for="(item, index) in initialList" :key="index" class="initial-box">
            <span v-if="item.label" class="initial-box__title font-color-sub">{{ item.label }}：</span>
            <span class="initial-box__value" :class="{ 'font-color-sub': !!item.value }">{{
              item.value || overviewStats[item.key]
            }}</span>
          </div>
        </div>
        <!-- 非全量 -->
        <div v-if="task && task.setting.sync_type !== 'initial_sync'">
          <div class="mb-10 fs-7 dots">{{ $t('task_monitor_cdc_details') }}</div>
          <el-table :data="cdcLastTimes">
            <el-table-column :label="$t('task_monitor_source_library')" prop="sourceConnectionName"></el-table-column>
            <el-table-column :label="$t('task_monitor_time')" prop="cdcTime">
              <template slot-scope="scope">{{ $moment(scope.row.cdcTime).format('YYYY-MM-DD HH:mm:ss') }}</template>
            </el-table-column>
            <el-table-column :label="$t('task_monitor_target_library')" prop="targetConnectionName"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="task-chart">
      <div class="task-chart__title fs-7">{{ $t('task_monitor_status_statistice') }}</div>
      <div class="task-chart__body flex flex-wrap justify-content-between pr-3">
        <div class="task-chart__item">
          <EchartHeader :data="overviewObj.title"></EchartHeader>
          <VEchart :option="overviewObj.body" class="v-echart"></VEchart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="throughputObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(72, 182, 226, 0.3); color: #409eff"
              >{{ $t('dataFlow.input') }}:<span class="ml-1">{{ throughputObj.input }}</span></span
            >
            <span style="background-color: rgba(98, 165, 105, 0.3); color: #62a569"
              >{{ $t('dataFlow.output') }}:<span class="ml-1">{{ throughputObj.output }}</span></span
            >
          </div>
          <VEchart :option="throughputObj.body" class="v-echart"></VEchart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="transfObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(251, 142, 0, 0.3); color: #fb8e00"
              >{{ $t('dataFlow.current') }}:<span class="ml-1">{{ transfObj.value }}</span></span
            >
          </div>
          <VEchart :option="transfObj.body" class="v-echart"></VEchart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="replicateObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(7245, 108, 108, 0.3); color: #f56c6c"
              >{{ $t('dataFlow.current') }}:<span class="ml-1">{{ replicateObj.value }}</span></span
            >
          </div>
          <VEchart :option="replicateObj.body" class="v-echart"></VEchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VEchart from '@/components/VEchart'
import EchartHeader from './EchartHeader'
let lastMsg = ''
export default {
  name: 'TaskProgress',
  components: { VEchart, EchartHeader },
  props: {
    task: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      progressBar: 0,
      completeTime: '',
      overviewStats: {},
      initialList: [
        {
          key: 'sourceTableNum',
          label: this.$t('task_monitor_migrate_table_number')
        },
        {
          key: 'sourceRowNum',
          label: this.$t('task_monitor_migrate_table_rows')
        },
        {
          key: 'waitingForSyecTableNums',
          label: this.$t('task_monitor_migrate_table_number_completed')
        },
        {
          key: 'targatRowNum',
          label: this.$t('task_monitor_migrate_table_rows_completed')
        },
        {
          // key: '',
          // label: '*目前任务进度查看仅支持： MySQL、Oracle、SQL Server、PostgreSQL和MongoDB',
          value: this.$t('task_monitor_migrate_tip')
        }
      ],
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('dataFlow.dataScreening'),
          loading: false
        },
        body: {}
      },
      // 输入输出统计
      throughputObj: {
        title: {
          key: 'throughput',
          statsType: 'throughput',
          time: 'minute',
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
      // 传输耗时
      transfObj: {
        title: {
          key: 'transf',
          statsType: 'trans_time',
          time: 'minute',
          title: this.$t('dataFlow.transf'),
          tip: this.$t('dataFlow.transtime_pop'),
          unit: this.$t('task_monitor_unit_row'),
          class: 'transfColor',
          loading: false
        },
        body: null,
        value: 0
      },
      // 数据同步差距
      replicateObj: {
        title: {
          key: 'replicate',
          statsType: 'repl_lag',
          time: 'minute',
          title: this.$t('dataFlow.replicate'),
          tip: this.$t('dataFlow.replicate_pop'),
          unit: this.$t('task_monitor_unit_second'),
          class: 'transfColor',
          hideSecond: true,
          loading: false
        },
        body: null,
        value: 0, // 当前延迟
        currentStatus: this.$t('task_monitor_not_start')
      },
      selectFlow: 'flow_', // 选中节点
      stageId: 'all',
      dataOverviewAll: 'flow'
    }
  },
  computed: {
    cdcLastTimes() {
      return this.task?.cdcLastTimes || []
    }
  },
  watch: {
    'task.stats': {
      deep: true,
      handler(v) {
        v && this.init(v)
      }
    }
  },
  mounted() {
    this.$once('onceLoadHttp', () => {
      this.loadHttp()
    })
  },
  destroyed() {
    this.$ws.off('dataFlowInsight')
  },
  methods: {
    init() {
      this.loadInfo()
      this.$emit('onceLoadHttp')
      this.loadWS()
      this.sendMsg()
    },
    loadInfo() {
      let overview = {}
      let waitingForSyecTableNums = 0
      let completeTime = ''
      let data = this.task
      this.progressBar = 0
      if (data?.stats?.overview) {
        overview = JSON.parse(JSON.stringify(data.stats.overview))

        this.replicateObj.currentStatus = !overview?.status ? this.$t('task_monitor_not_start') : ''

        if (overview.waitingForSyecTableNums !== undefined) {
          waitingForSyecTableNums = overview.sourceTableNum - overview.waitingForSyecTableNums
        } else {
          waitingForSyecTableNums = 0
        }
        overview.waitingForSyecTableNums = waitingForSyecTableNums

        let num = (overview.targatRowNum / overview.sourceRowNum) * 100
        if (num > 100) {
          num = 100
        }
        this.progressBar = num ? num.toFixed(2) * 1 : 0

        let now = new Date().getTime()
        let startTime = new Date(data.runningTime).getTime(),
          runningTime = now - startTime,
          speed = overview.targatRowNum / runningTime
        // lefts = Math.floor((spendTime / 1000) % 60) //计算秒数

        let time = (overview.sourceRowNum - overview.targatRowNum) / speed / 1000

        let r = ''
        if (time) {
          let s = time,
            m = 0,
            h = 0,
            d = 0
          if (s > 60) {
            m = parseInt(s / 60)
            s = parseInt(s % 60)
            if (m > 60) {
              h = parseInt(m / 60)
              m = parseInt(m % 60)
              if (h > 24) {
                d = parseInt(h / 24)
                h = parseInt(h % 24)
              }
            }
          }
          if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
            r = 1 + this.$t('taskProgress.m')
          }
          // r = parseInt(s) + this.$t('timeToLive.s')
          if (m > 0) {
            r = parseInt(m) + this.$t('taskProgress.m')
          }
          if (h > 0) {
            r = parseInt(h) + this.$t('taskProgress.h') + r
          }
          if (d > 0) {
            r = parseInt(d) + this.$t('taskProgress.d') + r
          }
          // 全量未完成 停止任务
          if (['paused', 'error'].includes(data.status)) {
            completeTime = this.$t('taskProgress.taskStopped') // 任务已停止
          } else {
            completeTime = r
          }
        }

        if (this.progressBar === 100) {
          overview.currentStatus = this.$t('taskProgress.progress') // 进行中
          completeTime = this.$t('taskProgress.fullyCompleted') // 全量已完成
        }
        // 任务暂停、错误  增量状态都为停止
        if (completeTime === this.$t('taskProgress.fullyCompleted')) {
          if (['paused', 'error'].includes(data.status)) {
            overview.currentStatus = this.$t('taskProgress.stopped') // 已停止
          }
        }
      }

      this.completeTime = completeTime

      this.overviewStats = overview
    },
    // http请求
    loadHttp() {
      let arr = ['overviewObj', 'throughputObj', 'transfObj', 'replicateObj']
      arr.forEach(el => {
        let item = this[el]?.title
        let params = {
          statsType: item.statsType,
          granularity: item.time ? 'flow_' + item.time : 'flow'
        }
        this.loadData(params, item)
      })
    },
    formatTime(time, type) {
      let result
      switch (type) {
        case 'second':
          result = time.substring(11, 19)
          break
        case 'minute':
          result = time.substring(11, 16)
          break
        case 'hour':
          result = time.substring(11, 16)
          break
        case 'day':
          result = time.substring(6, 10)
      }
      return result
    },
    getOverview(data) {
      let overview = data.statsData.data_overview
      let seriesData = [
        overview.outputCount,
        overview.inputCount,
        overview.insertCount,
        overview.updateCount,
        overview.deleteCount
      ]
      this.overviewObj.body = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          show: true,
          axisLine: {
            show: false,
            lineStyle: {
              color: '#666',
              width: 0
            }
          },
          axisLabel: {
            margin: 30
          },
          axisTick: {
            show: false
          },
          data: [
            this.$t('dataFlow.totalOutput'),
            this.$t('dataFlow.totalInput'),
            this.$t('dataFlow.totalInsert'),
            this.$t('dataFlow.totalUpdate'),
            this.$t('dataFlow.totalDelete')
          ],
          axisPointer: {
            type: 'shadow'
          },
          nameTextStyle: {
            verticalAlign: 'bottom',
            color: '#F00'
          }
        },
        yAxis: {
          show: false
        },
        series: [
          {
            type: 'bar',
            data: seriesData,
            barWidth: '50%',
            barGap: '-100%',
            itemStyle: {
              normal: {
                color: function (params) {
                  let colorList = ['#7ba75d', '#409EFF', '#d9742c', '#e6b451', '#e06c6c']
                  return colorList[params.dataIndex]
                },
                label: {
                  show: true,
                  position: 'bottom',
                  distance: 10,
                  formatter: function (value) {
                    if (value.data / (1000 * 1000 * 1000) > 1) {
                      return (value.data / (1000 * 1000 * 1000)).toFixed(1) + ' T'
                    } else if (value.data / (1000 * 1000) > 1) {
                      return (value.data / (1000 * 1000)).toFixed(1) + ' M'
                    } else if (value.data / 1000 > 1) {
                      return (value.data / 1000).toFixed(1) + ' K'
                    }
                  }
                }
              }
            }
          }
        ]
      }
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
          left: '10%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#409EFF',
              width: 1 // 这里是为了突出显示加上的
            }
          },
          boundaryGap: false,
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
              color: '#8cd5c2' // 改变折线点的颜色
            }
          }
        ]
      }
      this.throughputObj.input = inputCountList[inputCountList.length - 1] || 0
      this.throughputObj.output = outputCountList[outputCountList.length - 1] || 0
    },
    getTransfOpt(data) {
      let timeList = [],
        dataList = [],
        timeType = data.granularity['trans_time']?.split('_')[1]
      data.statsData.trans_time.forEach(item => {
        timeList.push(this.formatTime(item.t, timeType)) // 时间
        dataList.push(item.d)
      })
      this.transfObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 50
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#fb8e00',
              width: 1
            }
          },
          boundaryGap: false,
          data: timeList
        },
        yAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fb8e00',
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
            type: 'line',
            smooth: true,
            data: dataList,
            itemStyle: {
              color: '#fb8e00'
            },
            lineStyle: {
              color: '#fb8e00'
            }
          }
        ]
      }
      this.transfObj.value = dataList[dataList.length - 1] || 0
    },
    getReplicateOpt(data) {
      let timeList = [],
        dataList = [],
        timeType = data.granularity['repl_lag']?.split('_')[1]
      data.statsData.repl_lag.forEach(item => {
        timeList.push(this.formatTime(item.t, timeType)) // 时间
        dataList.push(item.d)
      })
      this.replicateObj.value = this.formatLag(dataList[dataList.length - 1] || 0)
      this.replicateObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 50
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#f56c6c'
            }
          },
          boundaryGap: false,
          data: timeList
        },
        yAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: '#f56c6c'
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
            type: 'line',
            data: dataList,
            smooth: true,
            itemStyle: {
              color: '#f56c6c'
            },
            lineStyle: {
              color: '#f56c6c'
            }
          }
        ]
      }
    },
    formatLag(data = 0) {
      let result = data + 's'
      /* eslint-disable */
      let s = 0, //
        m = 0,
        h = 0,
        d = 0
      if (data > 60) {
        m = parseInt(data / 60)
        s = parseInt(data % 60)
        result = m + 'm'
        if (m > 60) {
          h = parseInt(m / 60)
          m = parseInt(m % 60)
          result = h + 'h'
          if (h > 24) {
            d = parseInt(h / 24)
            h = parseInt(h % 24)
            result = d + 'd'
          }
        }
      }
      /* eslint-enable */
      return result
    },
    loadWS() {
      this.$ws.on('dataFlowInsight', data => {
        this.getOverview(data) // 事件统计
        this.getThroughputOpt(data) // 输入输出统计
        this.getTransfOpt(data) // 传输耗时
        this.getReplicateOpt(data) // 数据同步差距
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
          trans_time: this.selectFlow + this.transfObj.title.time,
          repl_lag: this.selectFlow + this.replicateObj.title.time,
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
    // 通过api获取数据
    loadData(params, item) {
      params['dataFlowId'] = this.task.id
      if (this.stageId !== 'all') {
        params['stageId'] = this.stageId
      }
      item.loading = true
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
            case 'trans_time':
              this.getTransfOpt(data) // 传输耗时
              break
            case 'repl_lag':
              this.getReplicateOpt(data) // 数据同步差距
              break
          }
        })
        .finally(() => {
          item.loading = false
        })
    },
    changeHeaderFnc(timeType, item) {
      item.time = timeType
      this.sendMsg()
      // http请求
      // let params = {
      //   statsType: item.statsType,
      //   granularity: 'flow_' + timeType
      // }
      // this.loadData(params, item)
    }
  }
}
</script>

<style lang="scss" scoped>
.task-progress {
  padding: 24px 0;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.task-overview {
  .el-divider {
    margin: 12px 24px;
    height: 335px;
  }
  .task-overview__detail {
    border-left: 1px solid rgba(0, 0, 0, 0.07);
  }
}
.dots {
  position: relative;
  &:before {
    margin-right: 8px;
    content: ' ';
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: rgba(0, 0, 0, 0.65);
    border-radius: 50%;
  }
}
.progress-box {
  margin: 24px auto 0;
  padding: 24px;
  width: 150px;
  height: 150px;
  background: rgba(216, 216, 216, 0.15);
  border-radius: 50%;
  box-sizing: border-box;
}
.progress-box__value {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 30px;
}
.initial-box {
  margin-bottom: 24px;
}
.task-chart__item {
  position: relative;
  width: 49%;
  height: 300px;
  margin-top: 6px;
  margin-bottom: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  box-shadow: 1.414px 1.414px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  .v-echart {
    height: 250px;
  }

  .floatLayer {
    position: absolute;
    left: 20px;
    top: 50px;

    > span {
      display: inline-block;
      min-width: 60px;
      margin-bottom: 10px;
      padding: 3px 6px;
      font-size: 12px;
      background: #f00;
    }
  }
}
</style>
