<template>
  <div class="flex h-100">
    <NodeList
      v-model:value="activeNodeId"
      show-type
      :label="$t('packages_business_milestone_list_zhengtijindu')"
      class="node-list border-end mr-4"
      @change="handleChange"
    ></NodeList>
    <div v-if="activeNodeId" class="flex-fill overflow-auto">
      <VTable ref="table" row-key="id" :columns="columns" :data="nodeData" hide-on-single-page class="pt-4">
        <template v-slot:statusLabel="scope">
          <div v-if="scope.row.status === 'ERROR'" :class="scope.row.statusColor">
            <span class="color-danger underline cursor-pointer" @click="handleError(scope.row)">{{
              $t('packages_business_milestone_list_renwuchucuo')
            }}</span>
          </div>
          <div v-else :class="scope.row.statusColor">
            {{ scope.row.statusLabel }}
          </div>
        </template>
      </VTable>
    </div>
    <div v-else class="flex-fill overflow-auto py-4">
      <div v-for="(item, index) in wholeItems" :key="index" class="pro-line flex">
        <div class="position-relative">
          <div v-if="index + 1 !== wholeItems.length" class="step__line position-absolute"></div>
          <VIcon :class="[item.color, 'mt-1 position-relative']" size="16">{{ item.icon }}</VIcon>
        </div>
        <div class="ml-4 pb-4 flex-fill">
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
import i18n from '@tap/i18n'

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
      activeNode: {},
      columns: [
        {
          label: i18n.t('packages_business_milestone_list_guanjianbuzhou'),
          prop: 'label'
        },
        {
          label: i18n.t('packages_business_connection_list_status'),
          slotName: 'statusLabel'
        },
        {
          label: i18n.t('packages_business_task_info_start_time'),
          dataType: 'time',
          prop: 'begin'
        },
        {
          label: i18n.t('packages_business_verification_LastTime'),
          dataType: 'time',
          prop: 'end'
        },
        {
          label: i18n.t('packages_business_milestone_list_haoshi'),
          prop: 'diff'
        }
      ]
    }
  },

  computed: {
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
    },

    wholeItems() {
      const milestone = this.dataflow.attrs?.milestone || {}

      let result = [
        {
          key: 'TASK',
          label: i18n.t('packages_business_milestone_list_renwudiaodu')
        },
        {
          key: 'DATA_NODE_INIT',
          label: i18n.t('packages_business_milestone_list_shujujiedianchu')
        },
        {
          key: 'TABLE_INIT',
          label: i18n.t('packages_business_milestone_list_biaojiegouqianyi')
        },
        {
          key: 'FULL_SYNC',
          label: i18n.t('packages_business_milestone_list_quanliangshujuqian')
        },
        {
          key: 'STREAM_READ',
          label: i18n.t('packages_business_milestone_list_zengliangshujuqian')
        }
      ]

      const dataflowType = this.dataflow.type
      result = result.filter(
        t =>
          dataflowType === 'initial_sync+cdc' ||
          (dataflowType === 'cdc' && t.key !== 'FULL_SYNC') ||
          (dataflowType === 'initial_sync' && t.key !== 'STREAM_READ')
      )

      const finishOpt = {
        status: 'FINISH',
        desc: i18n.t('packages_business_milestone_list_wancheng'),
        icon: 'success',
        color: 'color-success'
      }
      const runningOpt = {
        status: 'RUNNING',
        desc: i18n.t('packages_business_milestone_list_status_progressing'),
        icon: 'loading-circle',
        progress: 0,
        color: 'color-primary'
      }
      const waitingOpt = {
        status: 'WAITING',
        desc: i18n.t('packages_business_milestone_list_dengdaizhong'),
        icon: 'time',
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
              desc: i18n.t('packages_business_milestone_list_jinhangzhongpr', {
                val1: progress,
                val2: calcTimeUnit(time)
              })
            })
          }
        } else {
          const item = milestone[el.key]
          if (item?.status === 'FINISH') {
            Object.assign(el, finishOpt)
          } else if (item?.status === 'RUNNING') {
            Object.assign(el, runningOpt, {
              progress: (item.progress / item.totals) * 100
            })
          } else {
            Object.assign(el, waitingOpt)
          }
        }
      })
      const len = result.length
      const finishedLen = result.filter(t => t.status === 'FINISH').length
      const per = (finishedLen / len) * 100
      result.unshift({
        label: i18n.t('packages_business_milestone_list_zhengtijindu'),
        icon: 'device',
        percentage: per,
        desc:
          per >= 100
            ? i18n.t('packages_business_milestone_list_wancheng')
            : i18n.t('packages_business_milestone_list_finis', {
                val1: finishedLen,
                val2: len,
                val3: result.find(t => t.status !== 'FINISH')?.label
              })
      })
      return result
    },

    nodeData() {
      const { nodeMilestones } = this
      const dataflowType = this.dataflow.type
      const NODE_MAP = {
        source: [
          {
            key: 'NODE',
            label: i18n.t('packages_business_milestone_list_lianjiebingyanzheng')
          },
          {
            key: 'BATCH_READ',
            label: i18n.t('packages_business_milestone_list_duququanliangshu')
          },
          {
            key: 'OPEN_STREAM_READ',
            label: i18n.t('packages_business_milestone_list_kaiqizengliang')
          },
          {
            key: 'STREAM_READ',
            label: i18n.t('packages_business_milestone_list_duquzengliangshu')
          }
        ],
        target: [
          {
            key: 'NODE',
            label: i18n.t('packages_business_milestone_list_lianjiebingyanzheng')
          },
          {
            key: 'TABLE_INIT',
            label: i18n.t('packages_business_milestone_list_chuangjianmubiaobiao')
          },
          {
            key: 'WRITE_RECORD',
            label: i18n.t('packages_business_milestone_list_mubiaoshujuxie')
          }
        ],
        processor: [
          {
            key: 'NODE',
            label: i18n.t('packages_business_milestone_list_shujuchuli')
          }
        ]
      }
      const STATUS_MAP = {
        FINISH: {
          label: i18n.t('packages_business_status_complete'),
          color: 'color-success'
        },
        RUNNING: {
          label: i18n.t('packages_business_milestone_list_status_progressing'),
          color: 'color-primary'
        },
        WAITING: {
          label: i18n.t('packages_business_milestone_list_dengdaizhong'),
          color: 'color-info'
        },
        STOP: {
          label: i18n.t('packages_business_status_stop'),
          color: 'color-warning'
        },
        ERROR: {
          label: i18n.t('packages_business_milestone_list_chucuo'),
          color: 'color-danger'
        }
      }

      return NODE_MAP[this.activeNode.nodeType]
        .filter(
          t =>
            dataflowType === 'initial_sync+cdc' ||
            (dataflowType === 'cdc' && !['BATCH_READ'].includes(t.key)) ||
            (dataflowType === 'initial_sync' && !['OPEN_STREAM_READ', 'STREAM_READ'].includes(t.key))
        )
        .map(el => {
          const data = nodeMilestones[el.key]
          let t = Object.assign({}, el, data)
          let { status = 'WAITING' } = t
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
              label =
                STATUS_MAP[status]?.label +
                i18n.t('packages_business_milestone_list_progr', {
                  val1: progress,
                  val2: calcTimeUnit(time)
                })
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
    }
  },

  methods: {
    handleChange(val, node) {
      this.activeNode = val ? node : {}
    },

    handleError(row = {}) {
      this.$confirm(row.errorMessage, i18n.t('packages_business_milestone_list_cuowuxinxi'), {
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
      const progress = snapshotTableTotal && tableTotal ? Math.round((snapshotTableTotal / tableTotal) * 100) : 0
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
  width: 650px;
}
.node-list {
  width: 224px;
}
.step__line {
  left: 50%;
  top: 28px;
  bottom: 4px;
  border-left: 1px dashed #dee2e6;
  transform: translateX(-50%);
}
</style>
