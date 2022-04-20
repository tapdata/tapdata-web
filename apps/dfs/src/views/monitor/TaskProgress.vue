<template>
  <div class="task-progress font-color-main">
    <div class="task-overview flex">
      <div class="flex-shrink-0" style="width: 300px">
        <!-- 非增量 -->
        <div v-if="task && task.setting && task.setting.sync_type !== 'cdc'" style="height: 310px">
          <div>
            <span class="dots">{{ $t('task_monitor_full_sync') }}</span>
          </div>
          <div>
            <div class="progress-box flex justify-content-center align-items-center position-relative">
              <ElProgress
                type="circle"
                color="rgba(44, 101, 255, 1)"
                :percentage="progressBar"
                :show-text="false"
                :width="120"
              ></ElProgress>
              <div class="progress-box__value flex justify-content-center align-items-center">{{ progressBar }}%</div>
            </div>
          </div>
          <div class="py-6 text-center">
            {{ $t('task_monitor_full_completion_time') }}{{ $t('field_mapping_field_mapping_dialog_')
            }}<span>{{ completeTime }}</span>
          </div>
        </div>
        <!-- 非全量 -->
        <div v-if="task && task.setting.sync_type !== 'initial_sync'">
          <div>
            <span class="dots">{{ $t('task_monitor_cdc_overview') }}</span>
          </div>
          <div class="pb-6">
            <div class="progress-box flex justify-content-center align-items-center position-relative">
              <ElProgress
                type="circle"
                color="rgba(44, 101, 255, 1)"
                :percentage="100"
                :show-text="false"
                :width="120"
              ></ElProgress>
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
        <div v-if="task && task.setting && task.setting.sync_type !== 'cdc'" style="height: 310px">
          <div class="mb-10 fs-7 dots">{{ $t('task_monitor_progress_details') }}</div>
          <div v-for="(item, index) in initialList" :key="index" class="initial-box">
            <span v-if="item.label" class="initial-box__title font-color-sub"
              >{{ item.label }}{{ $t('field_mapping_field_mapping_dialog_') }}</span
            >
            <span class="initial-box__value" :class="{ 'font-color-sub': !!item.value }">{{
              item.value || overviewStats[item.key]
            }}</span>
          </div>
        </div>
        <!-- 非全量 -->
        <div v-if="task && task.setting.sync_type !== 'initial_sync'">
          <div class="mb-10 fs-7 dots">{{ $t('task_monitor_cdc_details') }}</div>
          <ElTable :data="cdcLastTimes">
            <ElTableColumn :label="$t('task_monitor_source_library')" prop="sourceConnectionName"></ElTableColumn>
            <ElTableColumn :label="$t('task_monitor_time')" prop="cdcTime">
              <template slot-scope="scope">{{ $moment(scope.row.cdcTime).format('YYYY-MM-DD HH:mm:ss') }}</template>
            </ElTableColumn>
            <ElTableColumn :label="$t('task_monitor_target_library')" prop="targetConnectionName"></ElTableColumn>
          </ElTable>
        </div>
      </div>
    </div>
    <div class="task-chart">
      <div class="task-chart__title fs-7">{{ $t('task_monitor_status_statistice') }}</div>
      <div class="task-chart__body flex flex-wrap justify-content-between pr-3">
        <div class="task-chart__item">
          <EchartHeader :data="overviewObj.title"></EchartHeader>
          <Chart v-if="overviewObj.body" :extend="overviewObj.body" class="v-echart"></Chart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="throughputObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(72, 182, 226, 0.3); color: #409eff"
              >{{ $t('dataFlow_input') }}:<span class="ml-1">{{ throughputObj.input }}</span></span
            >
            <span style="background-color: rgba(98, 165, 105, 0.3); color: #62a569"
              >{{ $t('dataFlow_output') }}:<span class="ml-1">{{ throughputObj.output }}</span></span
            >
          </div>
          <Chart v-if="throughputObj.body" :extend="throughputObj.body" class="v-echart"></Chart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="transfObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(251, 142, 0, 0.3); color: #fb8e00"
              >{{ $t('dataFlow_current') }}:<span class="ml-1">{{ transfObj.value }}</span></span
            >
          </div>
          <Chart v-if="transfObj.body" :extend="transfObj.body" class="v-echart"></Chart>
        </div>
        <div class="task-chart__item">
          <EchartHeader :data="replicateObj.title" @change="changeHeaderFnc"></EchartHeader>
          <div class="floatLayer">
            <span style="background-color: rgba(7245, 108, 108, 0.3); color: #f56c6c"
              >{{ $t('dataFlow_current') }}:<span class="ml-1">{{ replicateObj.value }}</span></span
            >
          </div>
          <Chart v-if="replicateObj.body" :extend="replicateObj.body" class="v-echart"></Chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'web-core/components/chart'
