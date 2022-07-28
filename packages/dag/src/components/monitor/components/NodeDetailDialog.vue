<template>
  <ElDialog
    title="节点详情"
    width="774px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    @close="$emit('input', false)"
  >
    <div class="mb-4">
      <span>节点</span>
      <ElSelect v-model="selected" class="ml-2" @change="init">
        <ElOption v-for="(item, index) in nodeItems" :key="index" :label="item.label" :value="item.value"></ElOption>
      </ElSelect>
    </div>
    <div class="flex justify-content-between">
      <div class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">事件统计</div>
        <div class="chart-box__content px-4 pb-2">
          <EventChart :samples="[eventDataAll, eventDataPeriod]"></EventChart>
        </div>
      </div>
      <div v-if="isSource" class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">同步状态</div>
        <div class="chart-box__content p-4">
          <div class="flex align-items-center justify-content-around text-center">
            <div>
              <div class="font-color-normal fw-bold mb-1">{{ formatTime(sourceData.tcpping, 'HH:mm:ss.ms') }}</div>
              <div>TCP连接耗时</div>
            </div>
            <div>
              <div class="font-color-normal fw-bold mb-1">
                {{ formatTime(sourceData.connectionping, 'HH:mm:ss.ms') }}
              </div>
              <div>协议连接耗时</div>
            </div>
            <div>
              <div class="font-color-normal fw-bold mb-1">
                {{ formatTime(sourceData.currentEventTimestamp, 'YYYY-MM-DD HH:mm:ss') }}
              </div>
              <div>增量时间点</div>
            </div>
          </div>
          <div class="flex justify-content-around pt-7">
            <div>
              <div class="text-center mb-1">全量同步状态</div>
              <Chart :extend="cdcOptions" style="width: 90px; height: 90px"></Chart>
            </div>
            <div>
              <div class="text-center mb-1">增量同步状态</div>
              <Chart ref="chart" :extend="initialOptions" style="width: 90px; height: 90px"></Chart>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="isTarget" class="chart-box rounded-2 flex flex-column">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">连接状态</div>
        <div class="chart-box__content p-4 flex-fill flex align-items-center">
          <div class="flex align-items-center justify-content-around text-center pb-10 w-100">
            <div>
              <div class="font-color-normal fw-bold mb-1">{{ formatTime(targetData.tcpping, 'HH:mm:ss.ms') }}</div>
              <div>TCP连接耗时</div>
            </div>
            <div>
              <div class="font-color-normal fw-bold mb-1">
                {{ formatTime(targetData.connectionping, 'HH:mm:ss.ms') }}
              </div>
              <div>协议连接耗时</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="chart-box border-0"></div>
    </div>
    <div class="my-4">性能指标</div>
    <div class="flex justify-content-between">
      <div class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">QPS</div>
        <div class="chart-box__content p-4">
          <LineChart
            :data="qpsData"
            :color="['#26CF6C', '#2C65FF']"
            :limit="20"
            :time-format="timeFormat"
            title="QPS（Q/S）"
          ></LineChart>
        </div>
      </div>
      <div class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">处理耗时</div>
        <div class="chart-box__content p-4">
          <LineChart
            :data="delayData"
            :limit="20"
            :time-format="timeFormat"
            :color="['#2C65FF']"
            title="增量延迟（ms）"
          ></LineChart>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import EventChart from './EventChart'
import LineChart from './LineChart'
import { Chart } from '@tap/component'
import { mapGetters } from 'vuex'
import { getPieOptions, TIMEFORMATMAP, getTimeGranularity } from '../util'
import dayjs from 'dayjs'
import { measurementApi } from '@tap/api'

function getRandom(num = 100) {
  return Math.ceil(Math.random() * 100 * num)
}

function getRandomArray(count = 20, num = 1) {
  return Array(count)
    .fill()
    .map(() => getRandom(num))
}

function getRandomTimeArray(count = 20, ms = 5000) {
  return Array(count)
    .fill()
    .map((t, i) => Date.now() + i * ms)
}

const TIME_LIST = getRandomTimeArray(100000)
const VALUE_LIST = getRandomArray(100000)

