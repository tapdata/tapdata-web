<template>
  <div class="">
    <!--  步骤条  -->
    <VStep
      ref="step"
      align-center
      class="mb-2"
      :hasNumber="false"
      :activeStep="active"
      :stepList="steps"
      :showActive="showActive"
      @activeStep="clickStep"
    ></VStep>
    <template v-if="steps.length > 0">
      <!--  任务初始化  -->
      <div v-if="['initial_sync'].indexOf(currentStep.group) === -1">
        <!--  里程碑  -->
        <Milestone :list="milestonesData" :taskStatus="task && task.status" :fold="false"></Milestone>
        <div v-if="currentStep.group === 'cdc'" class="mt-6">
          <div class="mb-4 fs-7 font-color-dark">
            {{ currentStep.label }}{{ $t('packages_business_task_info_info') }}
          </div>
          <VTable :columns="cdcColumns" :data="list" max-height="300" hide-on-single-page>
            <template slot="operation" slot-scope="scope">
              <ElButton size="mini" type="text" @click="handleClear(scope.row)">{{
                $t('packages_business_button_clear')
              }}</ElButton>
              <ElButton size="mini" type="text" @click="handleRollback(scope.row)">{{
                $t('packages_business_button_rollback')
              }}</ElButton></template
            >
          </VTable>
        </div>
      </div>
      <!--  结构迁移  -->
      <div v-else>
        <div class="mb-4">
          <Milestone :list="milestonesData" :taskStatus="task && task.status"></Milestone>
        </div>
        <ElDivider class="my-6"></ElDivider>
        <!--   概览   -->
        <Overview
          v-if="['initial_sync'].includes(currentStep.group)"
          :info="syncOverViewData"
          :status="task.status"
        ></Overview>
        <div v-if="currentStep.group === 'structure'" class="mt-6">
          <div class="mb-4 fs-7 font-color-dark">
            {{ currentStep.label }}{{ $t('packages_business_task_info_info') }}
          </div>
          <div></div>
          <VTable
            v-if="columns.length"
            ref="initialTableList"
            :data="runtimeInfo.structureMigrate.tableStatus"
            :columns="structureColumns"
            max-height="300"
            key="initial_sync"
            hide-on-single-page
          >
            <template slot="schedule" slot-scope="scope">
              <span>{{ getSchedule(scope.row) }}</span>
            </template>
          </VTable>
        </div>
        <div v-if="currentStep.group === 'initial_sync'" class="mt-6">
          <div class="mb-4 fs-7 font-color-dark">
            {{ currentStep.label }}{{ $t('packages_business_task_info_info') }}
          </div>
          <div></div>
          <VTable
            v-if="columns.length"
            ref="initialTableList"
            :data="syncTableList"
            :columns="columns"
            max-height="300"
            key="initial_sync"
            hide-on-single-page
          >
            <template slot="totalNum" slot-scope="scope">
              <span v-if="scope.row.totalNum === -2">
                <span>{{ $t('packages_business_task_info_overView_error_msg') }} </span>
                <ElTooltip placement="top" :content="scope.row.errorMsg">
                  <VIcon class="link-danger cursor-pointer" size="14">error</VIcon>
                </ElTooltip></span
              >
              <span v-else
                >{{
                  scope.row.totalNum === -1 ? $t('packages_business_task_info_overView_status') : scope.row.totalNum
                }}
              </span>
            </template>
            <template slot="progress" slot-scope="scope">
              <span>{{ scope.row.progress }} %</span>
            </template>
            <template slot="status" slot-scope="scope">
              <span :class="['status-' + scope.row.status, 'status-block', 'mr-2']">
                {{ $t('packages_business_task_info_status_' + scope.row.status) }}
              </span>
            </template>
          </VTable>
          <el-pagination
            @current-change="getSyncTableData"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="tableTotal"
          >
          </el-pagination>
        </div>
        <div v-if="currentStep.group === 'cdc'" class="mt-6">
          <div class="mb-4 fs-7 font-color-dark">
            {{ currentStep.label }}{{ $t('packages_business_task_info_info') }}
          </div>
          <VTable :columns="cdcColumns" :data="list" max-height="300" hide-on-single-page>
            <template slot="operation" slot-scope="scope">
              <ElButton size="mini" type="text" @click="handleClear(scope.row)">{{
                $t('packages_business_button_clear')
              }}</ElButton>
              <ElButton size="mini" type="text" @click="handleRollback(scope.row)">{{
                $t('packages_business_button_rollback')
              }}</ElButton></template
            >
          </VTable>
        </div>
      </div>
    </template>
    <!--  里程碑无分类  -->
    <div v-else>
      <!--  里程碑  -->
      <Milestone :list="milestonesData" :taskStatus="task && task.status" :fold="false"></Milestone>
      <ElDivider class="my-6"></ElDivider>
      <Overview :info="syncOverViewData" :status="task.status"></Overview>
      <div v-if="currentStep.group === 'structure'" class="mt-6">
        <div class="mb-4 fs-7 font-color-dark">
          {{ $t('packages_business_task_info_task_structure') }}{{ $t('packages_business_task_info_info') }}
        </div>
        <div></div>
        <VTable
          v-if="columns.length"
          ref="initialTableList"
          :data="runtimeInfo.structureMigrate.tableStatus"
          :columns="structureColumns"
          max-height="300"
          key="initial_sync"
          hide-on-single-page
        >
          <template slot="schedule" slot-scope="scope">
            <span>{{ getSchedule(scope.row) }}</span>
          </template>
        </VTable>
      </div>
      <div class="mt-6">
        <div class="mb-4 fs-7 font-color-dark">
          {{ $t('packages_business_task_setting_initial_sync') }}{{ $t('packages_business_task_info_info') }}
        </div>
        <VTable
          v-if="columns.length"
          :data="syncTableList"
          :columns="columns"
          max-height="300"
          key="initial_sync"
          hide-on-single-page
        >
          <template slot="schedule" slot-scope="scope">
            <span>{{ getSchedule(scope.row) }}</span>
          </template>
        </VTable>
      </div>
      <div class="mt-6">
        <div class="mb-4 fs-7 font-color-dark">
          {{ $t('packages_business_task_info_task_cdc') }}{{ $t('packages_business_task_info_info') }}
        </div>
        <VTable :columns="cdcColumns" :data="list" max-height="300" hide-on-single-page></VTable>
      </div>
    </div>
    <ElDialog
      width="500px"
      append-to-body
      :title="$t('packages_business_button_rollback')"
      :visible.sync="rollbackVisible"
    >
      <ElRow>
        <ElRow :span="8" style="margin-bottom: 10px">
          <label>{{ $t('packages_business_statistics_schedule_leixing') }}</label>
          <ElSelect v-model="syncPointType" :placeholder="$t('packages_business_statistics_schedule_qingxuanze')">
            <ElOption v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </ElOption>
          </ElSelect>
        </ElRow>
        <ElRow :span="14" v-if="syncPointType !== 'current'">
          <label>{{ $t('packages_business_statistics_schedule_shijian') }}</label>
          <ElDatePicker
            format="yyyy-MM-dd HH:mm:ss"
            style="width: 70%"
            v-model="syncPointDate"
            type="datetime"
            :disabled="syncPointType === 'current'"
          ></ElDatePicker>
        </ElRow>
      </ElRow>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleRollbackClose()">{{ $t('packages_business_button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="submitRollBack()">{{
          $t('packages_business_button_confirm')
        }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'

