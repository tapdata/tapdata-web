<template>
  <div class="card-box p-6">
    <div class="flex justify-content-between align-items-center">
      <div class="info-line align-items-center">
        <span class="mr-4 fs-6 font-color-main">{{ task.name }}</span>
        <StatusTag
          type="text"
          target="migrate"
          :status="task.isFinished ? 'finished' : task.status || 'running'"
        ></StatusTag>
        <!--        <span class="ml-6 font-color-sub">-->
        <!--          所属Agent：<span>{{ task.belongAgent }}</span>-->
        <!--        </span>-->
        <span class="ml-6 font-color-sub">
          {{ $t('task_monitor_founder') }}：<span>{{ creator }}</span>
        </span>
        <span class="ml-6 font-color-sub">
          {{ $t('task_info_start_time') }}：<span>{{ formatTime(task.startTime) || '-' }}</span>
        </span>
      </div>
      <div class="operation">
        <VButton type="primary" :disabled="startDisabled" @click="start">
          <VIcon size="12">start-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_start') }}</span>
        </VButton>
        <VButton type="danger" :disabled="stopDisabled" @click="stop">
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_stop') }}</span>
        </VButton>
        <!--        <VButton :disabled="editDisabled" @click="edit">-->
        <!--          <VIcon size="12">edit-fill</VIcon>-->
        <!--          <span class="ml-1">{{ $t('button_edit') }}</span>-->
        <!--        </VButton>-->
      </div>
    </div>
    <div class="flex align-center mt-3">
      <SelectList
        v-if="stagesItems.length > 0"
        v-model="selectedStage"
        :items="stagesItems"
        last-page-text=""
        clearable
        size="mini"
        style="min-width: 240px"
        @change="changeStageFnc"
      ></SelectList>
      <FilterBar v-model="searchParams" :items="filterItems" class="ml-4" hide-refresh @search="search"></FilterBar>
    </div>
    <div class="flex justify-content-between mt-6">
      <div class="p-6 grey-background" style="min-width: 200px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_input') }}</span>
        </div>
        <div class="mb-4 fs-4 font-color-main">{{ overData.inputEvents }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_output') }}</span>
        </div>
        <div class="mb-6 fs-4 font-color-main">{{ overData.outputEvents }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_insert') }}</div>
            <div class="fs-6 font-color-main">{{ overData.insertCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_update') }}</div>
            <div class="fs-6 font-color-main">{{ overData.updateCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_delete') }}</div>
            <div class="fs-6 font-color-main">{{ overData.deleteCount }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-column flex-fill pl-10" style="height: 250px">
        <div class="flex justify-content-between ml-6">
          <ElRadioGroup v-model="throughputObj.title.time" size="mini" @change="changeUtil">
            <ElRadioButton label="second">{{ $t('task_info_s') }}</ElRadioButton>
            <ElRadioButton label="minute">{{ $t('task_info_m') }}</ElRadioButton>
            <ElRadioButton label="hour">{{ $t('task_info_h') }}</ElRadioButton>
            <ElRadioButton label="day">{{ $t('task_info_d') }}</ElRadioButton>
          </ElRadioGroup>
          <div
            class="px-2"
            style="line-height: 27px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box"
          >
            QPS
          </div>
        </div>
        <Chart
          ref="chart"
          type="line"
          :data="lineData"
          :options="lineOptions"
          no-x="second"
          class="type-chart h-100"
        ></Chart>
      </div>
      <div class="ml-3 flex flex-column text-center" style="min-width: 250px">
        <div class="right-box grey-background">
          <div class="fw-bold">全量进度</div>
          <div class="progress-box flex justify-content-center align-items-center position-relative">
            <ElProgress
              type="circle"
              color="rgba(44, 101, 255, 1)"
              :percentage="progressBar"
              :show-text="false"
              :width="50"
            ></ElProgress>
            <div class="flex justify-content-center position-absolute color-primary fw-bolder fs-7">
              {{ progressBar }}%
            </div>
          </div>
          <div v-if="progressBar === 100" class="font-color-sub">
            全量完成时间：{{ formatTime(writeData.initialTime) }}
          </div>
          <div v-else class="font-color-sub">
            {{ $t('task_monitor_full_completion_time') + '：' + (forecast || '计算中') }}
          </div>
        </div>
        <div class="right-box mt-4 grey-background">
          <div class="fw-bold">增量延迟</div>
          <div class="color-primary fw-bolder fs-5">{{ formatMs(writeData.replicateLag) }}</div>
          <div class="font-color-sub">增量所处时间点：{{ formatTime(writeData.cdcTime) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VIcon from '@/components/VIcon'
import SelectList from '@/components/SelectList'
import Chart from 'web-core/components/chart'
import FilterBar from '@/components/filter-bar'
import { formatTime, isEmpty, formatTimeByTime, formatMs } from '@/utils/util'

let lastMsg
export default {
  name: 'Info',
  components: { StatusTag, VIcon, SelectList, Chart, FilterBar },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    },
    remoteMethod: Function
  },
  data() {
    return {
      selectFlow: 'stage_', // 选中节点
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
      yMax: 1,
      statusBtMap: {
        start: {
          edit: true,
          wait_run: true,
          stop: true,
          complete: true
        },
        pause: {
          running: true
        },
        recover: {
          pause: true,
          schedule_failed: true,
          error: true
        },
        stop: {
          running: true
          // pause: true,
          // schedule_failed: true,
          // error: true
        },
        edit: {
          edit: true,
          pause: true
        }
      },
      creator: '',
      selectedStage: '', // 选中的节点
      totalData: {
        total_input: 0,
        total_output: 0,
        total_insert: 0,
        total_update: 0,
        total_delete: 0
      },
      qpsData: {
        total_input_qps: null,
        total_output_qps: null
      },
      lineData: {
        x: [],
        y: [[], []]
      },
      lineOptions: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 4,
          right: 0,
          show: true
        },
        yAxis: [
          {
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          },
          {
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          }
        ],
        grid: {
          left: 0,
          right: 0,
          top: '24px',
          bottom: 0
        },
        series: [
          {
            name: this.$t('task_info_input'),
            lineStyle: {
              color: 'rgba(24, 144, 255, 1)',
              width: 1
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.2)'
            },
            symbol: 'none',
            itemStyle: {
              color: 'rgba(24, 144, 255, 1)'
            }
          },
          {
            name: this.$t('task_info_output'),
            lineStyle: {
              color: 'rgba(118, 205, 238, 1)',
              width: 1
            },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(118, 205, 238, 0.2)'
            },
            itemStyle: {
              color: 'rgba(118, 205, 238, 1)'
            }
          }
        ]
      },
      overData: {
        inputEvents: 0,
        outputEvents: 0,
        insertCount: 0,
        updateCount: 0,
        deleteCount: 0
      },
      writeData: {
        cdcTime: '',
        initialTime: '',
        initialTotal: 0,
        initialWrite: 0,
        replicateLag: 0
      },
      initialData: [], // 缓存最近两次全量的进度数据
      forecast: '', // 预计完成时间
      searchParams: {
        start: '',
        end: ''
      },
      filterItems: [
        {
          label: '统计时间',
          key: 'start,end',
          type: 'datetimerange',
          timeDiff: 60 * 1000
        }
      ]
    }
  },
  computed: {
    startDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['start'][task.status]
    },
    stopDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['stop'][task.status]
    },
    editDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['edit'][task.status]
    },
    stagesItems() {
      let result = this.task?.dag?.nodes?.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      })
      return result || []
    },
    progressBar() {
      const { writeData } = this
      const { initialWrite, initialTotal } = writeData
      if (!initialTotal) {
        return 0
      } else if (initialWrite >= initialTotal) {
        return 100
      }
      return Math.floor((initialWrite * 100) / initialTotal)
    }
  },
  watch: {
    task: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },
  mounted() {
    // this.init()
    this.$once('onceLoadHttp', () => {
      this.loadHttp()
    })
  },
  destroyed() {
    this.$ws.off('dataFlowInsight')
  },
  methods: {
    init() {
      if (this.task.creator) {
        this.creator = this.task.creator
      }
      // this.loadMetrics()
      // this.getTotalMetrics()
      // this.getQpsMetrics()
      this.getMeasurement()
      this.timer = setInterval(() => {
        this.getMeasurement()
      }, 5000)
      // this.getMeasurement()
      // this.loadHttp()
      // this.$emit('onceLoadHttp')
      // this.loadWS()
      // this.sendMsg()
    },
    getTotalMetrics() {
      let arr = ['total_input', 'total_output', 'total_insert', 'total_update', 'total_delete']
      const { selectedStage } = this
      let prefix = 'sub_task_'
      if (selectedStage) {
        prefix = 'sub_task_node_'
      }
      arr.forEach(el => {
        let filter = {
          where: {
            name: prefix + el
          },
          order: 'createTime DESC',
          limit: 1
        }
        if (selectedStage) {
          filter.where['labels.nodeId'] = selectedStage
        } else {
          filter.where['labels.taskId'] = this.task.id
        }
        this.$api('Metrics')
          .get({
            filter: JSON.stringify(filter)
          })
          .then(res => {
            this.totalData[el] = res.data.items?.[0]?.value || 0
          })
      })
    },
    getQpsMetrics() {
      let arr = ['total_input_qps', 'total_output_qps']
      const { selectedStage } = this
      let prefix = 'sub_task_'
      if (selectedStage) {
        prefix = 'sub_task_node_'
      }
      arr.forEach(el => {
        let filter = {
          where: {
            name: prefix + el
          },
          order: 'createTime DESC',
          limit: 20
        }
        if (selectedStage) {
          filter.where['labels.nodeId'] = selectedStage
        } else {
          filter.where['labels.taskId'] = this.task.id
        }
        this.$api('Metrics')
          .get({
            filter: JSON.stringify(filter)
          })
          .then(res => {
            console.log('res', el, res.data)
            // lineData
            if (el === 'total_input_qps') {
              this.lineData.x = res.data.items.map(t => this.$moment(t.ts))
              this.lineData.y[0] = res.data.items.map(t => t.value)
            } else {
              this.lineData.y[1] = res.data.items.map(t => t.value)
            }
            // this.totalData[el] = res.data.items?.[0]?.value || 0
            // this.qpsData[el] = res.data.items?.[0]?.value || 0
          })
      })
    },
    loadMetrics() {
      const { selectedStage } = this
      let filter = {
        where: {
          name: {
            $in: [
              'sub_task_total_input',
              'sub_task_total_output',
              'sub_task_total_insert',
              'sub_task_total_update',
              'sub_task_total_delete',
              'sub_task_qps'
            ]
          },
          'labels.taskId': this.task.id
        }
      }
      if (selectedStage) {
        delete filter.where['labels.taskId']
        filter.where['labels.nodeId'] = selectedStage
        filter.where.name = {
          $in: [
            'sub_task_node_total_input',
            'sub_task_node_total_output',
            'sub_task_node_total_insert',
            'sub_task_node_total_update',
            'sub_task_node_total_delete',
            'sub_task_node_qps'
          ]
        }
      }
      this.$api('Metrics')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          console.log('Metrics', res)
        })
      this.$api('Metrics')
        .get({
          filter: JSON.stringify({
            where: {
              name: 'sub_task_total_input_qps'
            }
          })
        })
        .then(res => {
          console.log('Metrics', res)
        })
      this.$api('Metrics')
        .get({
          filter: JSON.stringify({
            where: {
              name: 'sub_task_total_output_qps'
            }
          })
        })
        .then(res => {
          console.log('Metrics', res)
        })
    },
    getMeasurement() {
      console.log('selectedStage', this.selectedStage)
      let params = {
        samples: [
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: 'agent1', //Agent的ID
              dataFlowId: 'dataFlow1' //DataFlow的ID
            },
            fields: ['inputQps', 'outputQps'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            start: 123123323214, //optional
            end: 123123123123123, //optional
            limit: 10, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: 'minute'
          },
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: 'agent1', //Agent的ID
              dataFlowId: 'dataFlow1' //DataFlow的ID
            },
            fields: ['replicateLag'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            end: 123123123123123, //optional
            limit: 1, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: 'minute'
          },
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: 'agent1', //Agent的ID
              dataflowId: 'afsdfasdf' //DataFlow的ID
            },
            fields: ['outputEvents', 'inputEvents'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            start: 123123323214, //optional
            end: 123123123123123, //optional
            type: 'headAndTail', // headAndTail 返回查询头尾两个值， default是需要指定limit的列表返回， default可以不写
            guanluary: 'minute'
          }
        ],
        statistics: [
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: 'agent1', //Agent的ID
              dataflowId: 'afsdfasdf' //DataFlow的ID
            }
            //"fields" : ["initialTotal", "initialWrite", "outputEvents", "inputEvents", "insertCount", "updateCount", "deleteCount"]
          }
        ]
      }
      if (this.selectedStage) {
        params = {
          samples: [
            {
              tags: {
                measureType: 'node', //指标类型
                customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
                host: 'hostname', //主机
                agentId: 'agent1', //Agent的ID
                dataFlowId: 'dataFlow1', //DataFlow的ID
                type: 'node', //节点类型， node， processor
                nodeId: 'kasldjfkasf' //节点的ID
              },
              //"fields" : ["inputQps", "outputQps", "transmitionTime"],  //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
              start: 123123323214, //optional
              end: 123123123123123, //optional
              limit: 10, //optional, 没有就返回全部， 服务器保护返回最多1000个
              guanluary: 'minute'
            },
            {
              tags: {
                measureType: 'dataflow', //指标类型
                customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
                host: 'hostname', //主机
                agentId: 'agent1', //Agent的ID
                dataFlowId: 'dataFlow1' //DataFlow的ID
              },
              fields: ['replicateLag'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
              start: 123123323214, //optional
              end: 123123123123123, //optional
              limit: 1, //optional， 没有就返回全部， 服务器保护返回最多1000个
              guanluary: 'minute'
            }
          ],
          statistics: [
            {
              tags: {
                userId: 'aaaa',
                key1: 'cdccc',
                key2: 'ccccc'
              },
              fields: ['input', 'output']
            }
          ]
        }
      }
      this.remoteMethod(params).then(data => {
        console.log('getMeasurement', data)
        const { samples } = data
        const countObj = samples?.[2] || {}
        const statistics = data.statistics?.[0] || {}
        const { overData, writeData, initialData, lineData, lineOptions } = this
        // 总输入总输出
        for (let key in overData) {
          overData[key] = countObj[key][1] - countObj[key][0]
        }
        for (let key in writeData) {
          writeData[key] = statistics[key]
        }
        writeData.replicateLag = data.samples?.[1]?.replicateLag?.[0] || 0
        // 全量预计完成时间
        initialData.length >= 2 && initialData.shift()
        initialData.push(Object.assign({}, writeData))
        if (initialData.length >= 2) {
          const getForecastMs = this.getForecastMs(initialData)
          if (getForecastMs) {
            this.forecast = getForecastMs
          }
        }
        // 折线图
        const qpsData = samples[0]
        lineData.x = qpsData.time.map(t => formatTime(t))
        lineData.y[0] = qpsData.inputQps
        lineData.y[1] = qpsData.outputQps
        if (this.selectedStage) {
          // 追加系列
          lineData.y[2] = qpsData.transmitionTime
          lineOptions.series[2] = {
            name: '耗时',
            yAxisIndex: 1,
            lineStyle: {
              color: 'rgba(70, 10, 238, 1)',
              width: 1
            },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(70, 10, 238, 0.2)'
            },
            itemStyle: {
              color: 'rgba(70, 10, 238, 1)'
            }
          }
        } else {
          lineData.y[2] = []
          lineOptions.series[2] = { name: '' }
        }
        console.log('lineData', lineData.y)
      })
    },
    getForecastMs(data) {
      const [start, end] = data
      const num = end.initialWrite - start.initialWrite
      const timeDiff = new Date(end.initialTime).getTime() - new Date(start.initialTime).getTime()
      if (!num) {
        return
      }
      const speed = num / timeDiff
      if (!speed) {
        return
      }
      const result = (end.initialTotal - start.initialWrite) / speed
      return formatMs(result)
    },
    setMoreSer() {},
    loadWS() {
      this.$ws.on('dataFlowInsight', data => {
        this.getOverview(data) // 事件统计
        this.getThroughputOpt(data) // 输入输出统计
      })
    },
    // 获取节点类型（是否是全部节点）
    sendMsg() {
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
      let msgStr = JSON.stringify(msg)
      if (lastMsg !== msgStr) {
        this.$ws.ready(() => {
          lastMsg = msgStr
          this.$ws.send(msg)
        })
      }
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
      this.$api('DataFlowInsights')
        .runtimeMonitor({
          params: params
        })
        .then(res => {
          let result = res.data || {}
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
    getOverview(data) {
      let overview = data.statsData.data_overview || {}
      if (isEmpty(overview)) {
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
        timeList.push(formatTimeByTime(item.t, timeType))
        inputCountList.push(item.inputCount)
        outputCountList.push(item.outputCount)
      })
      // 计算y轴最大值
      const max = Math.max(...[...inputCountList, ...outputCountList])
      if (max > this.yMax) {
        this.yMax = max + Math.ceil(max / 10)
      }
      this.throughputObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 0
        },
        grid: {
          left: 0,
          right: 0,
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
          max: this.yMax,
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
            name: this.$t('task_info_input'),
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
            name: this.$t('task_info_output'),
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
      this.sendMsg()
    },
    formatTime(date) {
      return formatTime(date)
    },
    formatMs(ms) {
      return formatMs(ms)
    },
    start() {
      this.$api('Workers')
        .getAvailableAgent()
        .then(async result => {
          if (!result.data.result || result.data.result.length === 0) {
            this.$message.error(this.$t('dataForm.form.agentMsg'))
            return
          }
          this.startLoading = true
          await this.changeStatus({ status: 'scheduled' })
          this.startLoading = false
        })
    },
    stop() {
      let msgObj = this.getConfirmMessage('stop', this.task.name)
      let message = msgObj.msg
      let title = msgObj.title
      let node = this.task
      if (node.setting && !node.setting.sync_type.includes('cdc')) {
        message = this.$t('task_pause_tip')
        title = this.$t('task_important_reminder')
      }
      if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
        const h = this.$createElement
        let arr = this.$t('task_stop_tip').split('XXX')
        message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
        title = this.$t('task_important_reminder')
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus({ status: 'stopping' })
        }
      })
    },
    edit() {
      console.log('编辑') // eslint-disable-line
      let row = this.task || {}
      this.handleDetail(row.id, 'edit', row.mappingTemplate, row.hasChildren)
    },
    handleDetail(id, type, mappingTemplate, hasChildren) {
      // 子选项 hasChildren 为 true
      if (hasChildren) {
        return
      }
      if (type === 'edit') {
        this.$confirm(
          `<p>${this.$t('task_list_edit_tip')}<span style="color:#409EFF">${this.$t('task_list_edit_tip1')}</span>、` +
            `<span style="color:#409EFF">${this.$t('task_list_node_attr')}</span>、` +
            `<span style="color:#409EFF">${this.$t('task_list_matching_releation')}</span>,` +
            `${this.$t('task_list_edit_submit')}<span style="color:#409EFF">${this.$t(
              'task_list_edit_reset'
            )}</span>${this.$t('task_list_edit_tip3')}</p>`,
          this.$t('task_important_reminder'),
          {
            dangerouslyUseHTMLString: true,
            customClass: 'dataflow-clickTip',
            cancelButtonText: this.$t('button_cancel'),
            confirmButtonText: this.$t('task_list_continue_edit'),
            type: 'warning'
          }
        ).then(resFlag => {
          if (resFlag) {
            this.$router.push({
              path: '/task/' + id
            })
          }
        })
      } else {
        this.$router.push({
          name: 'Monitor',
          params: {
            id: id
          }
        })
      }
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)
    },
    async changeStatus({ status, errorEvents }) {
      let where = {
        _id: {
          in: [this.$route.params.id]
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      return await this.$api('DataFlows')
        .update(where, attributes)
        .then(data => {
          this.responseHandler(data, this.$t('task_operation_successful'))
        })
        .catch(error => {
          if (error?.isException) {
            this.$message.error(this.$t('task_start_failed'))
          }
        })
    },
    responseHandler(data, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('task_not_exist'),
          6: this.$t('task_not_allow_operation'),
          7: this.$t('task_operation_failed'),
          8: this.$t('task_not_allow_operation')
        }
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                this.task.name
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg)
        this.$emit('reload')
      }
    },
    getConfirmMessage(operateStr, name) {
      let map = {
        delete_confirm_title: this.$t('task_delete_confirm_title'),
        delete_confirm_message: this.$t('task_delete_confirm_message'),

        stop_confirm_title: this.$t('task_stop_confirm_title'),
        stop_confirm_message: this.$t('task_stop_confirm_message'),

        force_stop_confirm_title: this.$t('task_force_stop_confirm_title'),
        force_stop_confirm_message: this.$t('task_force_stop_confirm_message'),

        initialize_confirm_title: this.$t('task_initialize_confirm_title'),
        initialize_confirm_message: this.$t('task_initialize_confirm_message')
      }
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      const h = this.$createElement
      let strArr = map[message].split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          name
        ),
        strArr[1]
      ])
      return {
        msg,
        title: map[title]
      }
    },
    changeStageFnc() {
      // this.sendMsg()
      // this.loadMetrics()
      // this.getTotalMetrics()
      console.log('selectedStage', this.selectedStage)
      this.getMeasurement()
    },
    search() {
      console.log('search', this.searchParams)
      this.getMeasurement()
    }
  }
}
</script>

<style lang="scss" scoped>
.grey-background {
  background-color: #fafafa;
}
.right-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  flex: 1;
  height: 50%;
}
</style>
