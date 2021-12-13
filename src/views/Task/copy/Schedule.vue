<template>
  <div class="">
    <!--  步骤条  -->
    <ElSteps :active="active" align-center class="mini mb-6 pt-3">
      <ElStep v-for="(item, index) in steps" :key="index" :class="[{ 'is-ative': active === index + 1 }]">
        <span slot="icon" class="circle-icon"></span>
        <div slot="title">{{ item.label }}</div>
        <div v-if="item.time && active === index + 1" slot="description">{{ item.time }}</div>
      </ElStep>
    </ElSteps>
    <!--  任务初始化  -->
    <div v-if="['initial_sync', 'cdc'].indexOf(currentStep.group) === -1">
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
      <div v-if="currentStep.group === 'initial_sync'">
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}概览</div>
        <div class="p-4" style="background: #fafafa; border-radius: 4px 4px 0 0">
          <div class="flex justify-content-between mb-2 font-color-main">
            <div>
              <span>计划{{ currentStep.label }}表数量 {{ overviewStats.sourceTableNum || 0 }}</span>
              <span class="ml-3"
                >已完成{{ currentStep.label }}表数量 {{ overviewStats.waitingForSyecTableNums || 0 }}</span
              >
            </div>
            <div>预计{{ currentStep.label }}完成时间：{{ completeTime }}</div>
          </div>
          <ElProgress :percentage="progressBar" :show-text="false"></ElProgress>
        </div>
      </div>
      <div v-if="currentStep.group === 'initial_sync'" class="mt-6">
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}详情</div>
        <div></div>
        <TableList v-if="columns.length" :remoteMethod="remoteMethod" :columns="columns" key="initial_sync">
          <template slot="schedule" slot-scope="scope">
            <span>{{ getSchedule(scope.row) }}</span>
          </template>
        </TableList>
      </div>
      <div v-else class="mt-6">
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}详情</div>
        <TableList :columns="columns" :data="list"></TableList>
      </div>
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
      active: 1,
      steps: [],
      searchParams: {
        tableName: '',
        type: ''
      },
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
          text: '已同步'
        }
      }
    }
  },
  computed: {
    taskType() {
      return this.task?.setting?.sync_type
    },
    currentStep() {
      const { steps, active } = this
      return steps[active - 1] || {}
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
            r = 1 + this.$t('taskProgress.m')
          }
          // r = parseInt(s) + this.$t('timeToLive.s')
          if (m > 0) {
            r = parseInt(m) + this.$t('taskProgress.m')
          }
          if (h > 0) {
            r = parseInt(h) + this.$t('taskProgress.h') + r
          }
          if (d > 0) {
            r = parseInt(d) + this.$t('taskProgress.d') + r
          }
          // 全量未完成 停止任务
          if (['paused', 'error'].includes(data.status)) {
            completeTime = this.$t('taskProgress.taskStopped') // 任务已停止
          } else {
            completeTime = r
          }
        }

        if (this.progressBar === 100) {
          overview.currentStatus = this.$t('taskProgress.progress') // 进行中
          completeTime = this.$t('taskProgress.fullyCompleted') // 全量已完成
        }
        // 任务暂停、错误  增量状态都为停止
        if (completeTime === this.$t('taskProgress.fullyCompleted')) {
          if (['paused', 'error'].includes(data.status)) {
            overview.currentStatus = this.$t('taskProgress.stopped') // 已停止
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
        init: '任务初始化',
        structure: '结构迁移',
        cdc: '增量同步',
        initial_sync: '全量同步'
      }

      let milestones = task?.milestones || []
      let currentStep
      let stepsData = []
      // 测试group
      // milestones.forEach((el, index) => {
      //   if (index + 1 > 9) {
      //     el.group = 'initial_sync'
      //   } else if (index + 1 > 6) {
      //     el.group = 'cdc'
      //   } else if (index + 1 > 3) {
      //     el.group = 'structure'
      //   } else {
      //     el.group = 'init'
      //   }
      // })
      milestones.forEach(el => {
        let item = stepsData[stepsData.length - 1]
        // 总有几个步骤
        if (el.group !== item?.group) {
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
      this.milestonesData = milestones
        .filter(item => item.group === currentStep)
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
      let { currentStep } = this
      switch (currentStep.group) {
        // 增量同步
        case 'cdc':
          this.columns = [
            {
              label: '源数据库',
              prop: 'sourceConnectionName'
            },
            {
              label: '目标数据库',
              prop: 'targetConnectionName'
            },
            {
              label: '增量所处时间点',
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
          break
        // 全量同步
        case 'initial_sync':
          this.columns = [
            {
              label: '源数据库',
              prop: 'sourceConnectionName'
            },
            {
              label: '源数据表',
              prop: 'sourceTableName'
            },
            {
              label: '数据量（行）',
              prop: 'sourceRowNum'
            },
            {
              label: '目标数据库',
              prop: 'targetConnectionName'
            },
            {
              label: '目标数据表',
              prop: 'targetTableName'
            },
            {
              label: '已完成同步数据量（行）',
              prop: 'targetRowNum'
            },
            {
              label: '进度',
              prop: 'schedule',
              slotName: 'schedule'
            },
            {
              label: '状态',
              prop: 'status'
            }
          ]
          break
        // 结果迁移
        // default:
        //   this.columns = [
        //     {
        //       label: '数据库',
        //       prop: 'database'
        //     },
        //     {
        //       label: '数据表',
        //       prop: 'table'
        //     },
        //     {
        //       label: '进度',
        //       prop: 'schedule'
        //     },
        //     {
        //       label: '状态',
        //       prop: 'type'
        //     }
        //   ]
        //   break
      }
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
          label: '表名称',
          key: 'tableName',
          type: 'input'
        },
        {
          label: '状态',
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
      return Promise.all([
        this.$axios.get('tm/api/DataFlowInsights?filter=' + encodeURIComponent(JSON.stringify(filter))),
        this.$axios.get('tm/api/DataFlowInsights/count?where=' + encodeURIComponent(JSON.stringify(where)))
      ]).then(([data, countData]) => {
        return {
          total: countData.count,
          data: data.map(item => {
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
    .is-ative {
      .el-step__line {
        background-color: map-get($color, disable);
      }
    }
  }
}
</style>