import { dataFlowInsightsApi, subtaskApi } from '@tap/api'
import { VStep, VTable } from '@tap/component'

import Milestone from '../../migrate/details/Milestone'
import Overview from './Overview'

export default {
  name: 'Schedule',
  components: { VTable, Milestone, Overview, VStep },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      id: '',
      active: 0,
      showActive: 0,
      isClickStep: false,
      steps: [],
      searchParams: {
        tableName: '',
        type: ''
      },
      structureColumns: [], // 结构迁移
      cdcColumns: [], // 增量
      columns: [],
      syncOverViewData: {},
      pageSize: 10,
      currentPage: 1,
      tableTotal: 0,
      syncTableList: [], //全量同步列表数据
      runtimeInfo: {},
      list: [],
      progressGroupByDB: [],
      filterItems: [],
      milestonesData: [], // 里程碑
      statusMap: {
        done: {
          color: '',
          text: this.$t('packages_business_task_info_synced')
        }
      },
      groupMap: {
        init: this.$t('packages_business_task_info_task_init'),
        structure: this.$t('packages_business_task_info_task_structure'),
        cdc: this.$t('packages_business_task_info_task_cdc'),
        initial_sync: this.$t('packages_business_task_setting_initial_sync')
      },
      rollbackVisible: false,
      options: [
        {
          label: i18n.t('packages_business_statistics_schedule_yonghuliulanqi'),
          value: 'localTZ'
        },
        {
          label: i18n.t('packages_business_statistics_schedule_shujukushiqu'),
          value: 'connTZ'
        },
        {
          label: i18n.t('packages_business_statistics_schedule_cike'),
          value: 'current'
        }
      ],
      currentRow: {},
      syncPointType: '',
      syncPointDate: ''
    }
  },
  computed: {
    taskType() {
      return this.task?.setting?.sync_type
    },
    currentStep() {
      const { steps, active, showActive } = this
      let index = showActive || active
      if (steps[index - 1]?.group === 'cdc') {
        this.getCdcTableList()
      } else if (steps[index - 1]?.group === 'initial_sync') {
        this.getSyncOverViewData()
        this.getSyncTableData()
      }
      return steps[index - 1] || {}
    }
  },
  watch: {
    task: {
      deep: true,
      handler(v) {
        v && this.init()
      }
    }
  },
  methods: {
    init() {
      this.id = this.$route.params?.id
      this.loadRuntimeInfo()
      this.getSyncOverViewData() //数据初始化
    },
    loadRuntimeInfo() {
      subtaskApi.runtimeInfo(this.id).then(data => {
        this.runtimeInfo = data || {}
        this.getStep()
        this.getColumns()
      })
    },
    getStep() {
      const { runtimeInfo, groupMap } = this
      let milestones = runtimeInfo?.milestones || []
      let currentStep
      let stepsData = []
      milestones.forEach(el => {
        let item = stepsData[stepsData.length - 1]
        // 总有几个步骤
        if (el.group && el.group !== item?.group) {
          stepsData.push({
            label: groupMap[el.group],
            desc: this.formatTime(el.start) || this.formatTime(el.end),
            group: el.group
          })
        }
        // 已完成
        if (el.status !== 'finish' && !currentStep) {
          currentStep = el.group
        }
      })
      if (!currentStep && milestones.length) {
        currentStep = milestones[milestones.length - 1].group
      }
      this.steps = stepsData
      this.active = (stepsData.findIndex(item => item.group === currentStep) || 0) + 1
      if (!this.isClickStep) {
        this.showActive = this.active
      }
      this.getMilestonesData()
    },
    getMilestonesData() {
      this.milestonesData = (this.runtimeInfo?.milestones || [])
        .filter(item => item.group === this.currentStep.group)
        .map(m => {
          // let time = m.status === 'running' ? formatTime(m.start) : formatTime(m.end)
          let time = this.formatTime(m.start)
          return {
            label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
            status: m.status,
            fromNow: time || '-',
            errorMessage: m.errorMessage,
            tipDisabled: true
          }
        })
    },
    getColumns() {
      // 结构迁移
      this.structureColumns = [
        {
          label: this.$t('packages_business_task_info_source_database'),
          prop: 'connectionName'
        },
        {
          label: this.$t('packages_business_task_info_source_table'),
          prop: 'table'
        },
        {
          label: this.$t('packages_business_task_info_schedule'),
          prop: 'schedule',
          slotName: 'schedule'
        },
        {
          label: this.$t('packages_business_task_monitor_status'),
          prop: 'status',
          slotName: 'status'
        }
      ]
      // 增量同步
      this.cdcColumns = [
        {
          label: this.$t('packages_business_task_info_srcName'),
          prop: 'srcName'
        },
        {
          label: this.$t('packages_business_task_info_srcTableName'),
          prop: 'srcTableName'
        },
        {
          label: this.$t('packages_business_task_info_tgtName'),
          prop: 'tgtName'
        },
        {
          label: this.$t('packages_business_task_info_tgtTableName'),
          prop: 'tgtTableName'
        },
        {
          label: this.$t('packages_business_task_info_cdc_delay'),
          prop: 'delay'
        },
        {
          label: this.$t('packages_business_task_info_cdc_time'),
          prop: 'cdcTime',
          dataType: 'time'
        },
        {
          label: this.$t('packages_business_column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ]
      // 全量同步
      this.columns = [
        {
          label: this.$t('packages_business_task_info_srcName'),
          prop: 'srcName'
        },
        {
          label: this.$t('packages_business_task_info_source_table'),
          prop: 'srcTableName'
        },
        {
          label: this.$t('packages_business_task_info_data_row'),
          prop: 'totalNum',
          slotName: 'totalNum'
        },
        {
          label: this.$t('packages_business_task_info_tgtName'),
          prop: 'tgtName',
          width: 150
        },
        {
          label: this.$t('packages_business_task_info_target_table'),
          prop: 'tgtTableName',
          showOverflowTooltip: true,
          width: 200
        },
        {
          label: this.$t('packages_business_task_info_amount_sync_data'),
          prop: 'finishNumber'
        },
        {
          label: this.$t('packages_business_task_info_schedule'),
          prop: 'progress',
          slotName: 'progress'
        },
        {
          label: this.$t('packages_business_task_monitor_status'),
          prop: 'status',
          slotName: 'status'
        }
      ]
      this.$refs.initialTableList?.fetch?.()
    },
    getTime(time) {
      return this.formatTime(parseInt(time))
    },
    formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(format) : '-'
    },
    getSearchItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_task_info_table_name'),
          key: 'tableName',
          type: 'input'
        },
        {
          label: this.$t('packages_business_task_monitor_status'),
          key: 'type',
          type: 'select',
          items: []
        }
      ]
    },
    remoteMethod({ page }) {
      let { current, size } = page
      let { task } = this
      let stages = task?.stages || []
      let target = null
      let source = null
      stages.forEach(stage => {
        if (stage.inputLanes.length) {
          target = stage
        }
        if (stage.outputLanes.length) {
          source = stage
        }
      })
      let where = {
        dataFlowId: {
          like: task.id
        },
        statsType: 'dataFlowDetailsStats',
        'statsData.sourceConnectionId': {
          like: source.connectionId
        },
        'statsData.targetConnectionId': {
          like: target.connectionId
        }
      }
      let filter = {
        where,
        limit: size,
        skip: (current - 1) * size,
        order: 'createTime DESC'
      }
      return dataFlowInsightsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: (data?.items || []).map(item => {
              return Object.assign(item, item.statsData)
            })
          }
        })
    },
    clickStep(index = 0) {
      if (index + 1 > this.active) {
        return
      }
      this.isClickStep = true
      this.showActive = index + 1
      this.getMilestonesData()
    },
    //获取全量同步详情表数据
    getSyncTableData() {
      let filter = {
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize
      }
      subtaskApi.syncTable(this.id, filter).then(data => {
        this.syncTableList = data?.items || []
        this.tableTotal = data?.total || 0
      })
    },
    //概览信息
    getSyncOverViewData() {
      subtaskApi.syncOverView(this.id).then(data => {
        this.syncOverViewData = data || {}
        this.$emit('sync', data || {})
        this.syncOverViewData.finishDuration = this.handleTime(this.syncOverViewData?.finishDuration)
      })
    },
    handleTime(time) {
      let r = ''
      if (time) {
        let s = time,
          m = 0,
          h = 0,
          d = 0
        if (s > 60) {
          m = parseInt(s / 60)
          s = parseInt(s % 60)
          if (m > 60) {
            h = parseInt(m / 60)
            m = parseInt(m % 60)
            if (h > 24) {
              d = parseInt(h / 24)
              h = parseInt(h % 24)
            }
          }
        }
        if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
          r = 1 + this.$t('packages_business_taskProgress_m')
        }
        // r = parseInt(s) + this.$t('packages_business_timeToLive_s')
        if (m > 0) {
          r = parseInt(m) + this.$t('packages_business_taskProgress_m')
        }
        if (h > 0) {
          r = parseInt(h) + this.$t('packages_business_taskProgress_h') + r
        }
        if (d > 0) {
          r = parseInt(d) + this.$t('packages_business_taskProgress_d') + r
        }
        return r
      }
    },
    //增量同步
    getCdcTableList() {
      subtaskApi.cdcIncrease(this.id).then(data => {
        this.list = data || []
      })
    },
    handleClear(row) {
      subtaskApi.clearIncrease(this.id, row.srcId, row.tgtId).then(() => {
        this.$message.success(this.$t('packages_business_message_update_success'))
      })
    },
    handleRollback(row) {
      this.rollbackVisible = true
      this.currentRow = row
    },
    handleRollbackClose() {
      this.rollbackVisible = false
      this.syncPointType = ''
      this.syncPointDate = ''
    },
    submitRollBack() {
      let systemTimeZone = ''
      let timeZone = new Date().getTimezoneOffset() / 60
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      let params = {
        dateTime: this.syncPointDate,
        pointType: this.syncPointType,
        timeZone: systemTimeZone
      }
      subtaskApi.rollbackIncrease(this.id, this.currentRow.srcId, this.currentRow.tgtId, params).then(() => {
        this.rollbackVisible = false
        this.$message.success(this.$t('packages_business_message_update_success'))
      })
    }
  }
}
</script>
