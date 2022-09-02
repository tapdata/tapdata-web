<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect :range="$attrs.range" ref="timeSelect" @change="changeTimeSelect"></TimeSelect>
      </div>
      <div v-if="dataflow.type !== 'cdc'" class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">全量信息</span>
          <ElTooltip transition="tooltip-fade-in" content="列表">
            <VIcon @click.stop="toInitialList">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div v-if="initialData.snapshotDoneAt" class="mb-2">
          <span>全量完成时间：</span>
          <span>{{ initialData.snapshotDoneAt }}</span>
        </div>
        <div v-else class="mb-2">
          <span>预计全量完成还需：</span>
          <ElTooltip transition="tooltip-fade-in" :content="initialData.finishDuration.toLocaleString() + 'ms'">
            <span>{{ calcTimeUnit(initialData.finishDuration, 2) }}</span>
          </ElTooltip>
        </div>
        <div class="mb-4 flex align-items-center">
          <span class="mr-2">表同步总进度</span>
          <ElProgress class="flex-1 my-2" :show-text="false" :percentage="totalDataPercentage" />
          <span class="ml-2">{{ totalData.snapshotTableTotal + '/' + totalData.tableTotal }}</span>
        </div>
      </div>
      <div v-if="verifyTotals" class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">任务校验</span>
          <ElTooltip transition="tooltip-fade-in" content="列表">
            <VIcon @click.stop="toInitialList">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>差异总行数：</span>
          <span class="color-danger">{{ verifyTotals.diffRecords }}</span>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>校验不一致的表：</span>
          <span>
            <span>{{ verifyTotals.diffTables }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
        </div>
        <div class="flex justify-content-between">
          <span class="mr-2">不支持校验的表：</span>
          <span>
            <span>{{ verifyTotals.ignore }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fs-7 fw-bold font-color-normal">性能指标</span>
          <ElTooltip transition="tooltip-fade-in" content="放大">
            <VIcon @click.stop="toFullscreen">enlarge</VIcon>
          </ElTooltip>
        </div>
        <div class="mb-2" style="height: 140px">
          <LineChart
            :data="qpsData"
            :color="['#26CF6C', '#2C65FF']"
            title="QPS（Q/S）"
            :time-format="timeFormat"
            class="h-100"
          ></LineChart>
        </div>
        <div class="mb-2" style="height: 140px">
          <LineChart
            :data="delayData"
            title="增量延迟"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="h-100"
          ></LineChart>
        </div>
        <div style="height: 140px">
          <LineChart
            :data="delayData"
            title="处理耗时（ms）"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="h-100"
          ></LineChart>
        </div>
      </div>
    </div>

    <ElDialog
      title="性能指标"
      width="774px"
      :visible.sync="lineChartDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
    >
      <LineChart
        :data="qpsData"
        :color="['#26CF6C', '#2C65FF']"
        title="QPS（Q/S）"
        :time-format="timeFormat"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="delayData"
        :color="['#2C65FF']"
        :time-format="timeFormat"
        time-value
        title="增量延迟"
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog" :dataflow="dataflow" ref="initialList"></InitialList>
  </aside>
</template>

<script>
import 'web-core/assets/icons/svg/magnify.svg'
import 'web-core/assets/icons/svg/table.svg'
import 'web-core/assets/icons/svg/javascript.svg'
import 'web-core/assets/icons/svg/joint-cache.svg'
import 'web-core/assets/icons/svg/row-filter.svg'
import 'web-core/assets/icons/svg/aggregator.svg'
import 'web-core/assets/icons/svg/field-processor.svg'
import 'web-core/assets/icons/svg/join.svg'
import 'web-core/assets/icons/svg/custom-node.svg'
import 'web-core/assets/icons/svg/merge_table.svg'
import 'web-core/assets/icons/svg/field_calc.svg'
import 'web-core/assets/icons/svg/field_add_del.svg'
import 'web-core/assets/icons/svg/field_rename.svg'
import 'web-core/assets/icons/svg/field_mod_type.svg'
import LineChart from './components/LineChart'
import TimeSelect from './components/TimeSelect'
import { VIcon } from '@tap/component'
import InitialList from './components/InitialList'
import dayjs from 'dayjs'
import { calcTimeUnit } from '@tap/shared'

export default {
  name: 'LeftSider',
  props: {
    dataflow: Object,
    quota: Object,
    verifyTotals: {
      type: Object,
      default: () => {}
    },
    timeFormat: String
  },
  components: {
    LineChart,
    TimeSelect,
    VIcon,
    InitialList
  },

  data() {
    return {
      lineChartDialog: false,
      initialListDialog: false,
      timeSelectLabel: ''
    }
  },

  computed: {
    // qps
    qpsData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: [[], []]
        }
      }
      const { time = [] } = this.quota
      return {
        x: time,
        name: ['输入', '输出'],
        value: [data.inputQps, data.outputQps]
      }
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      const { time = [] } = this.quota
      if (!data) {
        return {
          x: [],
          value: []
        }
      }
      return {
        x: time,
        value: data.timeCostAvg
      }
    },

    // 全量信息
    initialData() {
      const data = this.quota.samples?.totalData?.[0] || {}
      const { snapshotRowTotal = 0, snapshotInsertRowTotal = 0, outputQps = 0, snapshotDoneAt } = data
      const time = outputQps ? Math.ceil(((snapshotRowTotal - snapshotInsertRowTotal) / outputQps) * 1000) : 0 // 剩余待同步的数据量/当前的同步速率, outputQps行每秒
      return {
        snapshotDoneAt: snapshotDoneAt ? dayjs(snapshotDoneAt).format('YYYY-MM-DD HH:mm:ss') : '',
        finishDuration: time
      }
    },

    totalData() {
      const { tableTotal = 0, snapshotTableTotal = 0 } = this.quota.samples?.totalData?.[0] || {}
      return { tableTotal, snapshotTableTotal }
    },

    totalDataPercentage() {
      const { tableTotal, snapshotTableTotal } = this.totalData
      return snapshotTableTotal && tableTotal ? (snapshotTableTotal / tableTotal) * 100 : 0
    },

    initialList() {
      return this.$refs?.initialList
    }
  },

  mounted() {
    this.timeSelectLabel = this.$refs.timeSelect?.getPeriod()?.label
  },

  methods: {
    changeTimeSelect(val, isTime, source) {
      this.$emit('changeTimeSelect', val, isTime, source)
      this.timeSelectLabel = this.$refs.timeSelect?.getPeriod()?.label
    },

    toFullscreen() {
      this.lineChartDialog = true
    },

    toInitialList() {
      this.initialListDialog = true
    },

    getInputOutput(data) {
      let keyArr = [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal'
      ]
      let result = {
        input: {},
        output: {}
      }
      keyArr.forEach(el => {
        for (let key in result) {
          let item = result[key]
          if (el.includes(key)) {
            item[el.replace(key, '')] = data?.[el] || 0
          }
        }
      })
      return result
    },

    calcTimeUnit(val, fix) {
      return val ? calcTimeUnit(val, fix) : '-'
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .el-dialog {
    .el-dialog__body {
      padding-top: 6px;
    }
  }
}

.layout-sidebar.--left {
  overflow: hidden auto;
  will-change: width;
  $headerH: 34px;

  ::v-deep {
    .el-collapse {
      border-top: 0;

      &-item {
        &.is-active [role='tab'] {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        &__header {
          position: relative;
          padding-left: 16px;
          padding-right: 16px;
          height: $headerH;
          font-size: 14px;

          &:hover {
            background-color: rgba(47, 46, 63, 0.05);
          }
        }

        &__wrap {
          padding-top: 16px;
        }

        &__arrow {
          order: -1;
          &:before {
            content: '\e791';
          }
        }

        &__content {
          padding-bottom: 0;
        }
      }
    }

    .el-scrollbar {
      height: 100%;
    }

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}

.info-box {
  padding: 8px 16px;
  border-bottom: 1px solid #f2f2f2;
}
.task-info__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
