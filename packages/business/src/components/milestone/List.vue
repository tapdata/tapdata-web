<template>
  <div class="flex h-100">
    <NodeList
      v-model="activeNodeId"
      title="整体进度"
      class="node-list border-end mr-4"
      @change="handleChange"
    ></NodeList>
    <div v-if="activeNodeId" class="flex-fill overflow-auto">
      <VTable ref="table" row-key="id" :columns="columns" :data="data" height="100%" class="mt-4">
        <template slot="statusLabel" slot-scope="scope">
          <div v-if="scope.row.status === 'ERROR'" :class="scope.row.statusColor">
            <span class="color-danger underline cursor-pointer" @click="handleError(scope.row)">任务出错</span>
          </div>
          <div v-else :class="scope.row.statusColor">{{ scope.row.statusLabel }}</div>
        </template>
      </VTable>
    </div>
    <div v-else class="flex-fill overflow-auto">
      <div v-for="(item, index) in wholeItems" :key="index" class="pro-line flex mt-4">
        <VIcon :class="[item.color, 'mt-1']">{{ item.icon }}</VIcon>
        <div class="ml-4 flex-fill">
          <span class="font-color-normal fw-bold">{{ item.label }}</span>
          <div v-if="item.desc" class="mt-2 color-info">{{ item.desc }}</div>
          <ElProgress
            v-if="typeof item.percentage === 'number'"
            :percentage="item.percentage"
            class="mt-1"
            :show-text="false"
          ></ElProgress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { calcTimeUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'

import NodeList from '../nodes/List'

export default {
  name: 'List',

  props: {
    dataflow: {
      type: Object,
      default: () => {
        return {}
      }
    },
    quota: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  components: { NodeList, VTable },

  data() {
    return {
      activeNodeId: '',
      wholeItems: [],
      columns: [
        {
          label: '关键步骤',
          prop: 'label'
        },
        {
          label: '状态',
          slotName: 'statusLabel'
        },
        {
          label: '开始时间',
          dataType: 'time',
          prop: 'begin'
        },
        {
          label: '结束时间',
          dataType: 'time',
          prop: 'end'
        },
        {
          label: '耗时',
          prop: 'diff'
        }
      ],
      data: []
    }
  },

  computed: {
    milestone() {
      return this.dataflow.attrs?.milestone || {}
    },
    nodeMilestones() {
      const { activeNodeId } = this
      if (!activeNodeId) return {}
      return this.dataflow.attrs?.nodeMilestones?.[activeNodeId] || {}
    },

    totalData() {
      const {
        tableTotal = 0,
        snapshotTableTotal = 0,
        currentSnapshotTableInsertRowTotal = 0,
        currentSnapshotTableRowTotal = 0,
        snapshotRowTotal = 0,
        snapshotInsertRowTotal = 0,
        snapshotDoneAt,
        snapshotStartAt
      } = this.quota.samples?.totalData?.[0] || {}
      return {
        tableTotal,
        snapshotTableTotal,
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal,
        snapshotRowTotal,
        snapshotInsertRowTotal,
        snapshotDoneAt,
        snapshotStartAt
      }
    }
  },

  mounted() {
    this.getWholeItems()
  },

  methods: {
    getWholeItems() {
      const { milestone } = this

      let result = [
        {
          key: 'TASK',
          label: '任务调度'
        },
        {
          key: 'DATA_NODE_INIT',
          label: '数据节点初始化'
        },
        {
          key: 'TABLE_INIT',
          label: '表结构迁移'
        },
        {
          key: 'FULL_SYNC',
          label: '全量数据迁移',
          status: 'finish'
        },
        {
          key: 'STREAM_READ',
          label: '增量数据迁移'
        }
      ]
      const finishOpt = {
        status: 'FINISH',
        desc: '完成',
        icon: 'success',
        color: 'color-success'
      }
      const runningOpt = {
        status: 'RUNNING',
        desc: '进行中',
        icon: 'loading-circle',
        progress: 0,
        color: 'color-primary'
      }
      const waitingOpt = {
        status: 'WAITING',
        desc: '等待中',
        icon: 'wait-fill',
        color: 'color-primary'
      }
      result.forEach(el => {
        if (el.key === 'FULL_SYNC') {
          const { snapshotTableTotal, snapshotDoneAt } = this.totalData
          if (snapshotDoneAt) {
            Object.assign(el, finishOpt)
          } else if (!snapshotTableTotal) {
            Object.assign(el, waitingOpt)
          } else {
            const { progress, time } = this.getDueTimeAndProgress(this.totalData)
            Object.assign(el, runningOpt, {
              progress,
              desc: `进行中，${progress}%已完成，预计剩余时间${calcTimeUnit(time)}`
            })
          }
        } else {
          const item = milestone[el.key]
          if (item?.status) {
            if (item.status === 'FINISH') {
              Object.assign(el, finishOpt)
            } else {
              Object.assign(el, runningOpt, {
                progress: (item.progress / item.totals) * 100
              })
            }
          } else {
            Object.assign(el, waitingOpt)
          }
        }
      })
      const len = result.length
      const finishedLen = result.filter(t => t.status === 'FINISH').length
      const per = (finishedLen / len) * 100
      result.unshift({
        label: '整体进度',
        icon: 'auto-layout',
        percentage: per,
        desc: per === 1 ? '完成' : `${finishedLen}/${len}完成，全量数据同步中`
      })
      this.wholeItems = result
    },

    getNodeData(node) {
      const { nodeMilestones } = this
      const NODE_MAP = {
        source: [
          {
            key: 'NODE',
            label: '连接并验证账号权限'
          },
          {
            key: 'BATCH_READ',
            label: '读取全量数据'
          },
          {
            key: 'STREAM_READ',
            label: '读取增量数据'
          }
        ],
        target: [
          {
            key: 'NODE',
            label: '连接并验证账号权限'
          },
          {
            key: 'TABLE_INIT',
            label: '创建目标表'
          },
          {
            key: 'WRITE_RECORD',
            label: '目标数据写入'
          }
        ],
        processor: [
          {
            key: 'NODE',
            label: '数据处理'
          }
        ]
      }
      const STATUS_MAP = {
        FINISH: {
          label: '已完成',
          color: 'color-success'
        },
        RUNNING: {
          label: '进行中',
          color: 'color-primary'
        },
        WAITING: {
          label: '等待中',
          color: 'color-info'
        },
        STOP: {
          label: '已停止',
          color: 'color-warning'
        },
        ERROR: {
          label: '出错',
          color: 'color-danger'
        }
      }

      this.data = NODE_MAP[node.nodeType].map(el => {
        const data = nodeMilestones[el.key]
        let t = Object.assign({}, el, data)
        let { status } = t
        let label = ''
        if (el.key === 'BATCH_READ') {
          const { snapshotTableTotal, snapshotDoneAt } = this.totalData
          if (snapshotDoneAt) {
            status = 'FINISH'
          } else if (!snapshotTableTotal) {
            status = 'WAITING'
          } else {
            status = 'RUNNING'
            const { progress, time } = this.getDueTimeAndProgress(this.totalData)
            label = STATUS_MAP[status]?.label + `(${progress}%,剩余${calcTimeUnit(time)})`
          }
        }
        t.statusColor = STATUS_MAP[status]?.color
        t.statusLabel = label || STATUS_MAP[status]?.label || '-'
        t.diff =
          t.begin && t.end
            ? calcTimeUnit(t.end - t.begin, 2, {
                autoHideMs: true
              })
            : '-'
        return t
      })
    },

    handleChange(val, node) {
      val ? this.getNodeData(node) : this.getWholeItems()
    },

    handleError(row = {}) {
      this.$confirm(row.errorMessage, '错误信息', {
        type: 'warning',
        closeOnClickModal: false
      })
    },

    getDueTimeAndProgress(data = {}) {
      const {
        tableTotal,
        snapshotTableTotal,
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal,
        snapshotRowTotal,
        snapshotInsertRowTotal,
        snapshotDoneAt,
        snapshotStartAt
      } = data
      const progress = snapshotTableTotal && tableTotal ? (snapshotTableTotal / tableTotal) * 100 : 0
      const usedTime = Time.now() - snapshotStartAt
      let time
      if (!snapshotInsertRowTotal || !snapshotRowTotal || !snapshotStartAt) {
        time = 0
      } else {
        time = snapshotRowTotal / (snapshotInsertRowTotal / usedTime) - usedTime
      }

      return {
        progress,
        time
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pro-line {
  width: 400px;
}
.node-list {
  width: 200px;
}
</style>
