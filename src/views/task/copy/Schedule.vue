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
                {{ $t('task_info_expected') }}{{ currentStep.label }}{{ $t('task_info_completed_time') }}：{{
                  completeTime
                }}
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
            max-height="300"
            key="initial_sync"
            hide-on-single-page
          >
            <template slot="schedule" slot-scope="scope">
              <span>{{ getSchedule(scope.row) }}</span>
            </template>
          </TableList>
        </div>
        <div v-else class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}{{ $t('task_info_info') }}</div>
          <TableList :columns="cdcColumns" :data="list" max-height="300" hide-on-single-page></TableList>
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
                {{ $t('task_info_expected') }}{{ currentStep.label }}{{ $t('task_info_completed_time') }}：{{
                  completeTime
                }}
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
import { deepCopy, formatTime } from '@/util'

export default {
  name: 'Schedule',
  components: { TableList, Milestone },
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
          color: '',
          text: this.$t('task_info_synced')
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
      let overview = {}
      let completeTime = ''
      let data = this.task
      this.progressBar = 0
      if (data?.stats?.overview) {
        overview = deepCopy(data.stats.overview)
        let { sourceRowNum, targatRowNum, sourceTableNum } = overview
        let waitingForSyecTableNums = 0
        if (overview.waitingForSyecTableNums !== undefined) {
          waitingForSyecTableNums = sourceTableNum - overview.waitingForSyecTableNums
        }
        overview.waitingForSyecTableNums = waitingForSyecTableNums
        let num = sourceRowNum ? (targatRowNum / sourceRowNum) * 100 : 0
        if (num > 100) {
          num = 100
        }
        this.progressBar = num ? num.toFixed(2) * 1 : 0

        let now = new Date().getTime()
        let startTime = new Date(data.runningTime).getTime(),
          runningTime = now - startTime,
          speed = targatRowNum / runningTime

        let time = speed ? (sourceRowNum - targatRowNum) / speed / 1000 : 0

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
            r = 1 + this.$t('task_info_m')
          }
          // r = parseInt(s) + this.$t('timeToLive.s')
          if (m > 0) {
            r = parseInt(m) + this.$t('task_info_m')
          }
          if (h > 0) {
            r = parseInt(h) + this.$t('task_info_h') + r
          }
          if (d > 0) {
            r = parseInt(d) + this.$t('task_info_d') + r
          }
          // 全量未完成 停止任务
          if (['paused', 'error'].includes(data.status)) {
            completeTime = this.$t('task_info_task_stopped') // 任务已停止
          } else {
            completeTime = r
          }
        }

        if (this.progressBar === 100) {
          overview.currentStatus = this.$t('task_info_progress') // 进行中
          completeTime = this.$t('task_info_fully_completed') // 全量已完成
        }
        // 任务暂停、错误  增量状态都为停止
        if (completeTime === this.$t('task_info_fully_completed')) {
          if (['paused', 'error'].includes(data.status)) {
            overview.currentStatus = this.$t('task_info_stopped') // 已停止
          }
        }
      }
      // if (data?.stats?.progressGroupByDB?.length) {
      //   data.stats.progressGroupByDB.forEach(statusItem => {
      //     let num = (statusItem.targetRowNum / statusItem.sourceRowNum) * 100,
      //       statusNum = num > 0 ? num.toFixed(2) * 1 : 0
      //     if (statusItem.statusNum) {
      //       statusItem.statusNum = statusNum
      //     } else {
      //       this.$set(statusItem, 'statusNum', statusNum)
      //     }
      //   })
      // }
      // this.progressGroupByDB = data?.stats?.progressGroupByDB
      this.completeTime = completeTime
      this.overviewStats = overview
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
            time: formatTime(el.start) || formatTime(el.end),
            group: el.group
          })
        }
        // 已完成
        if (el.status !== 'finish' && !currentStep) {
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
          // let time = m.status === 'running' ? formatTime(m.start) : formatTime(m.end)
          let time = formatTime(m.start)
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
      // 迁移一对一 获取滞后时间
      let stageList = []
      let currentItem = {}
      if (this.task?.stages?.length)
        this.task.stages.forEach(stage => {
          if (this.task?.stats?.stagesMetrics?.length) {
            this.task.stats.stagesMetrics.forEach(item => {
              if (stage.inputLanes.includes(item.stageId)) {
                currentItem.targetConnectionId = stage.connectionId
                currentItem.replicationLag = item.replicationLag
              } else if (stage.outputLanes.includes(item.stageId)) {
                currentItem.sourceConnectionId = stage.connectionId
              }
            })
          }
        })
      if (Object.keys(currentItem).length) {
        stageList.push(currentItem)
      }

      ;(this.task.cdcLastTimes || []).forEach(item => {
        stageList.forEach(stage => {
          if (
            item.sourceConnectionId === stage.sourceConnectionId &&
            item.targetConnectionId === stage.targetConnectionId
          ) {
            this.list.push({
              cdcTime: item.cdcTime,
              replicationLag: stage.replicationLag || '0',
              sourceConnectionName: item.sourceConnectionName,
              targetConnectionName: item.targetConnectionName
            })
          }
        })
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
          prop: 'status'
        }
      ]
      this.$refs.initialTableList?.fetch?.()
    },
    getTime(time) {
      return formatTime(parseInt(time))
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
              return Object.assign(item, item.statsData)
            })
          }
        })
    },
    getSchedule(row = {}) {
      const { sourceRowNum, targetRowNum } = row
      let result = 0
      if (sourceRowNum !== 0) {
        result = (targetRowNum / sourceRowNum) * 100
      }
      if (result !== 100) {
        result = result.toFixed(1)
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
