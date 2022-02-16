<template>
  <div class="">
    <!--  步骤条  -->
    <ElSteps :active="active" align-center class="mini mb-6 pt-3">
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
      <div v-if="['initial_sync'].indexOf(currentStep.group) === -1">
        <!--  里程碑  -->
        <Milestone :list="milestonesData" :taskStatus="task && task.status" :fold="false"></Milestone>
      </div>
      <!--  结构迁移  -->
      <div v-else>
        <div class="mb-4">
          <Milestone :list="milestonesData" :taskStatus="task && task.status"></Milestone>
        </div>
        <ElDivider class="my-6"></ElDivider>
        <!--   概览   -->
        <Overview v-if="['structure', 'initial_sync']" :info="overviewInfo" :status="task.status"></Overview>
        <div v-if="currentStep.group === 'structure'" class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}{{ $t('task_info_info') }}</div>
          <div></div>
          <TableList
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
          </TableList>
        </div>
        <div v-if="currentStep.group === 'initial_sync'" class="mt-6">
          <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}{{ $t('task_info_info') }}</div>
          <div></div>
          <TableList
            v-if="columns.length"
            ref="initialTableList"
            :data="runtimeInfo.fullSync.tableStatus"
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
      <ElDivider class="my-6"></ElDivider>
      <Overview :info="overviewInfo" :status="task.status"></Overview>
      <div v-if="currentStep.group === 'structure'" class="mt-6">
        <div class="mb-4 fs-7 font-color-main fw-bolder">
          {{ $t('task_info_task_structure') }}{{ $t('task_info_info') }}
        </div>
        <div></div>
        <TableList
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
        </TableList>
      </div>
      <div class="mt-6">
        <div class="mb-4 fs-7 font-color-main fw-bolder">
          {{ $t('task_setting_initial_sync') }}{{ $t('task_info_info') }}
        </div>
        <TableList
          v-if="columns.length"
          :data="runtimeInfo.fullSync.tableStatus"
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
      <div v-if="runtimeInfo.milestones && runtimeInfo.milestones.length" class="mt-6">
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ $t('task_info_task_cdc') }}{{ $t('task_info_info') }}</div>
        <TableList :columns="cdcColumns" :data="list" max-height="300" hide-on-single-page></TableList>
      </div>
    </div>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import Milestone from '../../migrate/details/Milestone'
import Overview from './Overview'
import { formatTime } from '@/utils/util'
import { getOverviewData } from '@/views/task/util'

export default {
  name: 'Schedule',
  components: { TableList, Milestone, Overview },
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
      structureColumns: [], // 结构迁移
      cdcColumns: [], // 增量
      columns: [],
      runtimeInfo: {},
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
      overviewInfo: {
        label: '',
        source: 0,
        success: 0,
        start: new Date().getTime(),
        progressBar: 0,
        completeTime: ''
      },
      groupMap: {
        init: this.$t('task_info_task_init'),
        structure: this.$t('task_info_task_structure'),
        cdc: this.$t('task_info_task_cdc'),
        initial_sync: this.$t('task_setting_initial_sync')
      }
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
      this.loadRuntimeInfo()
      // this.getStep()
      // this.getSearchItems()
      // this.getColumns()
    },
    loadRuntimeInfo() {
      let id = this.$route.params?.subId
      this.$api('SubTask')
        .runtimeInfo(id)
        .then(res => {
          // eslint-disable-next-line
          console.log('loadRuntimeInfo', res)
          this.runtimeInfo = res.data || {}
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
            time: formatTime(el.start) || formatTime(el.end),
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
      this.getOverviewInfo()
    },
    getMilestonesData() {
      this.milestonesData = (this.runtimeInfo?.milestones || [])
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
    getOverviewInfo() {
      const group = this.currentStep.group
      const { groupMap, runtimeInfo, overviewInfo } = this
      const structureMigrate = runtimeInfo?.structureMigrate || {}
      const fullSync = runtimeInfo?.fullSync || {}
      overviewInfo.label = groupMap[group]
      switch (group) {
        case 'structure':
          overviewInfo.source = structureMigrate.tableNum || 0
          overviewInfo.success = structureMigrate.successNum || 0
          overviewInfo.start = structureMigrate.start
            ? new Date(structureMigrate.start).getTime()
            : new Date().getTime()
          break
        case 'initial_sync':
          overviewInfo.source = fullSync.tableNum || 0
          overviewInfo.success = fullSync.successTableNum || 0
          overviewInfo.start = fullSync.start ? new Date(fullSync.start).getTime() : new Date().getTime()
          break
      }
      let { progress, overview, completeTime } = getOverviewData(this.task)
      overviewInfo.progressBar = progress
      overviewInfo.completeTime = completeTime
      this.progressBar = progress
      this.overviewStats = overview
      this.completeTime = completeTime
    },
    getColumns() {
      // 结构迁移
      this.structureColumns = [
        {
          label: this.$t('task_info_source_database'),
          prop: 'connectionName'
        },
        {
          label: this.$t('task_info_source_table'),
          prop: 'table'
        },
        {
          label: this.$t('schedule'),
          prop: 'schedule',
          slotName: 'schedule'
        },
        {
          label: this.$t('task_monitor_status'),
          prop: 'status',
          slotName: 'status'
        }
      ]
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
          label: this.$t('task_info_cdc_time'),
          prop: 'cdcTime',
          dataType: 'time'
        }
      ]
      this.list = (this.task.cdcLastTimes || []).map(item => {
        return {
          cdcTime: item.cdcTime,
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
          label: this.$t('schedule'),
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
      if (['draft', 'pause', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'pause'
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
      return this.$api('DataFlowInsights')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res.data.total,
            data: res.data.items.map(item => {
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
</style>
