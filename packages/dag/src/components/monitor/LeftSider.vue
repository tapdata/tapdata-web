<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0 overflow-y-auto">
      <div class="info-box flex justify-content-between align-items-center flex-wrap">
        <TimeSelect
          :options="timeOptions"
          :range="$attrs.range"
          ref="timeSelect"
          class="mb-1 w-100"
          @change="changeTimeSelect"
        ></TimeSelect>
        <Frequency :range="$attrs.range" class="flex-1" @change="changeFrequency"></Frequency>
        <ElTooltip transition="tooltip-fade-in" :content="$t('public_button_refresh')">
          <IconButton class="color-primary" @click="$emit('load-data')"> refresh </IconButton>
        </ElTooltip>
      </div>
      <div v-if="dataflow.type !== 'cdc'" class="info-box sync-info">
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_tongbuxinxi') }}</span>
          <ElTooltip
            v-if="showToInitialList"
            transition="tooltip-fade-in"
            :content="$t('packages_dag_monitor_leftsider_liebiao')"
          >
            <VIcon @click.stop="toInitialList">menu-left</VIcon>
          </ElTooltip>
        </div>
        <template v-if="dataflow.type !== 'cdc'">
          <div class="mb-2 flex justify-content-between">
            <span class="sync-info-item__title">{{
              $t('packages_dag_components_nodedetaildialog_quanliangkaishishi')
            }}</span>
            <span>{{ initialData.snapshotStartAt || '-' }}</span>
          </div>
          <div v-if="initialData.snapshotDoneAt" class="mb-2 flex justify-content-between">
            <span class="sync-info-item__title">{{ $t('packages_dag_monitor_leftsider_quanliangwanchengshi') }}</span>
            <span>{{ initialData.snapshotDoneAt }}</span>
          </div>
          <div v-else class="mb-2 flex justify-content-between">
            <span class="sync-info-item__title">{{ $t('packages_dag_monitor_leftsider_yujiquanliangwan') }}</span>
            <span v-if="isFileSource" class="flex-1 text-end">{{
              $t('packages_dag_components_node_zanbuzhichi')
            }}</span>
            <span v-else-if="initialData.finishDuration < 0">{{ $t('packages_business_task_info_calculating') }}</span>
            <ElTooltip
              v-else
              transition="tooltip-fade-in"
              :content="initialData.finishDuration.toLocaleString() + 'ms'"
            >
              <span>{{ calcTimeUnit(initialData.finishDuration) }}</span>
            </ElTooltip>
          </div>
          <div class="mb-2 flex align-items-center">
            <span class="mr-2 sync-info-item__title">{{ $t('public_task_full_sync_progress') }}</span>
            <span v-if="isFileSource" class="flex-1 text-end">{{
              $t('packages_dag_components_node_zanbuzhichi')
            }}</span>
            <ElTooltip v-else placement="bottom">
              <div class="inline-flex">
                <ElProgress
                  class="flex-1 my-2"
                  :show-text="false"
                  style="width: 150px"
                  :percentage="totalDataPercentage"
                />
                <span class="ml-2">{{ totalData.snapshotTableTotal + '/' + totalData.tableTotal }}</span>
              </div>
              <div slot="content" class="fs-8">
                <div>
                  <span>{{ $t('packages_dag_monitor_leftsider_quanliangwanchenghao') }}:</span>
                  <span class="ml-2">{{ calcTimeUnit(totalData.snapshotDoneCost) }}</span>
                </div>
                <div>
                  <span>{{ $t('packages_dag_monitor_leftsider_pingjunQps') }}:</span>
                  <span class="ml-2">{{ totalData.outputQpsAvg }}</span>
                </div>
                <div>
                  <span>{{ $t('packages_dag_monitor_leftsider_zuidaQps') }}:</span>
                  <span class="ml-2">{{ totalData.outputQpsMax }}</span>
                </div>
              </div>
            </ElTooltip>
          </div>
          <div
            v-if="dataflow.syncType === 'migrate' && totalData.currentSnapshotTableRowTotal && !ifEnableConcurrentRead"
            class="mb-4 flex align-items-center"
          >
            <span class="mr-2 sync-info-item__title">{{
              $t('packages_dag_components_nodedetaildialog_dangqianbiaotongbu')
            }}</span>
            <ElProgress class="flex-1 my-2" :show-text="false" :percentage="currentTotalDataPercentage" />
            <span class="ml-2">{{
              (totalData.currentSnapshotTableInsertRowTotal || 0) + '/' + (totalData.currentSnapshotTableRowTotal || 0)
            }}</span>
          </div>
        </template>
        <template v-if="dataflow.type !== 'initial_sync'">
          <div v-if="initialData.snapshotDoneAt" class="mb-2 flex justify-content-between">
            <span>{{ $t('packages_dag_monitor_leftsider_zuidazengliangyan') }}</span>
            <span>{{ getReplicateLag(initialData.replicateLag) }}</span>
          </div>
        </template>
      </div>
      <div
        v-if="dataflow.syncType === 'migrate' && dataflow.isAutoInspect && dataflow.canOpenInspect && verifyTotals"
        class="info-box"
      >
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_renwujiaoyan') }}</span>
          <ElTooltip
            v-if="verifyTotals.diffTables"
            transition="tooltip-fade-in"
            :content="$t('packages_dag_monitor_leftsider_chayixiangqing')"
          >
            <VIcon @click.stop="$emit('verifyDetails')">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_chayizongxingshu') }}</span>
          <span :class="{ 'color-danger': verifyTotals.diffRecords }">{{ verifyTotals.diffRecords }}</span>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_jiaoyanbuyizhi') }}</span>
          <span v-if="verifyTotals.diffTables">
            <span :class="{ 'color-danger': verifyTotals.diffTables }">{{ verifyTotals.diffTables }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
          <span v-else>0</span>
        </div>
        <div class="flex justify-content-between">
          <span class="mr-2">{{ $t('packages_dag_monitor_leftsider_buzhichijiaoyan') }}</span>
          <span v-if="verifyTotals.ignore">
            <span :class="{ 'color-danger': verifyTotals.ignore }">{{ verifyTotals.ignore }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
          <span v-else>0</span>
        </div>
      </div>

      <div
        v-if="['SharedMiningMonitor', 'SharedCacheMonitor'].includes($route.name) && infoList.length > 0"
        class="info-box"
      >
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_jibenxinxi') }}</span>
        </div>
        <div
          v-for="(item, index) in infoList"
          :key="index"
          class="mb-2"
          :class="[item.block ? 'block' : 'flex justify-content-between', item.class]"
        >
          <div class="font-color-light">{{ item.label }}:</div>
          <div class="font-color-dark">{{ item.value || '-' }}</div>
        </div>
      </div>

      <div class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fs-7 fw-sub font-color-normal">{{
            $t('packages_dag_components_nodedetaildialog_xingnengzhibiao')
          }}</span>
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_in')">
            <VIcon @click.stop="toFullscreen">enlarge</VIcon>
          </ElTooltip>
        </div>
        <div class="line-chart__box mb-2">
          <div class="flex justify-content-between">
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              :content="
                qpsChartsType === 'count'
                  ? $t('packages_dag_monitor_leftsider_qpSshizhi')
                  : $t('packages_dag_monitor_leftsider_qpSshizhi2')
              "
            >
              <span class="inline-flex align-items-center">
                <span class="mr-2 font-color-dark fw-sub">QPS(Q/S)</span>
                <VIcon size="16" class="color-primary">info</VIcon>
              </span>
            </ElTooltip>
            <ElRadioGroup v-model="qpsChartsType" size="mini" class="chart__radio">
              <ElRadioButton label="count">count</ElRadioButton>
              <ElRadioButton label="size">size</ElRadioButton>
            </ElRadioGroup>
          </div>

          <LineChart
            :data="qpsMap[qpsChartsType]"
            :color="['#26CF6C', '#2C65FF']"
            :time-format="timeFormat"
            :labelUnitType="qpsChartsType === 'size' ? 'byte' : ''"
            auto-scale
            class="line-chart"
          ></LineChart>
        </div>
        <div class="line-chart__box mb-2">
          <div class="flex align-center gap-2">
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')"
            >
              <span class="inline-flex align-items-center">
                <span class="mr-2 font-color-dark fw-sub">{{ $t('public_event_incremental_delay') }}</span>
                <VIcon size="16" class="color-primary">info</VIcon>
              </span>
            </ElTooltip>
            <ElTooltip
              v-if="dataflow.timeDifference > 0"
              key="retrying"
              placement="top"
              :content="$t('packages_dag_monitor_timeDifference', { val: calcTimeUnit(dataflow.timeDifference) })"
            >
              <VIcon size="16" class="color-warning">warning</VIcon>
            </ElTooltip>
          </div>

          <LineChart
            :data="replicateLagData"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="line-chart"
          ></LineChart>
        </div>
        <!--指标不准确，暂时隐藏-->
        <!--<div class="line-chart__box mb-2">
          <ElTooltip
            transition="tooltip-fade-in"
            placement="top"
            :content="$t('packages_dag_monitor_leftsider_renwuchuliwan')"
          >
            <span>
              <span class="mr-2 font-color-dark fw-sub">{{ $t('packages_dag_monitor_leftsider_chulihaoshim') }}</span>
              <VIcon size="14" class="color-primary">info</VIcon>
            </span>
          </ElTooltip>
          <LineChart
            :data="delayData"
            :color="['#2C65FF']"
            :time-format="timeFormat"
            time-value
            class="line-chart"
          ></LineChart>
        </div>-->
      </div>
      <div v-if="!hideTotalData" class="info-box py-2 px-4">
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_renwushijiantong') }}</span>
        </div>
        <div v-loading="!eventDataAll" class="flex">
          <div v-if="eventDataAll" class="w-50 pr-4">
            <div>{{ $t('public_event_total_input') }}</div>
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              :content="eventDataAll.inputTotals.toLocaleString()"
              class="mt-1 mb-2 font-color-normal fw-sub fs-3 din-font"
            >
              <div>{{ eventDataAll.inputTotalsLabel }}</div>
            </ElTooltip>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_charu') }}</span>
              <span>{{ eventDataAll.inputInsertTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_gengxin') }}</span>
              <span>{{ eventDataAll.inputUpdateTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_shanchu') }}</span>
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
              <div>{{ $t('public_event_total_output') }}</div>
              <ElTooltip
                transition="tooltip-fade-in"
                placement="top"
                :content="eventDataAll.outputTotals.toLocaleString()"
                class="mt-1 mb-2 font-color-normal fw-sub fs-3 din-font"
              >
                <div>
                  {{ eventDataAll.outputTotalsLabel }}
                </div>
              </ElTooltip>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_charu') }}</span>
                <span>{{ eventDataAll.outputInsertTotal.toLocaleString() }}</span>
              </div>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_gengxin') }}</span>
                <span>{{ eventDataAll.outputUpdateTotal.toLocaleString() }}</span>
              </div>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_shanchu') }}</span>
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
      <div class="py-2 px-4">
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{ $t('packages_dag_monitor_leftsider_tiaoshixinxi') }}</span>
        </div>
        <div class="mb-2 flex justify-content-between">
          <span>{{ $t('public_task_heartbeat_time') }}:</span>
          <span>{{ heartbeatTime }}</span>
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
      <div class="line-chart__box mb-2">
        <div class="flex justify-content-between">
          <ElTooltip
            transition="tooltip-fade-in"
            placement="top"
            :content="
              qpsChartsType === 'count'
                ? $t('packages_dag_monitor_leftsider_qpSshizhi')
                : $t('packages_dag_monitor_leftsider_qpSshizhi2')
            "
          >
            <span class="inline-flex align-items-center">
              <span class="mr-2 font-color-dark fw-sub">QPS(Q/S)</span>
              <VIcon size="16" class="color-primary">info</VIcon>
            </span>
          </ElTooltip>
          <ElRadioGroup v-model="qpsChartsType" size="mini" class="chart__radio">
            <ElRadioButton label="count">count</ElRadioButton>
            <ElRadioButton label="size">size</ElRadioButton>
          </ElRadioGroup>
        </div>
      </div>

      <LineChart
        :data="qpsMap[qpsChartsType]"
        :color="['#26CF6C', '#2C65FF']"
        :time-format="timeFormat"
        :labelUnitType="qpsChartsType === 'size' ? 'byte' : ''"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="replicateLagData"
        :title="$t('public_event_incremental_delay')"
        :color="['#2C65FF']"
        :time-format="timeFormat"
        time-value
        class="mt-8"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="delayData"
        :title="$t('packages_dag_monitor_leftsider_chulihaoshim')"
        :color="['#2C65FF']"
        :time-format="timeFormat"
        time-value
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog" :dataflow="dataflow" ref="initialList"></InitialList>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'

import i18n from '@tap/i18n'
import LineChart from './components/LineChart'
import { VIcon, TimeSelect, IconButton } from '@tap/component'
import Frequency from './components/Frequency'
import InitialList from './components/InitialList'
import dayjs from 'dayjs'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import { logcollectorApi, sharedCacheApi, externalStorageApi } from '@tap/api'
import { EXTERNAL_STORAGE_TYPE_MAP } from '@tap/business'

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
    timeFormat: String,
    ifEnableConcurrentRead: Boolean
  },
  components: {
    LineChart,
    TimeSelect,
    Frequency,
    VIcon,
    InitialList,
    IconButton
  },

  data() {
    return {
      lineChartDialog: false,
      initialListDialog: false,
      timeSelectLabel: '',
      collectorData: {
        externalStorage: {}
      },
      infoList: [],
      qpsChartsType: 'count'
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    qpsMap() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: [[], []],
          markLine: [
            {
              data: []
            }
          ]
        }
      }
      const { time = [] } = this.quota
      // const { inputQps = [], outputQps = [], inputSizeQps = [], outputSizeQps = [] } = data
      // const
      // this.labelUnitType = data.inputSizeQps ? 'byte' : ''
      const inputQps = data.inputQps?.map(t => Math.abs(t))
      const outputQps = data.outputQps?.map(t => Math.abs(t))
      const inputSizeQps = data.inputSizeQps?.map(t => Math.abs(t))
      const outputSizeQps = data.outputSizeQps?.map(t => Math.abs(t))
      // 计算距离增量时间点，最近的时间点
      const milestone = this.dataflow.attrs?.milestone || {}
      const snapshotDoneAt = milestone.SNAPSHOT?.end
      let markLineTime = 0
      time.forEach(el => {
        if (Math.abs(el - snapshotDoneAt) < 2000 && Math.abs(el - snapshotDoneAt) < Math.abs(el - markLineTime)) {
          markLineTime = el
        }
      })

      let opt = {
        x: time,
        name: [i18n.t('public_time_input'), i18n.t('public_time_output')],
        // value: [inputQps, outputQps],
        value: [],
        zoomValue: 10
      }

      if (this.dataflow.type === 'initial_sync+cdc') {
        opt.markLine = [
          {
            symbol: 'none',
            data: [
              {
                xAxis: markLineTime + '',
                lineStyle: {
                  color: '#000'
                },
                label: {
                  show: false
                }
              }
            ]
          }
        ]
      }

      return {
        count: Object.assign(cloneDeep(opt), {
          value: [inputQps, outputQps]
        }),
        size: Object.assign(cloneDeep(opt), {
          value: [inputSizeQps, outputSizeQps]
        })
      }
    },

    // 处理耗时
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
    // 增量延迟
    replicateLagData() {
      const data = this.quota.samples?.lineChartData?.[0]
      const { time = [] } = this.quota
      if (!data) {
        return {
          x: [],
          value: []
        }
      }

      const { replicateLag = [] } = data
      const open = this.dataflow.alarmSettings?.find(t => t.key === 'TASK_INCREMENT_DELAY')?.open
      const delay = open ? this.dataflow.alarmRules?.find(t => t.key === 'TASK_INCREMENT_DELAY')?.ms || 0 : 60 * 1000
      const max = Math.max(...replicateLag)
      return {
        x: time,
        value: replicateLag,
        yAxisMax: Math.max(delay, max)
      }
    },

    // 全量信息
    initialData() {
      const data = this.quota.samples?.totalData?.[0] || {}
      const {
        snapshotRowTotal = 0,
        snapshotInsertRowTotal = 0,
        snapshotDoneAt,
        snapshotStartAt,
        replicateLag,
        lastFiveMinutesQps
      } = data
      let time
      if (!snapshotInsertRowTotal || !snapshotRowTotal || !lastFiveMinutesQps) {
        time = 0
      } else {
        time = ((snapshotRowTotal - snapshotInsertRowTotal) / lastFiveMinutesQps) * 1000
      }
      return {
        snapshotDoneAt: snapshotDoneAt ? dayjs(snapshotDoneAt).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        snapshotStartAt: snapshotStartAt ? dayjs(snapshotStartAt).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        replicateLag: replicateLag,
        finishDuration: time
      }
    },

    totalData() {
      let {
        tableTotal = 0,
        snapshotTableTotal = 0,
        currentSnapshotTableInsertRowTotal = 0,
        currentSnapshotTableRowTotal = 0,
        snapshotDoneCost,
        outputQpsMax = 0,
        outputQpsAvg = 0
      } = this.quota.samples?.totalData?.[0] || {}
      // 如果分子大于分母，将分母的值调整成跟分子一样
      if (currentSnapshotTableInsertRowTotal > currentSnapshotTableRowTotal) {
        currentSnapshotTableRowTotal = currentSnapshotTableInsertRowTotal
      }
      return {
        tableTotal,
        snapshotTableTotal,
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal,
        snapshotDoneCost,
        outputQpsMax: Math.ceil(outputQpsMax),
        outputQpsAvg: Math.ceil(outputQpsAvg)
      }
    },

    totalDataPercentage() {
      if (this.initialData.snapshotDoneAt) return 100
      const { tableTotal, snapshotTableTotal } = this.totalData
      if (!snapshotTableTotal || !tableTotal) return 0
      if (snapshotTableTotal > tableTotal) return 100
      return (snapshotTableTotal / tableTotal) * 100
    },

    currentTotalDataPercentage() {
      const { currentSnapshotTableInsertRowTotal, currentSnapshotTableRowTotal } = this.totalData
      if (!currentSnapshotTableRowTotal) return 0
      if (currentSnapshotTableInsertRowTotal > currentSnapshotTableRowTotal) {
        return 100
      }
      return (currentSnapshotTableInsertRowTotal / currentSnapshotTableRowTotal) * 100
    },

    initialList() {
      return this.$refs?.initialList
    },

    // 任务事件统计（条）-任务累计
    eventDataAll() {
      const data = this.quota.samples?.barChartData?.[0]
      return this.getInputOutput(data)
    },

    heartbeatTime() {
      const { pingTime, status } = this.dataflow
      return status === 'running' && pingTime ? dayjs(Time.now()).to(dayjs(pingTime)) : '-'
    },

    isFileSource() {
      const allNodes = this.$store.getters['dataflow/allNodes']
      if (!allNodes.length) return
      const fileType = ['CSV', 'EXCEL', 'JSON', 'XML']
      return allNodes.some(node => fileType.includes(node.databaseType))
    },

    hideTotalData() {
      return ['shareCache'].includes(this.dataflow?.syncType)
    },

    showToInitialList() {
      return !(this.dataflow.syncType === 'sync' && !this.dataflow.shareCache)
    },

    // 进入增量阶段
    startingIncremental() {
      return this.dataflow.type !== 'initial_sync' && !!this.initialData.snapshotDoneAt
    },

    timeOptions() {
      const options = [
        {
          label: i18n.t('packages_dag_components_timeselect_zuijinfenzhong'),
          value: '5m'
        },
        {
          label: i18n.t('packages_dag_components_timeselect_zuixinxiaoshi'),
          value: '1h'
        },
        {
          label: i18n.t('public_time_last_day'),
          value: '1d'
        },
        {
          label: i18n.t('packages_dag_components_timeselect_renwuzuijinyi'),
          value: 'lastStart'
        },
        {
          label: i18n.t('packages_dag_components_timeselect_renwuquanzhouqi'),
          value: 'full'
        }
      ]

      if (this.startingIncremental) {
        options.push({
          label: i18n.t('packages_dag_components_timeselect_incremental_phase'),
          value: 'incremental'
        })
      }

      options.push({
        label: i18n.t('public_time_custom_time'),
        type: 'custom',
        value: 'custom'
      })

      return options
    }
  },

  watch: {
    'dataflow.syncType'(v) {
      v && this.getBasicInformation()
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
      const limit = 1000000000
      result.inputTotalsLabel =
        result.inputTotals >= limit ? calcUnit(result.inputTotals) : result.inputTotals.toLocaleString()

      result.outputTotalsLabel =
        result.outputTotals >= limit ? calcUnit(result.outputTotals) : result.outputTotals.toLocaleString()
      return result
    },

    calcTimeUnit() {
      return typeof arguments[0] === 'number' ? calcTimeUnit(...arguments) : '-'
    },

    getReplicateLag(val) {
      return typeof val === 'number' && val >= 0
        ? calcTimeUnit(val, 2, {
            autoHideMs: true
          })
        : i18n.t('public_data_no_data')
    },

    getCollectorData() {
      logcollectorApi.getDetail(this.dataflow.id).then(data => {
        const { externalStorage = {}, logTime, name } = data
        let uriInfo = externalStorage.uri
        if (externalStorage.type === 'mongodb') {
          const regResult =
            /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
              externalStorage.uri
            )
          const { username, host, database, query } = regResult.groups
          uriInfo = `mongodb://${username}:***@${host}/${database}${query ? '/' + query : ''}`
        }
        if (!externalStorage.name) {
          this.infoList = [
            {
              label: this.$t('packages_business_relation_details_rizhiwajueshi'),
              value: this.formatTime(logTime)
            }
          ]
          return
        }
        this.infoList = [
          {
            label: this.$t('packages_business_relation_details_rizhiwajueshi'),
            value: this.formatTime(logTime)
          },
          {
            label: this.$t('public_external_memory_name'),
            value: externalStorage.name
          },
          {
            label: this.$t('public_external_memory_type'),
            value: EXTERNAL_STORAGE_TYPE_MAP[externalStorage.type]
          },
          {
            label: this.$t('public_external_memory_table'),
            value: externalStorage.table
          },
          {
            label: this.$t('public_external_memory_info'),
            value: uriInfo,
            block: true,
            class: 'text-break'
          }
        ]
      })
    },

    formatTime(date, f = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(f) : '-'
    },

    getSharedCacheData(id) {
      sharedCacheApi.findOne(id).then(data => {
        externalStorageApi.get(data.externalStorageId).then((ext = {}) => {
          if (!ext.name) {
            this.infoList = []
            return
          }
          this.infoList = [
            // {
            //   label: i18n.t('packages_dag_monitor_leftsider_huancunkaishishi'),
            //   value: dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss')
            // },
            {
              label: i18n.t('public_external_memory_name'),
              value: ext.name
            },
            {
              label: i18n.t('public_external_memory_type'),
              value: EXTERNAL_STORAGE_TYPE_MAP[ext.type]
            },
            {
              label: i18n.t('public_external_memory_table'),
              value: ext.table
            },
            {
              label: i18n.t('public_external_memory_info'),
              value: ext.uri
            }
          ]
        })
      })
    },

    async getBasicInformation() {
      const map = {
        SharedMiningMonitor: this.getCollectorData,
        SharedCacheMonitor: this.getSharedCacheData
      }
      map[this.$route.name]?.(this.dataflow.id)
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
  z-index: unset; // 防止侧边栏出现的dialog被节点覆盖
  overflow: visible;
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

    .chart__radio {
      .el-radio-button--mini .el-radio-button__inner {
        padding: 4px 8px;
      }
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
.sync-info-item__title {
  display: inline-block;
  width: 110px;

  & + span {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
}
</style>
