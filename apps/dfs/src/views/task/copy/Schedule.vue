<template>
  <div class="schedule-pane">
    <!--  步骤条  -->
    <ElSteps v-if="steps.length" :active="active" align-center class="mini mb-6 pt-3">
      <ElStep v-for="(item, index) in steps" :key="index" :class="[{ 'is-ative': showActive === index + 1 }]">
        <span
          slot="icon"
          :class="['circle-icon', { 'cursor-pointer': index + 1 <= active }]"
          @click="clickStep(index)"
        ></span>
        <div slot="title" :class="[{ 'cursor-pointer': index + 1 <= active }]" @click="clickStep(index)">
          {{ item.label }}
        </div>
        <div
          v-if="item.time"
          slot="description"
          :class="[{ 'cursor-pointer': index + 1 <= active }]"
          @click="clickStep(index)"
        >
          {{ item.time }}
        </div>
      </ElStep>
    </ElSteps>
    <template v-if="steps.length > 0">
      <!--  任务初始化  -->
      <div v-if="['initial_sync', 'cdc'].indexOf(currentStep.group) === -1">
        <!--  里程碑  -->
        <Milestone :list="milestonesData" :taskStatus="task && task.status" :fold="false"></Milestone>
      </div>
      <!--  结构迁移  -->
      <div v-else>
        <div class="mb-2">
          <Milestone :list="milestonesData" :taskStatus="task && task.status"></Milestone>
        </div>
        <ElDivider class="my-1"></ElDivider>
        <!--   概览   -->
        <div v-if="currentStep.group === 'initial_sync'" class="mt-2">
          <div class="mb-3 fs-7 font-color-main fw-bolder">
            {{ currentStep.label }}{{ this.$t('task_info_overview') }}
          </div>
          <div class="p-4" style="background: #fafafa; border-radius: 4px 4px 0 0">
            <div class="flex justify-content-between mb-2 font-color-main">
              <div>
                <span
                  >{{ $t('task_info_plan') }}{{ currentStep.label }}{{ $t('task_info_table_number') }}
                  {{ overviewStats.sourceTableNum || 0 }}</span
                >
                <span class="ml-3"
                  >{{ $t('task_info_completed') }}{{ currentStep.label }}{{ $t('task_info_table_number') }}
                  {{ overviewStats.waitingForSyecTableNums || 0 }}</span
                >
              </div>
              <div>
                {{ $t('task_info_expected') }}{{ currentStep.label }}{{ $t('task_info_completed_time')
                }}{{ $t('field_mapping_field_mapping_dialog_') }}{{ completeTime }}
              </div>
            </div>
            <ElProgress :percentage="progressBar" :show-text="false"></ElProgress>
          </div>
        </div>
        <div v-if="currentStep.group === 'initial_sync'" class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}{{ $t('task_info_info') }}</div>
          <div></div>
          <TableList
            v-if="columns.length"
            ref="initialTableList"
            :remoteMethod="remoteMethod"
            :columns="columns"
            auto-height
            key="initial_sync"
            hide-on-single-page
          >
            <template slot="schedule" slot-scope="scope">
              <span>{{ getSchedule(scope.row) }}</span>
            </template>
            <template slot="status" slot-scope="scope">
              <StatusTag type="text" :statusMap="statusMap" :status="formatStatus(scope.row)"></StatusTag>
            </template>
          </TableList>
        </div>
        <div v-else class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}{{ $t('task_info_info') }}</div>
          <TableList :columns="cdcColumns" :data="list" auto-height hide-on-single-page></TableList>
        </div>
      </div>
    </template>
    <!--  里程碑无分类  -->
    <div v-else>
      <!--  里程碑  -->
      <Milestone :list="milestonesData" :taskStatus="task && task.status" :fold="false"></Milestone>
      <template v-if="isSupport">
        <ElDivider v-if="task.milestones && task.milestones.length" class="my-6"></ElDivider>
        <div v-if="task.milestones && task.milestones.length">
          <div class="mb-4 fs-7 font-color-main fw-bolder">
            {{ currentStep.label }}{{ this.$t('task_info_overview') }}
          </div>
          <div class="p-4" style="background: #fafafa; border-radius: 4px 4px 0 0">
            <div class="flex justify-content-between mb-2 font-color-main">
              <div>
                <span
                  >{{ $t('task_info_plan') }}{{ currentStep.label }}{{ $t('task_info_table_number') }}
                  {{ overviewStats.sourceTableNum || 0 }}</span
                >
                <span class="ml-3"
                  >{{ $t('task_info_completed') }}{{ currentStep.label }}{{ $t('task_info_table_number') }}
                  {{ overviewStats.waitingForSyecTableNums || 0 }}</span
                >
              </div>
              <div>
                {{ $t('task_info_expected') }}{{ currentStep.label }}{{ $t('task_info_completed_time')
                }}{{ $t('field_mapping_field_mapping_dialog_') }}{{ completeTime }}
              </div>
            </div>
            <ElProgress :percentage="progressBar" :show-text="false"></ElProgress>
          </div>
        </div>
        <div v-if="task.milestones && task.milestones.length" class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">
            {{ $t('task_setting_initial_sync') }}{{ $t('task_info_info') }}
          </div>
          <TableList :remoteMethod="remoteMethod" :columns="columns" auto-height key="initial_sync" hide-on-single-page>
            <template slot="schedule" slot-scope="scope">
              <span>{{ getSchedule(scope.row) }}</span>
            </template>
            <template slot="status" slot-scope="scope">
              <StatusTag type="text" :statusMap="statusMap" :status="formatStatus(scope.row)"></StatusTag>
            </template>
          </TableList>
        </div>
        <div v-if="task.milestones && task.milestones.length" class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">
            {{ $t('task_info_task_cdc') }}{{ $t('task_info_info') }}
          </div>
          <TableList :columns="cdcColumns" :data="list" auto-height hide-on-single-page></TableList>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import Milestone from './Milestone'
