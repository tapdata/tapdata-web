<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect :range="$attrs.range" ref="timeSelect" class="mb-1" @change="changeTimeSelect"></TimeSelect>
        <VIcon class="color-primary">refresh</VIcon>
        <Frequency :range="$attrs.range" @change="changeFrequency"></Frequency>
      </div>
      <div v-if="dataflow.type !== 'cdc'" class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_quanliangxinxi') }}</span>
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_monitor_leftsider_liebiao')">
            <VIcon @click.stop="toInitialList">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div v-if="initialData.snapshotDoneAt" class="mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_quanliangwanchengshi') }}</span>
          <span>{{ initialData.snapshotDoneAt }}</span>
        </div>
        <div v-else class="mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_yujiquanliangwan') }}</span>
          <ElTooltip transition="tooltip-fade-in" :content="initialData.finishDuration.toLocaleString() + 'ms'">
            <span>{{ calcTimeUnit(initialData.finishDuration, 2) }}</span>
          </ElTooltip>
        </div>
        <div class="mb-4 flex align-items-center">
          <span class="mr-2">{{ $t('packages_dag_monitor_leftsider_biaotongbuzongjin') }}</span>
          <ElProgress class="flex-1 my-2" :show-text="false" :percentage="totalDataPercentage" />
          <span class="ml-2">{{ totalData.snapshotTableTotal + '/' + totalData.tableTotal }}</span>
        </div>
      </div>
      <div v-if="verifyTotals" class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_renwujiaoyan') }}</span>
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_monitor_leftsider_liebiao')">
            <VIcon @click.stop="toInitialList">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_chayizongxingshu') }}</span>
          <span class="color-danger">{{ verifyTotals.diffRecords }}</span>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_jiaoyanbuyizhi') }}</span>
          <span>
            <span>{{ verifyTotals.diffTables }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
        </div>
        <div class="flex justify-content-between">
          <span class="mr-2">{{ $t('packages_dag_monitor_leftsider_buzhichijiaoyan') }}</span>
          <span>
            <span>{{ verifyTotals.ignore }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fs-7 fw-bold font-color-normal">{{
            $t('packages_dag_components_nodedetaildialog_xingnengzhibiao')
          }}</span>
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_in')">
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
            :title="$t('packages_dag_components_nodedetaildialog_zengliangyanchi')"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="h-100"
          ></LineChart>
        </div>
        <div style="height: 140px">
          <LineChart
            :data="delayData"
            :title="$t('packages_dag_monitor_leftsider_chulihaoshim')"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="h-100"
          ></LineChart>
        </div>
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
      <div class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">任务事件统计（条）</span>
        </div>
        <div v-loading="!eventDataAll" class="flex">
          <div v-if="eventDataAll" class="w-50 pr-4">
            <div>总输入</div>
            <div class="mt-1 mb-2 font-color-normal fw-bold fs-3 din-font">
              {{ eventDataAll.inputTotals.toLocaleString() }}
            </div>
            <div class="mb-2">
              <span>插入：</span>
              <span>{{ eventDataAll.inputInsertTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>更新：</span>
              <span>{{ eventDataAll.inputUpdateTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>删除：</span>
              <span>{{ eventDataAll.inputDeleteTotal.toLocaleString() }}</span>
            </div>
            <div>
              <span>DDL：</span>
              <span>{{ eventDataAll.inputDdlTotal.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="eventDataAll" class="output-item flex w-50">
            <div class="output-item__divider"></div>
            <div class="ml-4">
              <div>总输出</div>
              <div class="mt-1 mb-2 font-color-normal fw-bold fs-3 din-font">
                {{ eventDataAll.outputTotals.toLocaleString() }}
              </div>
              <div class="mb-2">
                <span>插入：</span>
                <span>{{ eventDataAll.outputInsertTotal.toLocaleString() }}</span>
              </div>
              <div class="mb-2">
                <span>更新：</span>
                <span>{{ eventDataAll.outputUpdateTotal.toLocaleString() }}</span>
              </div>
              <div class="mb-2">
                <span>删除：</span>
                <span>{{ eventDataAll.outputDeleteTotal.toLocaleString() }}</span>
              </div>
              <div>
                <span>DDL：</span>
                <span>{{ eventDataAll.outputDdlTotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      :title="$t('packages_dag_components_nodedetaildialog_xingnengzhibiao')"
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
        :title="$t('packages_dag_components_nodedetaildialog_zengliangyanchi')"
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog" :dataflow="dataflow" ref="initialList"></InitialList>
  </aside>
</template>

<script>
import i18n from '@tap/i18n'

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
import Frequency from './components/Frequency'
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
      default: () => {
        return {
          diffRecords: 0,
          diffTables: 0,
          totals: 0,
          ignore: 0
        }
      }
    },
    timeFormat: String
  },
  components: {
    LineChart,
    TimeSelect,
    Frequency,
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
        name: [
          i18n.t('packages_dag_components_nodedetaildialog_shuru'),
          i18n.t('packages_dag_components_nodedetaildialog_shuchu')
        ],
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
    },

    // 任务事件统计（条）-任务累计
    eventDataAll() {
      const data = this.quota.samples?.totalData?.[0]
      return this.getInputOutput(data)
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

    changeFrequency(val) {
      this.$emit('changeFrequency', val)
    },

    toFullscreen() {
      this.lineChartDialog = true
    },

    toInitialList() {
      this.initialListDialog = true
    },

    getInputOutput(data) {
      let result = {}
      const inputArr = ['inputInsertTotal', 'inputUpdateTotal', 'inputDeleteTotal', 'inputDdlTotal', 'inputOthersTotal']
      const outputArr = [
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal'
      ]
      ;[...inputArr, ...outputArr].forEach(el => {
        result[el] = data?.[el] || 0
      })
      result.inputTotals = inputArr.reduce((total, key) => {
        return total + result[key] || 0
      }, 0)
      result.outputTotals = outputArr.reduce((total, key) => {
        return total + result[key] || 0
      }, 0)
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
.output-item__divider {
  margin-top: 40px;
  border-right: 1px solid #f2f2f2;
  height: calc(100% - 40px);
}
</style>