import EchartHeader from './EchartHeader'
import { getOverviewData } from '../task/copy/util'
import { formatTimeByTime } from '@/util'

let lastMsg = ''
export default {
  name: 'TaskProgress',
  components: { EchartHeader, Chart },
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
          title: this.$t('dataFlow_dataScreening'),
          classFlex: true,
          loading: false
        },
        body: null
      },
      // 输入输出统计
      throughputObj: {
        title: {
          key: 'throughput',
          statsType: 'throughput',
          time: 'minute',
          title: this.$t('dataFlow_inputOutput'),
          tip: this.$t('dataFlow_throughputpop'),
          unit: 'QPS',
          class: 'putColor',
          classFlex: true,
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
          title: this.$t('dataFlow_transf'),
          tip: this.$t('dataFlow_transtime_pop'),
          unit: this.$t('task_monitor_unit_row'),
          class: 'transfColor',
          classFlex: true,
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
          title: this.$t('dataFlow_replicate'),
          tip: this.$t('dataFlow_replicate_pop'),
          unit: this.$t('task_monitor_unit_second'),
          class: 'transfColor',
          classFlex: 'flex',
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
      handler() {
        this.loadInfo()
      }
    }
  },
  mounted() {
    this.$once('onceLoadHttp', () => {
      this.loadHttp()
    })
    this.init()
  },
  destroyed() {
    this.clearWS()
  },
  methods: {
    init() {
      this.loadInfo()
      this.$emit('onceLoadHttp')
      this.loadWS()
      this.sendMsg()
    },
    loadInfo() {
      let { progress, overview, completeTime, currentStatus } = getOverviewData(this.task)
      this.progressBar = progress
      this.overviewStats = overview
      this.completeTime = completeTime
      this.replicateObj.currentStatus = currentStatus
    },
    // http请求
    loadHttp() {
      let arr = ['overviewObj', 'throughputObj', 'transfObj', 'replicateObj']
      arr.forEach(el => {
        let item = this[el]?.title
        let params = {
          statsType: item.statsType,
          granularity: item.time ? item.time : 'flow'
        }
        this.loadData(params, item)
      })
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
            this.$t('dataFlow_totalOutput'),
            this.$t('dataFlow_totalInput'),
            this.$t('dataFlow_totalInsert'),
            this.$t('dataFlow_totalUpdate'),
            this.$t('dataFlow_totalDelete')
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
        timeList.push(formatTimeByTime(item.t, timeType))
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
            name: this.$t('dataFlow_input'),
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
            name: this.$t('dataFlow_output'),
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
        timeList.push(formatTimeByTime(item.t, timeType)) // 时间
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
        timeList.push(formatTimeByTime(item.t, timeType)) // 时间
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
          if (result.statsType) {
            data.statsData[result.statsType] = result.statsData
            data.granularity[result.statsType] = result.granularity
          }
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
    },
    clearWS() {
      this.$ws.off('dataFlowInsight')
      lastMsg = ''
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