export default {
  name: 'NodeDetailDialog',

  components: { EventChart, LineChart, Chart },

  props: {
    value: {
      type: Boolean,
      default: false
    },

    nodeId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      visible: false,
      selected: '',
      quota: {},
      refresh: false, // 刷新数据还是初始化数据
      count: 0,
      timeFormat: 'HH:mm:ss'
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    nodeItems() {
      return (
        this.allNodes.map(t => {
          return {
            label: t.name,
            value: t.id
          }
        }) || []
      )
    },

    // 任务事件统计（条）-任务累计
    eventDataAll() {
      const data = this.quota.samples?.totalData?.[0]
      if (!data) {
        return
      }
      return this.getInputOutput(data)
    },

    // 任务事件统计（条）-所选周期累计
    eventDataPeriod() {
      const data = this.quota.samples?.barChartData?.[0]
      if (!data) {
        return
      }
      return this.getInputOutput(data)
    },

    // qps
    qpsData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: []
        }
      }
      const { qps, inputQps = [], outputQps = [] } = data
      const { time = [] } = this.quota
      return {
        x: time,
        name: ['输入', '输出'],
        value: [qps || inputQps, qps || outputQps]
      }
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          value: []
        }
      }
      const { time = [] } = this.quota
      return {
        x: time,
        value: data.timeCostAvg
      }
    },

    // 源节点-同步状态
    sourceData() {
      const data = this.quota.samples?.totalData?.[0]
      if (!data) {
        return {}
      }
      const { tcpping, connectionping, currentEventTimestamp } = data
      return {
        tcpping,
        connectionping,
        currentEventTimestamp
      }
    },

    // 目标节点-连接状态
    targetData() {
      return {
        tcpping: 123456,
        connectionping: 128383
      }
    },

    node() {
      return this.allNodes.find(t => this.selected === t.id) || {}
    },

    isSource() {
      const { type, $inputs } = this.node
      return (type === 'database' || type === 'table') && !$inputs.length
    },

    isTarget() {
      const { type, $outputs } = this.node
      return (type === 'database' || type === 'table') && !$outputs.length
    },

    // 全量同步状态
    cdcOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '无需创建',
          key: 'noCreate',
          value: 0,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        },
        {
          name: '错误',
          key: 'error',
          value: 0,
          color: '#EC8181'
        }
      ]
      const { structure } = this.quota.statistics?.[0] || {}
      const values = arr.map(t =>
        Object.assign({}, t, {
          value: structure?.[t.key] ?? 0
        })
      )
      const options = {
        legend: {
          show: false
        },
        series: [
          {
            radius: ['55%', '90%'],
            center: ['50%', '50%']
          }
        ]
      }
      return getPieOptions(values, options)
    },

    // 增量同步状态
    initialOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '进行中',
          key: 'running',
          value: 0,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        },
        {
          name: '错误',
          key: 'error',
          value: 0,
          color: '#EC8181'
        }
      ]
      const { data } = this.quota.statistics?.[0] || {}
      const values = arr.map(t =>
        Object.assign({}, t, {
          value: data?.[t.key] ?? 0
        })
      )
      const options = {
        legend: {
          show: false
        },
        series: [
          {
            radius: ['55%', '90%'],
            center: ['50%', '50%']
          }
        ]
      }
      return getPieOptions(values, options)
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
      if (v) {
        this.init()
      } else {
        this.timer && clearInterval(this.timer)
        this.selected = ''
      }
    }
  },

  methods: {
    init() {
      if (!this.selected) {
        this.selected = this.nodeId
      }
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.loadQuotaData()
      }, 5000)
      this.loadQuotaData()
    },

    getFilter() {
      const taskId = '62e2374c6d695d72fd1bc610' || this.dataflow?.id
      const nodeId = this.selected
      const startAt = 1658992500000
      const endAt = 1658993700000
      let params = {
        startAt,
        endAt,
        samples: {
          // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
          totalData: {
            tags: {
              type: 'node',
              taskId,
              nodeId
            },
            endAt: Date.now(), // 停止时间 || 当前时间
            fields: [
              'insertTotal',
              'updateTotal',
              'deleteTotal',
              'ddlTotal',
              'othersTotal',
              'tcpPing',
              'connectPing',
              'currentEventTimestamp'
            ],
            //
            type: 'instant' // 瞬时值
          },
          // 任务事件统计（条）-所选周期累计
          barChartData: {
            tags: {
              type: 'node',
              taskId,
              nodeId
            },
            fields: [
              'insertTotal',
              'updateTotal',
              'deleteTotal',
              'ddlTotal',
              'othersTotal'
              // 'qps',
              // 'timeCostAvg',
              // 'currentEventTimestamp',
              // 'tcpPing',
              // 'connectPing'
            ],
            type: 'difference'
          },
          // qps + 增量延迟
          lineChartData: {
            tags: {
              type: 'node',
              taskId,
              nodeId
            },
            fields: ['qps', 'inputQps', 'outputQps', 'timeCostAvg'],
            type: 'continuous' // 连续数据
          }
          // dag数据
          // dagData: {
          //   tags: {
          //     type: 'node',
          //     taskId,
          //     nodeId
          //   },
          //   fields: [
          //     'insertTotal',
          //     'updateTotal',
          //     'deleteTotal',
          //     'ddlTotal',
          //     'othersTotal',
          //     'qps',
          //     'timeCostAvg',
          //     'currentEventTimestamp',
          //     'tcpPing',
          //     'connectPing',
          //     'inputTotal',
          //     'outputTotal',
          //     'inputQps',
          //     'outputQps'
          //   ]
          // }
        }
      }
      return params
    },

    loadQuotaData() {
      const { refresh } = this
      if (refresh) {
        this.count = 0
      }
      this.count++
      const { count } = this

      measurementApi
        .queryV2(this.getFilter())
        .then(data => {
          console.log('data', data)
          this.quota = data
          const granularity = getTimeGranularity(data.interval)
          this.timeFormat = TIMEFORMATMAP[granularity]
        })
        .catch(() => {
          let res = {
            time: TIME_LIST.slice(count, count + 60),
            samples: {
              totalData: [
                {
                  insertTotal: getRandom(),
                  updateTotal: getRandom(),
                  deleteTotal: getRandom(),
                  ddlTotal: getRandom(),
                  othersTotal: getRandom()
                }
              ],
              barChartData: [
                {
                  insertTotal: getRandom(),
                  updateTotal: getRandom(),
                  deleteTotal: getRandom(),
                  ddlTotal: getRandom(),
                  othersTotal: getRandom()
                }
              ],
              lineChartData: [
                {
                  inputQps: VALUE_LIST.slice(count, count + 60),
                  outputQps: VALUE_LIST.slice(count + 10, count + 60 + 10),
                  timeCostAvg: VALUE_LIST.slice(count + 10, count + 60 + 10)
                }
              ],
              dagData: [
                {
                  insertTotal: getRandom(),
                  updateTotal: getRandom(),
                  deleteTotal: getRandom(),
                  ddlTotal: getRandom(),
                  othersTotal: getRandom(),
                  qps: getRandom(),
                  timeCostAvg: getRandom(),
                  currentEventTimestamp: getRandom(),
                  tcpPing: getRandom(),
                  connectPing: getRandom(),
                  inputTotal: getRandom(),
                  outputTotal: getRandom(),
                  inputQps: getRandom(),
                  outputQps: getRandom()
                }
              ]
            }
          }
          this.quota = res
        })
    },

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(type) : '-'
    },

    getInputOutput(data) {
      let keyArr = ['insertTotal', 'updateTotal', 'deleteTotal', 'ddlTotal', 'othersTotal']
      let result = {
        input: {},
        output: {}
      }
      keyArr.forEach(el => {
        for (let key in result) {
          result[key][el] = data[el] || 0
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-box {
  width: 355px;
  height: 286px;
  border: 1px solid #c9cdd4;
  &.disabled {
    border: none;
  }
}
.chart-box__title {
  //color: #333c4a;
  height: 38px;
  background: #fafafa;
}
.line-chart {
  height: 200px;
}
.event-chart {
  ::v-deep {
    .event-chart__radio {
      //position: absolute;
      //top: 4px;
      //right: 0;
      //margin-top: 0;
    }
    .total-line {
      margin-bottom: 20px !important;
    }
  }
}
</style>
