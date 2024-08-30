<template>
  <section class="dataflow-editor layout-wrap vh-100 migrate-monitor-simple">
    <!--头部-->
    <TopHeader
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      :showBottomPanel="showBottomPanel"
      :quota="quota"
      :buttonShowMap="buttonShowMap"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @change-name="handleUpdateName"
      @auto-layout="handleAutoLayout"
      @center-content="handleCenterContent"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @zoom-to="handleZoomTo"
      @showSettings="handleShowSettings"
      @showVerify="handleShowVerify"
      @showBottomPanel="handleShowBottomPanel"
      @locate-node="handleLocateNode"
      @start="handleStart"
      @stop="handleStop"
      @forceStop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @load-data="init"
    >
      <template #status="{ result }">
        <span v-if="result && result[0]" :class="['status-' + result[0].status, 'status-block', 'mr-2']">
          {{ getTaskStatus(result[0].status) }}
        </span>
      </template>
    </TopHeader>
    <section class="layout-wrap layout-has-sider position-relative font-color-light">
      <div v-if="!stateIsReadonly" class="sider-expand-wrap flex justify-center align-center rotate-180">
        <VIcon size="24" class="font-color-light" @click.stop="handleToggleExpand">expand</VIcon>
      </div>
      <!--内容体-->
      <section class="layout-wrap flex-1">
        <main
          id="dfEditorContent"
          ref="layoutContent"
          class="layout-content bg-transparent flex flex-column overflow-hidden flex-1"
        >
          <PaperScroller
            ref="paperScroller"
            :nav-lines="navLines"
            scrollDisabled
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
          >
            <Node
              v-for="n in allNodes"
              :key="n.id"
              :node-id="n.id"
              :node="n"
              :id="NODE_PREFIX + n.id"
              :js-plumb-ins="jsPlumbIns"
              :class="{
                'options-active': nodeMenu.typeId === n.id
              }"
              :dataflow="dataflow"
              :task-type="dataflow.type"
              :sync-type="dataflow.syncType"
              :sample="dagData ? dagData[n.id] : {}"
              :quota="quota"
              :alarm="alarmData ? alarmData.nodes[n.id] : undefined"
              @drag-start="onNodeDragStart"
              @drag-move="onNodeDragMove"
              @drag-stop="onNodeDragStop"
              @deselectAllNodes="deselectAllNodes"
              @deselectNode="nodeDeselectedById"
              @nodeSelected="nodeSelectedById"
              @delete="handleDeleteById"
              @show-node-popover="showNodePopover"
              @open-detail="handleOpenDetail(n)"
              @open-shared-cache="handleOpenSharedCache"
              @refresh-shared-cache="initShareCache"
            ></Node>
          </PaperScroller>

          <div v-if="!allNodes.length && stateIsReadonly" class="absolute-fill flex justify-center align-center">
            <VEmpty large></VEmpty>
          </div>

          <AlarmStatistics
            :alarm-num="alarmData ? alarmData.alarmNum : undefined"
            @showBottomPanel="handleAlarmShowBottomPanel"
          />

          <div class="p-4 pt-0 position-absolute start-0 end-0 bottom-0" style="top: 140px">
            <ElTabs class="nav-no-padding main-tabs tabs-fill">
              <ElTabPane label="任务监控">
                <div class="flex flex-column gap-4 mt-4">
                  <div class="rounded-lg bg-white p-4">
                    <div class="flex gap-3 align-center mb-3">
                      <span class="font-color-dark fs-6 fw-sub">性能指标</span>
                      <div class="inline-flex align-items-center">
                        <TimeSelect
                          :options="timeOptions"
                          :range="timeSelectRange"
                          ref="timeSelect"
                          style="width: 300px"
                          @change="changeTimeSelect"
                        ></TimeSelect>
                        <Frequency :range="timeSelectRange" style="width: 200px" @change="changeFrequency"></Frequency>
                        <ElTooltip transition="tooltip-fade-in" :content="$t('public_button_refresh')">
                          <IconButton class="color-primary" @click="$emit('load-data')"> refresh </IconButton>
                        </ElTooltip>
                      </div>

                      <div class="flex ml-auto">
                        <span>{{ $t('public_task_heartbeat_time') }}:</span>
                        <span>{{ heartbeatTime }}</span>
                      </div>
                    </div>

                    <div class="flex gap-3">
                      <div v-if="dataflow.type !== 'cdc'" class="info-box flex-1 sync-info border rounded-lg p-3">
                        <div class="flex justify-content-between mb-2">
                          <span class="fw-sub fs-7 font-color-normal">{{
                            $t('packages_dag_monitor_leftsider_tongbuxinxi')
                          }}</span>
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
                            <span class="sync-info-item__title">{{
                              $t('packages_dag_monitor_leftsider_quanliangwanchengshi')
                            }}</span>
                            <span>{{ initialData.snapshotDoneAt }}</span>
                          </div>
                          <div v-else class="mb-2 flex justify-content-between">
                            <span class="sync-info-item__title">{{
                              $t('packages_dag_monitor_leftsider_yujiquanliangwan')
                            }}</span>
                            <span v-if="isFileSource" class="flex-1 text-end">{{
                              $t('packages_dag_components_node_zanbuzhichi')
                            }}</span>
                            <span v-else-if="initialData.finishDuration < 0">{{
                              $t('packages_business_task_info_calculating')
                            }}</span>
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
                                <span class="ml-2">{{
                                  totalData.snapshotTableTotal + '/' + totalData.tableTotal
                                }}</span>
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
                            v-if="
                              dataflow.syncType === 'migrate' &&
                              totalData.currentSnapshotTableRowTotal &&
                              !ifEnableConcurrentRead
                            "
                            class="mb-4 flex align-items-center"
                          >
                            <span class="mr-2 sync-info-item__title">{{
                              $t('packages_dag_components_nodedetaildialog_dangqianbiaotongbu')
                            }}</span>
                            <ElProgress
                              class="flex-1 my-2"
                              :show-text="false"
                              :percentage="currentTotalDataPercentage"
                            />
                            <span class="ml-2">{{
                              (totalData.currentSnapshotTableInsertRowTotal || 0) +
                              '/' +
                              (totalData.currentSnapshotTableRowTotal || 0)
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

                      <div v-if="!hideTotalData" class="info-box border flex-1 p-3 bg-white rounded-lg">
                        <div class="flex justify-content-between mb-2">
                          <span class="fw-sub fs-7 font-color-normal">{{
                            $t('packages_dag_monitor_leftsider_renwushijiantong')
                          }}</span>
                        </div>
                        <div v-loading="!eventDataAll" class="flex">
                          <div v-if="eventDataAll" class="w-50 pr-4">
                            <div>{{ $t('public_event_total_input') }}</div>
                            <ElTooltip
                              transition="tooltip-fade-in"
                              placement="top"
                              :content="eventDataAll.inputTotals.toLocaleString()"
                              class="mt-1 mb-4 font-color-normal fw-sub fs-3 din-font"
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
                                class="mt-1 mb-4 font-color-normal fw-sub fs-3 din-font"
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

                      <div class="info-box border rounded-lg p-3 flex-1">
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
                              <span class="inline-flex align-items-center align-self-start">
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
                      </div>
                      <div class="info-box border rounded-lg p-3 flex-1">
                        <div class="line-chart__box mb-2">
                          <div class="flex align-center gap-2">
                            <ElTooltip
                              transition="tooltip-fade-in"
                              placement="top"
                              :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')"
                            >
                              <span class="inline-flex align-items-center">
                                <span class="mr-2 font-color-dark fw-sub">{{
                                  $t('public_event_incremental_delay')
                                }}</span>
                                <VIcon size="16" class="color-primary">info</VIcon>
                              </span>
                            </ElTooltip>
                            <ElTooltip
                              v-if="dataflow.timeDifference > 0"
                              key="retrying"
                              placement="top"
                              :content="
                                $t('packages_dag_monitor_timeDifference', {
                                  val: calcTimeUnit(dataflow.timeDifference)
                                })
                              "
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
                      </div>

                      <!--事件统计·-->

                      <!--调试信息-->
                      <!--<div class="py-2 px-4">
                        <div class="flex justify-content-between mb-2">
                          <span class="fw-sub fs-7 font-color-normal">{{
                            $t('packages_dag_monitor_leftsider_tiaoshixinxi')
                          }}</span>
                        </div>
                        <div class="mb-2 flex justify-content-between">
                          <span>{{ $t('public_task_heartbeat_time') }}:</span>
                          <span>{{ heartbeatTime }}</span>
                        </div>
                      </div>-->
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <!--<div v-if="!hideTotalData" class="info-box flex-1 p-4 bg-white rounded-lg">
                      <div class="flex justify-content-between mb-2">
                        <span class="fw-sub fs-7 font-color-normal">{{
                          $t('packages_dag_monitor_leftsider_renwushijiantong')
                        }}</span>
                      </div>
                      <div v-loading="!eventDataAll" class="flex">
                        <div v-if="eventDataAll" class="w-50 pr-4">
                          <div>{{ $t('public_event_total_input') }}</div>
                          <ElTooltip
                            transition="tooltip-fade-in"
                            placement="top"
                            :content="eventDataAll.inputTotals.toLocaleString()"
                            class="mt-1 mb-4 font-color-normal fw-sub fs-3 din-font"
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
                              class="mt-1 mb-4 font-color-normal fw-sub fs-3 din-font"
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
                    </div>-->

                    <BottomPanel
                      v-if="dataflow && dataflow.status && showBottomPanel"
                      class="rounded-lg bg-white border-top-0 flex-1 h-auto"
                      :dataflow="dataflow"
                      :alarmData="alarmData"
                      :logTotals="logTotals"
                      :taskRecord="taskRecord"
                      :quota="quota"
                      hide-log
                      @load-data="init"
                      ref="bottomPanel"
                      @showBottomPanel="handleShowBottomPanel"
                      @action="handleBottomPanelAction"
                    ></BottomPanel>
                    <ConsolePanel ref="console" @stopAuto="handleStopAuto"></ConsolePanel>
                  </div>
                </div>
              </ElTabPane>

              <ElTabPane label="任务日志">
                <div class="bg-white rounded-lg mt-4">
                  <NodeLog
                    v-if="dataflow && dataflow.status && showBottomPanel"
                    ref="log"
                    :dataflow="dataflow"
                    :alarmData="alarmData"
                    :logTotals="logTotals"
                    :taskRecord="taskRecord"
                    :quota="quota"
                    @action="handleBottomPanelAction"
                  ></NodeLog>
                </div>
              </ElTabPane>
              <ElTabPane label="基本信息" lazy>
                <TaskReadPretty class="mt-4" :task="dataflow"></TaskReadPretty>
                <!--<div class="p-4 mt-4 bg-white rounded-lg">-->
                <!--  <div class="title-prefix-bar mb-4">配置任务</div>-->
                <!--  &lt;!&ndash;<SchemaForm :form="form" :schema="schema" :scope="scope" />&ndash;&gt;-->
                <!--</div>-->
              </ElTabPane>
              <ElTabPane label="高级设置" lazy>
                <TaskSettingsReadPretty class="mt-4" :task="dataflow"></TaskSettingsReadPretty>
              </ElTabPane>
            </ElTabs>
          </div>
        </main>
      </section>

      <!--   节点详情   -->
      <NodeDetailDialog
        v-model="nodeDetailDialog"
        :dataflow="dataflow"
        :node-id="nodeDetailDialogId"
        :timeFormat="timeFormat"
        :range="[firstStartTime, lastStopTime || getTime()]"
        :quotaTime="quotaTime"
        :quotaTimeType="quotaTimeType"
        :getTimeRange="getTimeRange"
        :if-enable-concurrent-read="ifEnableConcurrentRead"
        ref="nodeDetailDialog"
        @load-data="init"
      ></NodeDetailDialog>

      <UpgradeFee
        :visible.sync="upgradeFeeVisible"
        :tooltip="upgradeFeeVisibleTips || $t('packages_business_task_list_nindekeyunxing')"
        :go-page="upgradeFeeGoPage"
      ></UpgradeFee>

      <UpgradeCharges
        :visible.sync="upgradeChargesVisible"
        :tooltip="upgradeChargesVisibleTips || $t('packages_business_task_list_nindekeyunxing')"
        :go-page="upgradeFeeGoPage"
      ></UpgradeCharges>

      <SkipError ref="skipError" @skip="handleSkipAndRun"></SkipError>
    </section>
  </section>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import dagre from 'dagre'
import { observable } from '@formily/reactive'
import { cloneDeep, debounce } from 'lodash'
import Frequency from './components/monitor/components/Frequency'

import i18n from '@tap/i18n'
import { VEmpty, VIcon, IconButton, TimeSelect } from '@tap/component'
import {
  databaseTypesApi,
  externalStorageApi,
  logcollectorApi,
  measurementApi,
  sharedCacheApi,
  taskApi
} from '@tap/api'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import resize from '@tap/component/src/directives/resize'
import {
  ALARM_LEVEL_SORT,
  TASK_STATUS_MAP,
  UpgradeFee,
  UpgradeCharges,
  SkipError,
  EXTERNAL_STORAGE_TYPE_MAP
} from '@tap/business'
import Time from '@tap/shared/src/time'
import SharedMiningEditor from '@tap/business/src/views/shared-mining/Editor'
import SharedCacheDetails from '@tap/business/src/views/shared-cache/Details'
import SharedCacheEditor from '@tap/business/src/views/shared-cache/Editor'

import PaperScroller from './components/PaperScroller'
import TopHeader from './components/monitor/TopHeader'
import LeftSider from './components/monitor/LeftSider'
import Node from './components/monitor/Node'
import { jsPlumb, config } from './instance'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH, NONSUPPORT_CDC, NONSUPPORT_SYNC } from './constants'
import { allResourceIns } from './nodes/loader'
import ConfigPanel from './components/migration/ConfigPanel'
import BottomPanel from './components/monitor/BottomPanel'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import { MoveNodeCommand } from './command'
import NodeDetailDialog from './components/monitor/components/NodeDetailDialog'
import { TIME_FORMAT_MAP, getTimeGranularity } from './components/monitor/util'
import AlarmStatistics from './components/monitor/components/AlarmStatistics'
import ConsolePanel from './components/migration/ConsolePanel'
import MaterializedView from './components/materialized-view/MaterializedView.vue'
import LineChart from './components/monitor/components/LineChart.vue'
import dayjs from 'dayjs'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import { getDataflowCorners } from './helpers'
import NodeLog from '@tap/business/src/components/logs/NodeLog.vue'
import SchemaForm from './components/SchemaForm.vue'
import { createForm, onFieldValueChange } from '@formily/core'
import TaskReadPretty from './components/steps/TaskReadPretty.vue'
import TaskSettingsReadPretty from './components/steps/TaskSettingsReadPretty.vue'

export default {
  name: 'MigrationMonitor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  components: {
    TaskReadPretty,
    SchemaForm,
    NodeLog,
    TimeSelect,
    IconButton,
    LineChart,
    SkipError,
    MaterializedView,
    UpgradeFee,
    UpgradeCharges,
    AlarmStatistics,
    VEmpty,
    ConfigPanel,
    BottomPanel,
    PaperScroller,
    TopHeader,
    Node,
    VIcon,
    NodeDetailDialog,
    ConsolePanel,
    SharedMiningEditor,
    SharedCacheDetails,
    SharedCacheEditor,
    Frequency,
    TaskSettingsReadPretty
  },

  data() {
    const dataflow = observable({
      id: '',
      name: '',
      status: '',
      attrs: {}
    })

    const root = this

    const schema = {
      type: 'object',
      properties: {
        name: {
          title: i18n.t('public_task_name'), //任务名称
          type: 'string',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Input'
          // 'x-validator': `{{(value) => {
          //           return new Promise((resolve) => {
          //             checkName(value).then(data => {
          //               if(data === true) {
          //                 resolve('${repeatNameMessage}')
          //               } else {
          //                 resolve()
          //               }
          //             })
          //           })
          //         }}}`
        },
        type: {
          title: i18n.t('packages_dag_task_setting_sync_type'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Radio.Group',
          default: 'initial_sync+cdc',
          enum: [
            {
              label: i18n.t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
              value: 'initial_sync+cdc'
            },
            {
              label: i18n.t('public_task_type_initial_sync'), //全量
              value: 'initial_sync'
            },
            {
              label: i18n.t('public_task_type_cdc'), //增量
              value: 'cdc'
            }
          ]
        },

        // 目标节点
        'dag.nodes.3': {
          type: 'object',
          properties: {
            existDataProcessMode: {
              type: 'string',
              title: i18n.t('packages_dag_nodes_database_chongfuchulice'),
              default: 'keepData',
              enum: [
                {
                  label: i18n.t('packages_dag_nodes_database_baochimubiaoduan'),
                  value: 'keepData'
                },
                {
                  label: i18n.t('packages_dag_nodes_database_qingchumubiaoduan'),
                  value: 'dropTable',
                  disabled: true
                },
                {
                  label: i18n.t('packages_dag_nodes_targetdatabase_baochimubiaoduan'),
                  value: 'removeData'
                }
              ],
              'x-decorator': 'FormItem',
              'x-component': 'Radio.Group',
              'x-reactions': {
                fulfill: {
                  run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $values.type === "cdc"}}',
                  state: {
                    description: `{{$values.type === "cdc" ? '${i18n.t(
                      'packages_dag_nodes_database_setting_cdc_changjing_desc'
                    )}':''}}`
                  },
                  schema: {
                    // TODO 根据能力改变dataSource
                    'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`
                  }
                }
              }
            }
          }
        },

        // 源节点
        'dag.nodes.0': {
          title: i18n.t('packages_dag_task_setting_sync_type'),
          type: 'object',
          'x-decorator': 'FormItem',
          'x-component': 'SourceDatabaseNode'
        },

        'dag.nodes.0.migrateTableSelectType': {
          title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
          type: 'string',
          default: 'custom',
          'x-display': 'hidden'
        }
      }
    }
    const scope = {
      findNodeById: id => {
        return root.$store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        let node = scope.findNodeById(id)
        const parents = []

        if (!node) return parents

        let parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach(pid => {
          let parent = scope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach(ppid => {
                parents.push(...scope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      }
    }

    return {
      NODE_PREFIX,
      status: 'draft',
      loading: false,
      editable: false,
      isSaving: false,
      jsPlumbIns: jsPlumb.getInstance(config),
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false,

      nodeMenu: {
        show: false,
        type: '',
        typeId: '',
        reference: null,
        data: null,
        connectionData: {}
      },

      dataflow,

      scale: 1,
      showBottomPanel: false,
      timer: null,
      quotaTimeType: '5m',
      quotaTime: [],
      quota: {}, // 指标数据
      nodeDetailDialog: false,
      nodeDetailDialogId: '',
      timeFormat: 'HH:mm:ss',
      dagData: null,
      verifyTotals: null,
      alarmData: null,
      logTotals: [],
      refreshRate: 5000,
      extraEnterCount: 0,
      isReset: false, // 是否重置了
      watchStatusCount: 0,
      taskRecord: {
        total: 0,
        items: []
      },
      upgradeFeeVisible: false,
      upgradeFeeVisibleTips: '',
      upgradeChargesVisible: false,
      upgradeChargesVisibleTips: '',
      noNeedRefresh: false, // 如果进入页面任务是停止运行状态，无需刷新

      lineChartDialog: false,
      initialListDialog: false,
      timeSelectLabel: '',
      collectorData: {
        externalStorage: {}
      },
      infoList: [],
      qpsChartsType: 'count',

      schema,
      scope
    }
  },

  computed: {
    ...mapState('dataflow', ['showConsole']),
    ...mapGetters('dataflow', ['allNodes']),

    formScope() {
      return {
        ...this.scope,
        $settings: this.dataflow
      }
    },

    firstStartTime() {
      const { startTime } = this.dataflow || {}
      return startTime ? new Date(startTime).getTime() : null
    },

    lastStopTime() {
      const { stopTime } = this.dataflow || {}
      return stopTime ? new Date(stopTime).getTime() : null
    },

    isEnterTimer() {
      return (
        this.quotaTimeType !== 'custom' &&
        !this.nodeDetailDialog &&
        ['running', 'stopping'].includes(this.dataflow?.status)
      )
    },

    timeSelectRange() {
      const { firstStartTime, lastStopTime } = this
      let end = lastStopTime
      if (['running'].includes(this.dataflow.status)) {
        end = Time.now()
      }
      if (end < firstStartTime) {
        end = firstStartTime + 5 * 60 * 1000
      }
      return [firstStartTime, end || Time.now()]
    },

    ifEnableConcurrentRead() {
      if (this.dataflow.syncType !== 'migrate') return false

      const sourceNode = this.allNodes.find(node => !node.$inputs.length && node.type === 'database')

      return sourceNode?.enableConcurrentRead
    },

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
    'dataflow.type'(v) {
      v && this.init()
    },
    'dataflow.status'(v1, v2) {
      this.watchStatusCount++

      if (this.watchStatusCount === 1) {
        // 进入页面后首次执行
        const flag = ['renewing', 'renew_failed'].includes(v1)
        this.toggleConsole(flag)
        this.handleBottomPanel(!flag)
        this.noNeedRefresh = ['error', 'schedule_failed', 'stop', 'complete'].includes(v1)
      } else {
        // 状态变化，重置自动刷新状态
        this.noNeedRefresh = false
        this.extraEnterCount = 0
      }

      if (v1 !== v2) {
        this.init()
      }
      this.toggleConnectionRun(v1 === 'running')
    },
    'dataflow.id'() {
      this.getTaskPermissions()
    }
  },

  created() {
    // 进入监控只读
    this.setStateReadonly(true)
  },

  async mounted() {
    this.setValidateLanguage()
    // 收集pdk上节点的schema
    await this.initPdkProperties()
    await this.initNodeType()
    // 加载权限
    await this.getTaskPermissions()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initConnectionType()
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
        this.toggleConnectionRun()
        // this.initWS()
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    })

    this.timeSelectLabel = this.$refs.timeSelect?.getPeriod()?.label
  },

  beforeDestroy() {
    this.command = null
    this.jsPlumbIns?.destroy()
    this.resetWorkspace()
    this.resetState()
    this.$ws.off('editFlush', this.handleEditFlush)
    this.timer && clearInterval(this.timer)
    this.$off('loop-task')
  },

  methods: {
    ...mapMutations('dataflow', ['setPdkPropertiesMap']),

    init: debounce(function () {
      this.timer && clearTimeout(this.timer)
      this.startLoadData()
    }, 200),

    polling() {
      if (
        this.isEnterTimer ||
        (!this.noNeedRefresh &&
          ['error', 'schedule_failed', 'stop', 'complete'].includes(this.dataflow.status) &&
          ++this.extraEnterCount < 4)
      ) {
        this.startLoadData()
      }
    },

    async startLoadData() {
      // 根据周期类型，计算时间范围
      if (this.quotaTimeType === 'lastStart') {
        const { id: taskId } = this.dataflow || {}
        let filter = {}
        await taskApi.records(taskId, filter).then(data => {
          const lastStartDate = data.items?.[0]?.startDate
          if (lastStartDate) {
            this.dataflow.lastStartDate = new Date(lastStartDate).getTime()
          }
        })
      }
      if (this.quotaTimeType !== 'custom') {
        this.quotaTime = this.getTimeRange(this.quotaTimeType)
      }
      this.loadData()
    },

    async initNodeType() {
      this.addResourceIns(allResourceIns)
      await this.loadCustomNode()
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)
      if (data) {
        if (this.destory) return
        const { dag } = data
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        await this.initShareCache() // 共享缓存
        this.bindLoopTaskEvent()

        // 延迟自动布局，等待ResizeObserver
        setTimeout(() => {
          this.handleAutoLayout()
        }, 10)
      }
    },

    bindLoopTaskEvent() {
      this.$off('loop-task')
      this.$on('loop-task', () => {
        if (!this.sharedCacheMap || !Object.keys(this.sharedCacheMap).length) {
          // 在重置后的任务监控页面启动,首次 initShareCache 获取不到数据
          this.initShareCache()
        } else {
          const { usedShareCache = {} } = this.dataflow?.attrs || {}
          this.setNodeShareCache(usedShareCache)
        }
      })
    },

    gotoViewer() {},

    async validate() {
      if (!this.dataflow.name) return this.$t('packages_dag_editor_cell_validate_empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter(node => node.type === 'database')
      if (tableNode.length < 2) {
        return this.$t('packages_dag_editor_cell_validate_none_data_node')
      }

      await this.validateAllNodes()

      const sourceMap = {},
        targetMap = {},
        edges = this.allEdges
      edges.forEach(item => {
        let _source = sourceMap[item.source]
        let _target = targetMap[item.target]

        if (!_source) {
          sourceMap[item.source] = [item]
        } else {
          _source.push(item)
        }

        if (!_target) {
          targetMap[item.target] = [item]
        } else {
          _target.push(item)
        }
      })

      let someErrorMsg = ''
      // 检查每个节点的源节点个数、连线个数、节点的错误状态
      this.allNodes.some(node => {
        const { id } = node
        const minInputs = node.__Ctor.minInputs ?? 1
        const inputNum = targetMap[id]?.length ?? 0

        if (!sourceMap[id] && !targetMap[id]) {
          // 存在没有连线的节点
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
            val1: node.name
          })
          return true
        }

        if (inputNum < minInputs) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
            val1: node.name,
            val2: minInputs
          })
          return true
        }

        if (this.hasNodeError(id)) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
            val1: node.name
          })
          return true
        }
      })

      const nodeNames = []
      let typeName = ''
      // 根据任务类型(全量、增量),检查不支持此类型的节点
      // 脏代码。这里的校验是有节点错误信息提示的，和节点表单校验揉在了一起，但是校验没有一起做
      if (this.dataflow.type === 'initial_sync+cdc') {
        typeName = i18n.t('public_task_type_initial_sync_and_cdc')
        tableNode.forEach(node => {
          if (
            sourceMap[node.id] &&
            (NONSUPPORT_SYNC.includes(node.databaseType) || NONSUPPORT_CDC.includes(node.databaseType))
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'initial_sync') {
        typeName = i18n.t('public_task_type_initial_sync')
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_SYNC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'cdc') {
        typeName = i18n.t('public_task_type_cdc')
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_CDC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') + typeName
            })
          }
        })
      }

      if (nodeNames.length) {
        someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_cunzaibuzhichi', { val1: typeName })
      }

      const accessNodeProcessIdArr = [
        ...tableNode.reduce((set, item) => {
          item.attrs.accessNodeProcessId && set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set())
      ]

      if (accessNodeProcessIdArr.length > 1) {
        // 所属agent节点冲突
        const chooseId = this.dataflow.accessNodeProcessId

        if (!chooseId) {
          // someErrorMsg = `请配置任务运行agent`
          someErrorMsg = `所属agent节点冲突` // 一样提示冲突
        } else {
          let isError = false
          const agent = this.scope.$agentMap[chooseId]
          tableNode.forEach(node => {
            if (node.attrs.accessNodeProcessId && chooseId !== node.attrs.accessNodeProcessId) {
              this.setNodeErrorMsg({
                id: node.id,
                msg: i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi', {
                  val1: agent.hostName,
                  val2: agent.ip
                })
              })
              isError = true
            }
          })
          isError && (someErrorMsg = `所属agent节点冲突`)
        }
      } else if (accessNodeProcessIdArr.length === 1) {
        // 如果画布上仅有一个所属agent，自动设置为任务的agent
        this.$set(this.dataflow, 'accessNodeType', 'MANUALLY_SPECIFIED_BY_THE_USER')
        this.$set(this.dataflow, 'accessNodeProcessId', accessNodeProcessIdArr[0])
      }

      if (someErrorMsg) return someErrorMsg

      // 检查链路的末尾节点类型是否是表节点
      const firstNodes = this.allNodes.filter(node => !targetMap[node.id]) // 链路的首节点
      const nodeMap = this.allNodes.reduce((map, node) => ((map[node.id] = node), map), {})
      if (firstNodes.some(node => !this.isEndOfTable(node, sourceMap, nodeMap))) return `链路的末位需要是一个数据节点`

      return null
    },

    handlePageReturn() {
      const map = {
        migrate: 'migrateList',
        logCollector: 'sharedMining',
        shareCache: 'sharedCache',
        connHeartbeat: 'heartbeatTable'
      }
      this.$router.push({
        name: map[this.dataflow.syncType] || 'dataflowList'
      })
      window.name = null
    },

    handleEdit() {
      switch (this.dataflow.syncType) {
        case 'migrate':
          this.$router.push({
            name: 'MigrateEditor',
            params: { id: this.dataflow.id }
          })
          break
        case 'sync':
          this.$router.push({
            name: 'DataflowEditor',
            params: { id: this.dataflow.id }
          })
          break
        case 'logCollector':
          this.$refs.sharedMiningEditor.open(this.dataflow.id)
          break
        case 'shareCache':
          this.$refs.sharedCacheEditor.open(this.dataflow.id)
          break
      }
    },

    handleShowVerify() {
      this.deselectAllNodes()
      if (this.activeType === 'verify') {
        this.setActiveType(null)
      } else {
        this.setActiveType('verify')
      }
    },

    handleShowBottomPanel() {
      this.toggleConsole(false)
      this.handleBottomPanel(!this.showBottomPanel)
    },

    handleBottomPanel(flag = false) {
      this.showBottomPanel = flag
    },

    handleAlarmShowBottomPanel() {
      //告警错误提示点击跳转到告警列表
      if (!this.showBottomPanel) {
        this.toggleConsole(false)
        this.handleBottomPanel(true)
      }
      this.$nextTick(() => {
        this.$refs.bottomPanel.changeAlertTab('alert')
      })
    },

    async handleStart(skip) {
      const hasError = !skip && (await this.$refs.skipError.checkError(this.dataflow))
      if (hasError) return

      this.isSaving = true
      try {
        this.wsAgentLive()
        await taskApi.start(this.dataflow.id)
        this.$message.success(this.$t('public_message_operation_success'))
        this.isSaving = false
        this.isReset = false
        // this.loadDataflow(this.dataflow?.id)
        await this.openDataflow(this.dataflow?.id)
        this.toggleConsole(false)
        this.handleBottomPanel(true)
      } catch (e) {
        this.handleError(e)
        this.isSaving = false
      }
    },

    handleSkipAndRun() {
      this.handleStart(true)
    },

    getQuotaFilter(type) {
      const { id: taskId, taskRecordId, agentId } = this.dataflow || {}
      const [startAt, endAt] = this.quotaTime
      let params = {
        startAt,
        endAt,
        samples: {}
      }
      const samples = {
        // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
        totalData: {
          tags: {
            type: 'task',
            taskId,
            taskRecordId
          },
          endAt: Time.now(), // 停止时间 || 当前时间
          fields: [
            'inputInsertTotal',
            'inputUpdateTotal',
            'inputDeleteTotal',
            'inputDdlTotal',
            'inputOthersTotal',
            'outputInsertTotal',
            'outputUpdateTotal',
            'outputDeleteTotal',
            'outputDdlTotal',
            'outputOthersTotal',
            'tableTotal', // 任务中源表总数
            'createTableTotal', // 完成建表的数量
            'snapshotTableTotal', // 完成全量的表的数量
            'initialCompleteTime', // 全量完成时间
            'sourceConnection', // 增量信息:源连接、目标连接、增量时间点
            'targetConnection',
            'snapshotDoneAt',
            'snapshotRowTotal',
            'snapshotInsertRowTotal',
            'outputQps',
            'currentSnapshotTableRowTotal',
            'currentSnapshotTableInsertRowTotal',
            'replicateLag',
            'snapshotStartAt',
            'currentEventTimestamp',
            'snapshotDoneCost',
            'outputQpsMax',
            'outputQpsAvg'
          ],
          type: 'instant' // 瞬时值
        },
        // 任务事件统计（条）-所选周期累计
        barChartData: {
          tags: {
            type: 'task',
            taskId,
            taskRecordId
          },
          fields: [
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
          ],
          type: 'difference'
        },
        // qps + 增量延迟
        lineChartData: {
          tags: {
            type: 'task',
            taskId,
            taskRecordId
          },
          fields: ['inputQps', 'outputQps', 'timeCostAvg', 'replicateLag', 'inputSizeQps', 'outputSizeQps', 'qpsType'],
          type: 'continuous' // 连续数据
        },
        // dag数据
        dagData: {
          tags: {
            type: 'node',
            taskId,
            taskRecordId
          },
          fields: [
            'inputInsertTotal',
            'inputUpdateTotal',
            'inputDeleteTotal',
            'inputDdlTotal',
            'inputOthersTotal',
            'outputInsertTotal',
            'outputUpdateTotal',
            'outputDeleteTotal',
            'outputDdlTotal',
            'outputOthersTotal',
            'qps',
            'timeCostAvg',
            'currentEventTimestamp',
            'tcpPing',
            'connectPing',
            'inputTotal',
            'outputTotal',
            'inputQps',
            'outputQps',
            'snapshotRowTotal',
            'snapshotInsertRowTotal',
            'snapshotTableTotal',
            'tableTotal',
            'snapshotSourceReadTimeCostAvg',
            'incrementalSourceReadTimeCostAvg',
            'targetWriteTimeCostAvg',
            'snapshotStartAt',
            'snapshotDoneAt',
            'replicateLag'
          ],
          type: 'instant' // 瞬时值
        },
        agentData: {
          tags: {
            type: 'engine',
            engineId: agentId
          },
          endAt: Time.now(),
          fields: ['memoryRate', 'cpuUsage', 'gcRate'],
          type: 'instant'
        }
      }
      params.samples.data = samples[type]
      return params
    },

    getParams() {
      const { id: taskId, taskRecordId } = this.dataflow || {}
      let params = {
        verifyTotals: {
          uri: `/api/task/auto-inspect-totals`,
          param: {
            id: this.dataflow.id
          }
        },
        alarmData: {
          uri: '/api/alarm/list_task',
          param: {
            taskId
          }
        },
        logTotals: {
          uri: '/api/MonitoringLogs/count',
          param: {
            taskId,
            taskRecordId
          }
        },
        totalData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('totalData')
        },
        barChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('barChartData')
        },
        lineChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('lineChartData')
        },
        dagData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('dagData')
        },
        agentData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('agentData')
        },
        taskRecord: {
          uri: '/api/task/records',
          param: {
            taskId,
            size: 200,
            page: 1
          }
        }
      }
      return params
    },

    loadData() {
      if (!this.dataflow?.id) {
        return
      }
      if (this.isReset) {
        this.loadResetQuotaData()
        return
      }
      measurementApi
        .batch(this.getParams())
        .then(data => {
          const map = {
            verifyTotals: this.loadVerifyTotals,
            alarmData: this.loadAlarmData,
            logTotals: this.loadLogTotals,
            taskRecord: this.loadTaskRecord
          }
          for (let key in data) {
            const item = data[key]
            if (item.code === 'ok') {
              map[key]?.(data[key].data)
            }
          }
          this.loadQuotaData(data)
        })
        .finally(() => {
          this.timer && clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.polling()
          }, this.refreshRate)
        })
    },

    loadQuotaData(data) {
      let quota = {
        samples: {},
        time: [],
        interval: 5000
      }
      let arr = ['totalData', 'barChartData', 'lineChartData', 'dagData', 'agentData']
      arr.forEach(el => {
        const item = data[el]
        if (item.code === 'ok') {
          quota.samples[el] = item.data?.samples?.data
          if (item.data?.interval) {
            quota.interval = item.data.interval
          }
          if (item.data?.time) {
            quota.time = item.data.time
          }
        }
      })
      this.quota = quota
      const granularity = getTimeGranularity(this.quota.interval)
      this.timeFormat = TIME_FORMAT_MAP[granularity]
      this.dagData = this.getDagData(this.quota.samples.dagData)
    },

    loadResetQuotaData() {
      let quota = {
        samples: {},
        time: [],
        interval: 5000
      }
      let arr = ['totalData', 'barChartData', 'lineChartData', 'dagData', 'agentData']
      arr.forEach(el => {
        quota.samples[el] = []
      })
      this.quota = quota
      this.dagData = {}
      this.loadVerifyTotals()
      this.loadAlarmData()
      this.loadLogTotals()
      this.loadTaskRecord()
    },

    loadVerifyTotals(data = {}) {
      const { diffRecords = 0, diffTables = 0, totals = 0, ignore = 0 } = data
      this.verifyTotals = {
        diffRecords,
        diffTables,
        totals,
        ignore
      }
    },

    loadAlarmData(data = {}) {
      const { alarmNum = {}, nodeInfos = [], alarmList = [] } = data
      const { alert = 0, error = 0 } = alarmNum
      const nodes = alarmList
        .filter(t => t.nodeId && t.level)
        .reduce((cur, next) => {
          const index = ALARM_LEVEL_SORT.indexOf(cur[next.nodeId]?.level)
          return {
            ...cur,
            [next.nodeId]: index !== -1 && index < ALARM_LEVEL_SORT.indexOf(next.level) ? cur[next.nodeId] : next
          }
        }, {})
      this.alarmData = {
        alarmNum: {
          alert,
          error
        },
        nodeInfos: nodeInfos.map(t => {
          return Object.assign({}, t, {
            num: t.num || 0
          })
        }),
        alarmList,
        nodes
      }
    },

    loadLogTotals(data = []) {
      this.logTotals = data
    },

    loadTaskRecord(data) {
      if (!data) return
      this.taskRecord = data
    },

    getDagData(data = []) {
      return data.reduce((pre, current) => {
        return { ...pre, [current.tags.nodeId]: current }
      }, {})
    },

    /**
     * 自动布局
     */
    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) return

      let hasMove = false
      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

      dg.setGraph({ nodesep: 120, ranksep: 200, marginx: 0, marginy: 0, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        dg.setNode(NODE_PREFIX + n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
      })
      this.jsPlumbIns.getAllConnections().forEach(edge => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)
      dg.nodes().forEach(n => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          hasMove = true
          oldProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: nodePositionMap[n]
              }
            }
          })
          newProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top]
              }
            }
          })
        }
      })

      hasMove && this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
      this.$refs.paperScroller.autoResizePaper()
      this.handleCenterContent()
    },

    handleCenterContent(ifZoomToFit, paddingX = 0) {
      const nodeIdPrefix = NODE_PREFIX
      const allNodes = this.$store.getters['dataflow/allNodes']
      let { width, height } = this.$refs.paperScroller.windowArea
      const { paperOffset, paperReverseSize, paperScale } = this.$refs.paperScroller

      if (!allNodes.length) return

      let { minX, minY, maxX, maxY } = getDataflowCorners(allNodes, paperScale, nodeIdPrefix)

      height = 120

      minX -= paddingX

      let contentW = maxX - minX
      let contentH = 94
      let scale = Math.min(width / contentW, height / contentH)

      console.log('scale', scale, scale * 24)

      scale = Math.min(1, scale)
      scale = Math.max(0.25, scale)

      contentW *= scale
      contentH *= scale
      this.$refs.paperScroller.changeScale(scale)

      const scrollLeft = paperOffset.left + (minX + paperReverseSize.w) * scale - (width - contentW) / 2
      const scrollTop = paperOffset.top + (minY + paperReverseSize.h) * scale - 24 /* - (height - contentH) / 2*/

      this.$refs.paperScroller.doChangePageScroll(scrollLeft, scrollTop)
    },

    handleChangeTimeSelect(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
      this.init()
    },

    handleChangeFrequency(val) {
      this.refreshRate = val
      this.init()
    },

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime || Time.now()
      if (status === 'running') {
        endTimestamp = Time.now()
      }
      switch (type) {
        case '5m':
          result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
          break
        case '1h':
          result = [endTimestamp - 60 * 60 * 1000, endTimestamp]
          break
        case '1d':
          result = [endTimestamp - 24 * 60 * 60 * 1000, endTimestamp]
          break
        case 'lastStart':
          result = [this.dataflow.lastStartDate, endTimestamp]
          break
        case 'full':
          result = [this.firstStartTime, endTimestamp]
          break
        case 'incremental':
          result = [this.quota.samples?.totalData?.[0].snapshotDoneAt + 10000, endTimestamp]
          break
        default:
          result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
          break
      }
      return result
    },

    handleOpenDetail(node) {
      if (['mem_cache'].includes(node.type)) return
      this.nodeDetailDialogId = node.id
      // 设置弹窗的周期
      this.$refs.nodeDetailDialog.quotaTime = this.quotaTime
      this.$refs.nodeDetailDialog.quotaTimeType = this.quotaTimeType
      this.nodeDetailDialog = true
    },

    handleVerifyDetails(table) {
      let routeUrl = this.$router.resolve({
        name: 'VerifyDetails',
        params: {
          id: this.dataflow?.id
        },
        query: {
          table
        }
      })
      window.open(routeUrl.href)
    },

    handleConnectionList(keyword) {
      let routeUrl = this.$router.resolve({
        name: 'connectionsList',
        query: {
          keyword
        }
      })
      window.open(routeUrl.href)
    },

    handleReset() {
      let msg = this.getConfirmMessage('initialize')
      this.$confirm(msg, '', {
        type: 'warning'
      }).then(async resFlag => {
        if (!resFlag) {
          return
        }
        try {
          this.dataflow.disabledData.reset = true
          this.handleBottomPanel()
          this.toggleConsole(true)
          this.$refs.console?.startAuto('reset') // 信息输出自动加载
          const data = await taskApi.reset(this.dataflow.id)
          this.responseHandler(data, this.$t('public_message_operation_success'))
          if (!data?.fail?.length) {
            this.isReset = true
          }
          // this.init()
          this.loadDataflow(this.dataflow?.id)
        } catch (e) {
          this.handleError(e, this.$t('packages_dag_message_operation_error'))
        }
      })
    },

    /**
     * 显示/隐藏连线动效
     * @param flag
     */
    toggleConnectionRun(flag = this.dataflow.status === 'running') {
      if (flag) {
        this.jsPlumbIns.select().addClass('running')
      } else {
        this.jsPlumbIns.select().removeClass('running')
      }
    },

    /**
     * 初始化连接样式【告警、错误】
     */
    initConnectionType() {
      this.jsPlumbIns.registerConnectionTypes({
        error: {
          paintStyle: { stroke: '#D44D4D' },
          hoverPaintStyle: { stroke: '#D44D4D' }
        },
        warn: {
          paintStyle: { stroke: '#FF932C' },
          hoverPaintStyle: { stroke: '#FF932C' }
        }
      })
    },

    handleStopAuto() {
      setTimeout(() => {
        this.showConsole && this.$refs.console?.autoLoad()
      }, 5000)
    },

    getTime() {
      return Time.now()
    },

    getTaskStatus(type) {
      return TASK_STATUS_MAP[type] || ''
    },

    handleOpenSharedCache(row = {}) {
      this.$refs.sharedCacheDetails?.getData(row.id)
    },

    upgradeFeeGoPage() {
      const routeUrl = this.$router.resolve({
        name: 'createAgent'
      })
      window.open(routeUrl.href, '_blank')
    },

    handleBottomPanelAction(data = {}) {
      if (data.type === 'ScheduleLimit') {
        this.handleShowUpgradeDialog()
      }
    },

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

    initForm() {
      this.scope.$taskId = this.dataflow.id
      this.baseForm = createForm({
        readPretty: true,
        values: this.dataflow
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarW: 356px;
$hoverBg: #e1e1e1;
$radius: 3px;
$baseHeight: 26px;
$sidebarBg: #fff;

.layout-sidebar {
  position: relative;
  z-index: 10;
  display: flex;
  width: $sidebarW;
  height: 100%;
  background-color: $sidebarBg;
  overflow: auto;

  &.--right {
    width: 726px;
  }
}

.layout-wrap {
  display: flex;
  flex: auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  &.layout-has-sider {
    flex-direction: row;
  }
}

.layout-content {
  position: relative;
  background-color: #f9f9f9;
  /*background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJ2LTc2IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZGVmcyBpZD0idi03NSI+PHBhdHRlcm4gaWQ9InBhdHRlcm5fMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCBpZD0idi03NyIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0FBQUFBQSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgaWQ9InYtNzkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl8wKSIvPjwvc3ZnPg==);
  background-color: #f5f8fe;*/

  ::v-deep {
    .connection-highlight,
    .connection-selected {
      path:nth-child(2) {
        stroke: #2c65ff;
      }
      path:nth-child(3) {
        fill: #2c65ff;
        stroke: #2c65ff;
      }
    }

    .remove-connection-label {
      z-index: 1001;
      position: relative;
      padding: 4px;
      border-radius: 100%;
      background-color: #fa6303;
      box-sizing: border-box;

      .remove-connection-btn {
        width: 1em;
        height: 1em;
        font-size: 6px;
        background: transparent
          url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")
          center/1em auto no-repeat;
        transition: font-size 0.15s ease-in-out;
      }

      &:hover {
        .remove-connection-btn {
          font-size: 10px;
        }
      }
    }

    .conn-btn__wrap {
      z-index: 1002;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      &:hover {
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }
    .conn-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 20px;
      background-color: #9bb6ff;
      border-radius: 100%;
      pointer-events: none;
      .v-icon {
        width: 16px;
        height: 16px;
        font-size: 12px;
        background-color: #2c65ff;
        color: #fff;
        border-radius: 100%;
        &__svg {
          width: 1em;
          height: 1em;
        }
      }
    }
  }
}

.nav-line {
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  border-top: 1px dashed #ff5b37;
  border-left: 1px dashed #ff5b37;
}

.select-box {
  position: absolute;
  background: rgba(23, 159, 251, 0.1);
  border: 1px solid #179ffb;
}

.node-view {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.node-view-background {
  position: absolute;
  width: 10000px;
  height: 10000px;
  top: -5000px;
  left: -5000px;
}

.sider-expand-wrap {
  position: absolute;
  z-index: 2;
  left: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0px 0px 30px rgb(0 0 0 / 6%);

  &:hover .v-icon {
    color: map-get($color, primary);
  }
}

.line-chart__box {
  .line-chart {
    margin-top: 8px;
    height: 200px;
  }
}
</style>

<style lang="scss">
.migrate-monitor-simple {
  .paper-scroller-background {
    //background: #f1f2f4 !important;
    background: #f5f6f7 !important;
  }

  .main-tabs {
    .el-tabs__nav-wrap::after {
      background-color: rgba(31, 35, 41, 0.15);
    }
  }
}
</style>