import { StatusTag } from '@tap/business'
import { getOverviewData, isFinished } from './util'
import timeFunction from '@/mixins/timeFunction'

export default {
  name: 'Schedule',
  components: { TableList, Milestone, StatusTag },
  mixins: [timeFunction],
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      active: 0,
      showActive: 0,
      isClickStep: false,
      steps: [],
      searchParams: {
        tableName: '',
        type: ''
      },
      cdcColumns: [], // 增量
      columns: [],
      list: [],
      overviewStats: {},
      progressBar: 0, // 进度
      completeTime: '-', // 完成时间
      progressGroupByDB: [],
      filterItems: [],
      milestonesData: [], // 里程碑
      statusMap: {
        done: {
          type: 'success',
          text: this.$t('task_info_synced')
        },
        waiting: {
          type: 'primary',
          text: this.$t('task_info_sync_waiting')
        },
        running: {
          type: 'warning',
          text: this.$t('task_info_sync_running')
        },
        pause: {
          type: 'danger',
          text: this.$t('task_info_sync_pause')
        }
      },
      supportList: ['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres']
    }
  },
  computed: {
    taskType() {
      return this.task?.setting?.sync_type
    },
    currentStep() {
      const { steps, active, showActive } = this
      let index = showActive || active
      return steps[index - 1] || {}
    },
    isSupport() {
      const type = this.task?.stages?.find(t => t.outputLanes.length)?.database_type
      return this.supportList.includes(type)
    },
    vikaMappings() {
      let stages = this.task?.stages || []
      return stages.find(t => !!t.inputLanes.length)?.vikaMappings || {}
    },
    qingFlowMappings() {
      let stages = this.task?.stages || []
      return stages.find(t => !!t.inputLanes.length)?.qingFlowMappings || {}
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
      this.getInfo()
      this.getStep()
      this.getSearchItems()
      this.getColumns()
    },
    getInfo() {
      let { progress, overview, completeTime } = getOverviewData(this.task)
      this.progressBar = progress
      this.overviewStats = overview
      this.completeTime = completeTime
    },
    getStep() {
      const { task } = this
      let map = {
        init: this.$t('task_info_task_init'),
        structure: this.$t('task_info_task_structure'),
        cdc: this.$t('task_info_task_cdc'),
        initial_sync: this.$t('task_setting_initial_sync')
      }

      let milestones = task?.milestones || []
      let currentStep
      let stepsData = []
      if (!milestones.length) {
        return
      }
      milestones.forEach(el => {
        let item = stepsData[stepsData.length - 1]
        // 总有几个步骤
        if (el.group && el.group !== item?.group) {
          stepsData.push({
            label: map[el.group],
            time: this.formatTime(el.start) || this.formatTime(el.end),
            group: el.group
          })
        }
        // 判断分组里面是否有：进行中、已完成
        if (['finish', 'running'].includes(el.status)) {
          currentStep = el.group
        }
      })
      if (!currentStep) {
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
      this.milestonesData = this.task.milestones
        .filter(item => item.group === this.currentStep.group)
        .map(m => {
          let time = m.status === 'running' ? this.formatTime(m.start) : this.formatTime(m.end)
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
      // 增量同步
      this.cdcColumns = [
        {
          label: this.$t('task_info_source_database'),
          prop: 'sourceConnectionName'
        },
        {
          label: this.$t('task_info_target_database'),
          prop: 'targetConnectionName'
        },
        {
          label: this.$t('task_info_lag_time'),
          prop: 'replicationLag'
        },
        {
          label: this.$t('task_info_cdc_time'),
          prop: 'cdcTime',
          dataType: 'time'
        }
      ]
      // 滞后时间
      let arr = (this.task?.stats?.stagesMetrics || []).map(t => t.replicationLag) || []
      let replicationLag = Math.max(...arr) || 0
      this.list = (this.task.cdcLastTimes || []).map(item => {
        return {
          cdcTime: item.cdcTime,
          replicationLag: replicationLag,
          sourceConnectionName: item.sourceConnectionName,
          targetConnectionName: item.targetConnectionName
        }
      })

      // 全量同步
      this.columns = [
        {
          label: this.$t('task_info_source_database'),
          prop: 'sourceConnectionName'
        },
        {
          label: this.$t('task_info_source_table'),
          prop: 'sourceTableName'
        },
        {
          label: this.$t('task_info_data_row'),
          prop: 'sourceRowNum'
        },
        {
          label: this.$t('task_info_target_database'),
          prop: 'targetConnectionName'
        },
        {
          label: this.$t('task_info_target_table'),
          prop: 'targetTableName'
        },
        {
          label: this.$t('task_info_amount_sync_data'),
          prop: 'targetRowNum'
        },
        {
          label: this.$t('task_info_completed_schedule'),
          prop: 'schedule',
          slotName: 'schedule'
        },
        {
          label: this.$t('task_monitor_status'),
          prop: 'status',
          slotName: 'status'
        }
      ]
      this.$refs.initialTableList?.fetch?.()
    },
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    },
    getSearchItems() {
      this.filterItems = [
        {
          label: this.$t('task_info_table_name'),
          key: 'tableName',
          type: 'input'
        },
        {
          label: this.$t('task_monitor_status'),
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
          $regex: task.id
        },
        statsType: 'dataFlowDetailsStats',
        'statsData.sourceConnectionId': {
          $regex: source.connectionId
        },
        'statsData.targetConnectionId': {
          $regex: target.connectionId
        }
      }
      let filter = {
        where,
        limit: size,
        skip: (current - 1) * size,
        order: 'createTime DESC'
      }
      return this.$axios
        .get('tm/api/DataFlowInsights?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(res => {
          return {
            total: res.total,
            data: res.items.map(item => {
              let obj = Object.assign(item, item.statsData)
              if (obj.targetDatabaseType === 'vika') {
                obj.targetTableName = this.vikaMappings[obj.sourceTableName]?.name
              } else if (obj.targetDatabaseType === 'qingflow') {
                obj.targetTableName = this.qingFlowMappings[obj.sourceTableName]?.appName
              }
              return obj
            })
          }
        })
    },
    getSchedule(row = {}) {
      const { sourceRowNum, targetRowNum } = row
      let result = 0
      if (sourceRowNum !== 0) {
        result = (targetRowNum / sourceRowNum) * 100
        if (result !== 100) {
          result = result.toFixed(1)
        }
      } else {
        return '100%'
      }
      return result + '%'
    },
    clickStep(index = 0) {
      if (index + 1 > this.active) {
        return
      }
      this.isClickStep = true
      this.showActive = index + 1
      this.getMilestonesData()
    },
    formatStatus(row = {}) {
      let status = row.statsData?.status
      const taskStatus = this.task?.status
      const finished = isFinished(this.task) // isFinished
      if (taskStatus === 'error' && this.getSchedule(row) !== '100%') {
        status = 'pause'
      } else if (finished) {
        status = 'done'
      } else if (taskStatus === 'paused') {
        status = 'waiting'
      } else if (row.sourceRowNum === 0) {
        status = 'done'
      }
      return status
    }
  }
}
</script>

<style lang="scss" scoped>
.circle-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: map-get($color, disable);
}

.el-steps {
  ::v-deep {
    .el-step__head .el-step__icon {
      border: 0;
    }
    .el-step__line {
      height: 2px;
      top: 11px;
      left: 50%;
      right: -50%;
      background-color: map-get($color, disable);
    }
    .is-finish {
      .circle-icon {
        background-color: map-get($color, primary);
      }
      .el-step__line {
        background-color: map-get($color, primary);
      }
    }
    .el-step__description,
    .el-step__description {
      color: map-get($fontColor, sub);
    }
    .is-ative {
      .el-step__title,
      .el-step__description {
        color: map-get($color, primary);
      }
    }
  }
}
.el-divider {
  background-color: #f2f2f2;
}
</style>
