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
        <div class="chart-box__content p-4">
          <EventChart :samples="eventDataAll"></EventChart>
        </div>
      </div>
      <div v-if="isSource" class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">同步状态</div>
        <div class="chart-box__content p-4"></div>
      </div>
      <div v-else-if="isTarget" class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">连接状态</div>
        <div class="chart-box__content p-4"></div>
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
            title="QPS（Q/S）"
            style="height: 200px"
          ></LineChart>
        </div>
      </div>
      <div class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">处理耗时</div>
        <div class="chart-box__content p-4">
          <LineChart :data="delayData" title="增量延迟（ms）" :color="['#2C65FF']" style="height: 200px"></LineChart>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import EventChart from './EventChart'
import LineChart from './LineChart'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'

function getRandom(num = 1) {
  return Math.ceil(Math.random() * 100 * num)
}

export default {
  name: 'NodeDetailDialog',

  components: { EventChart, LineChart },

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
      quota: {}
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

    eventDataAll() {
      return this.quota.samples?.[0] || {}
    },

    // qps
    qpsData() {
      const res = this.quota.samples?.[1]
      if (!res) {
        return {
          x: [],
          name: [],
          value: []
        }
      }
      return {
        x: res.time,
        name: ['输入', '输出'],
        value: [res.inputQPS, res.outputQPS]
      }
    },

    // 增量延迟
    delayData() {
      const res = this.quota.samples?.[2]
      if (!res) {
        return {
          x: [],
          value: []
        }
      }
      return {
        x: res.time,
        value: res.value
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
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
    },

    nodeId(v) {
      this.selected = v
      this.init()
    }
  },

  methods: {
    init() {
      this.loadQuotaData()
    },

    loadQuotaData() {
      let res = {
        samples: [
          // 任务事件统计（条）
          {
            input: {
              inserted: getRandom(100),
              updated: getRandom(100),
              deleted: getRandom(100),
              ddl: getRandom(100),
              other: getRandom(100),
              total: getRandom(100)
            },
            output: {
              inserted: getRandom(100),
              updated: getRandom(100),
              deleted: getRandom(100),
              ddl: getRandom(100),
              other: getRandom(100),
              total: getRandom(100)
            }
          },
          // qps
          {
            inputQPS: [
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom()
            ],
            outputQPS: [
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom()
            ],
            time: [
              1657707577896, 1657707582896, 1657707587896, 1657707592896, 1657707597896, 1657707602896, 1657707607896,
              1657707612896, 1657707617896, 1657707622896, 1657707627896, 1657707632896, 1657707637896, 1657707642896,
              1657707647896, 1657707652896, 1657707657896, 1657707662896, 1657707667896, 1657707672896
            ]
          },
          // 增量延迟
          {
            value: [
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom(),
              getRandom()
            ],
            time: [
              1657707577896, 1657707582896, 1657707587896, 1657707592896, 1657707597896, 1657707602896, 1657707607896,
              1657707612896, 1657707617896, 1657707622896, 1657707627896, 1657707632896, 1657707637896, 1657707642896,
              1657707647896, 1657707652896, 1657707657896, 1657707662896, 1657707667896, 1657707672896
            ]
          }
        ],
        statistics: [
          {
            deletedTotal: getRandom(),
            initialTime: 1657707577896,
            cdcTime: 1657707577896,
            initialWrite: getRandom(),
            inputTotal: getRandom(),
            insertedTotal: getRandom(),
            outputTotal: getRandom(),
            replicateLag: getRandom(),
            updatedTotal: getRandom(),
            // 表结构同步
            structure: {
              wait: getRandom(),
              noCreate: getRandom(),
              finished: getRandom(),
              error: getRandom()
            },
            // 表数据状态
            data: {
              wait: getRandom(),
              running: getRandom(),
              finished: getRandom(),
              error: getRandom()
            }
          }
        ]
      }
      res.samples[1].time = res.samples[1].time.map(t => this.formatTime(t))
      res.samples[2].time = res.samples[2].time.map(t => this.formatTime(t))
      res.statistics[0].initialTime = this.formatTime(res.statistics[0].initialTime)
      res.statistics[0].cdcTime = this.formatTime(res.statistics[0].cdcTime)
      this.quota = res
    },

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss') {
      return dayjs(date).format(type)
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-box {
  width: 355px;
  height: 266px;
  border: 1px solid #c9cdd4;
  &.disabled {
    border: none;
  }
}
.chart-box__title {
  //color: #333c4a;
  background: #fafafa;
}
.event-chart {
  ::v-deep {
    .total-line {
      margin-bottom: 24px !important;
    }
  }
}
</style>
