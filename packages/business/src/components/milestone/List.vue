<template>
  <div class="flex h-100">
    <NodeList v-model="activeNodeId" title="整体进度" class="border-end mr-4" @change="handleChange"></NodeList>
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
        <VIcon :class="[item.color]">{{ item.icon }}</VIcon>
        <div class="ml-4 flex-fill">
          <span class="font-color-normal fw-bold">{{ item.label }}</span>
          <div v-if="item.desc" class="mt-2 color-info">{{ item.desc }}</div>
          <ElProgress :percentage="item.percentage" class="mt-1" :show-text="false"></ElProgress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { calcTimeUnit } from '@tap/shared'

import NodeList from '../nodes/List'

export default {
  name: 'List',

  props: {
    dataflow: {
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
          label: '全量数据迁移',
          status: 'finish'
        },
        {
          key: 'STREAM_READ',
          label: '增量数据迁移'
        }
      ]
      result.forEach(el => {
        const item = milestone[el.key]
        if (item?.status) {
          el.status = item.status
          if (item.status === 'FINISH') {
            el.desc = '完成'
            el.icon = 'success'
            el.progress = 100
            el.color = 'color-success'
          } else {
            el.desc = '进行中'
            el.icon = 'loading'
            el.progress = (item.progress / item.totals) * 100
            el.color = 'color-primary'
          }
        } else {
          el.status = 'waiting'
          el.desc = '等待中'
          el.icon = 'wait-fill'
          el.color = 'color-warning'
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
        const { status } = t
        t.statusColor = STATUS_MAP[status]?.color
        t.statusLabel = STATUS_MAP[status]?.label || '-'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.pro-line {
  width: 400px;
}
</style>
