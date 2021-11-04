<template>
  <div class="task-progress">
    <div class="task-progress-step-box">
      <ElSteps finish-status="process" align-center class="task-progress-step" :active="active">
        <ElStep v-for="(item, index) in stepData" :key="index" :title="item.label" :description="item.time"></ElStep>
      </ElSteps>
    </div>
    <!-- 任务里程碑 -->
    <ElCollapse v-model="activeNames" class="task-progress-collapse">
      <ElCollapseItem title="任务里程碑" name="1">
        <ElTable :data="milestoneList" class="mt-5">
          <ElTableColumn label="里程碑" prop="label"></ElTableColumn>
          <ElTableColumn label="状态" prop="status" width="180">
            <template v-slot="scope">
              <StatusTag type="text" target="task" :status="getMilestoneStatus(scope.row.status)" only-img></StatusTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="时间" prop="fromNow" width="180"></ElTableColumn>
        </ElTable>
      </ElCollapseItem>
    </ElCollapse>
    <!-- 结构迁移概览 -->
    <div class="task-progress-item pt-5" v-if="this.task.setting.sync_type !== 'initial_sync'">
      <div class="title pb-4">结构迁移概览</div>
      <div class="pl-4 pb-5">
        <div class="pb-1" v-if="task.mappingTemplate === 'custom'">
          <span>计划同步表数量 {{ overviewStats.sourceTableNum }}</span>
          <span class="pl-6">已完成同步表数量 {{ overviewStats.waitingForSyecTableNums }}</span>
          <span class="float-end">预计全量完成还需时间：{{ completeTime }}</span>
        </div>
        <div v-else>
          <span>已迁移{{ overviewStats.sourceTableNum }}张表</span>
          <span class="pl-6">共100张表</span>
        </div>
        <ElProgress class="task-progress-line" :percentage="progressBar"></ElProgress>
      </div>
    </div>
    <div class="task-progress-item pt-5" v-if="this.task.setting.sync_type !== 'initial_sync'">
      <div class="title pb-4">{{ detailsText }}</div>
      <div class="pl-4">
        <div class="task-progress-search-bar">
          <ul class="search-bar">
            <li class="item">
              <el-input
                clearable
                class="input-with-select"
                size="mini"
                v-model="searchParams.keyword"
                placeholder="请输入表名称"
              >
              </el-input>
            </li>
            <li class="ml-6">
              状态：
              <!-- @input="table.fetch(1)" -->
              <el-select clearable size="mini" v-model="searchParams.metaType">
                <el-option v-for="opt in typeList" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
              </el-select>
            </li>
          </ul>
        </div>
        <div class="task-progress-table pt-6">
          <!-- 全量同步 -->
          <template v-if="this.task.setting.sync_type === 'initial_sync+cdc'">
            <ElTable class="progress-info-table" :data="progressInfoData">
              <ElTableColumn label="数据库" prop="name"></ElTableColumn>
              <ElTableColumn label="数据表" prop="name"></ElTableColumn>
              <ElTableColumn label="数据量（行）" prop="name"></ElTableColumn>
              <ElTableColumn label="进度" prop="name"></ElTableColumn>
              <ElTableColumn label="状态" prop="name" width="100"></ElTableColumn>
            </ElTable>
          </template>
          <template v-if="this.task.setting.sync_type === 'cdc'">
            <ElTable class="progress-info-table" :data="progressInfoData">
              <ElTableColumn label="数据库" prop="name"></ElTableColumn>
              <ElTableColumn label="原表名称" prop="name"></ElTableColumn>
              <ElTableColumn label="延迟" prop="name"></ElTableColumn>
              <ElTableColumn label="增量所处时间点" prop="name"></ElTableColumn>
              <ElTableColumn label="操作" prop="name" width="180">
                <VButton @click="handleClear($route.params.id)">清除</VButton>
                <VButton @click="backtracking($route.params.id)">回溯</VButton>
              </ElTableColumn>
            </ElTable>
          </template>
          <ElPagination
            background
            class="mt-3"
            layout="total, sizes, ->, prev, pager, next, jumper"
            :current-page.sync="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="page.size"
            :total="page.total"
            @size-change="fetch(1)"
            @current-change="fetch"
          >
          </ElPagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import StatusTag from '@/components/StatusTag'
export default {
  name: 'TaskPrgress',
  props: {
    task: {
      type: Object,
      default: null
    }
  },
  components: { StatusTag },
  data() {
    return {
      active: 0,
      activeNames: ['1'],
      progressBar: 0,
      completeTime: '',
      overviewStats: {},
      stepData: [
        { label: '任务初始化', time: '2021-12-12 18:00:00' },
        { label: '结构迁移', time: '2021-12-12 18:00:00' }
      ],
      progressInfoData: [], // 详情数据
      searchParams: {
        keyword: '',
        metaType: ''
      },
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      typeList: [
        { label: this.$t('taskProgress.all'), value: 'all' },
        { label: this.$t('taskProgress.running'), value: 'running' },
        { label: this.$t('taskProgress.waiting'), value: 'waiting' }
      ],
      detailsText: '迁移详情' //详情文字
    }
  },
  created() {
    // 任务进度显示
    if (this.task?.setting?.sync_type) {
      let list = []
      switch (this.task.setting.sync_type) {
        case 'initial_sync+cdc':
          list = [
            { label: '全量同步', time: '2021-12-12 18:00:00' },
            { label: '增量同步', time: '2021-12-12 18:00:00' }
          ]
          this.detailsText = '迁移详情'
          break
        case 'initial_sync':
          list = [{ label: '全量同步', time: '2021-12-12 18:00:00' }]
          this.detailsText = '迁移详情'
          break
        default:
          list = [{ label: '增量同步', time: '2021-12-12 18:00:00' }]
          this.detailsText = '增量详情'
      }
      this.stepData.push(list)
    }
  },
  computed: {
    milestoneList() {
      let list = this.task?.milestones || []
      return list.map(m => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
        return {
          label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage,
          tipDisabled: true
        }
      })
    }
  },
  watch: {
    task: {
      deep: true,
      immediate: true,
      handler(data) {
        this.handleData(data)
      }
    }
  },
  methods: {
    fetch() {},
    // 里程碑状态
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    },
    handleData(data) {
      // let currentData = data
      let overview = {}
      let waitingForSyecTableNums = 0
      let completeTime = ''

      if (data?.stats?.overview) {
        overview = JSON.parse(JSON.stringify(data.stats.overview))

        if (overview.currentStatus === undefined) {
          this.$set(overview, 'currentStatus', '未开始')
        }

        if (overview.waitingForSyecTableNums !== undefined) {
          waitingForSyecTableNums = overview.sourceTableNum - overview.waitingForSyecTableNums
        } else {
          waitingForSyecTableNums = 0
        }
        overview.waitingForSyecTableNums = waitingForSyecTableNums

        let num = (overview.targatRowNum / overview.sourceRowNum) * 100
        this.progressBar = num ? num.toFixed(2) * 1 : 0

        let now = new Date().getTime()
        let startTime = new Date(data.runningTime).getTime(),
          runningTime = now - startTime,
          speed = overview.targatRowNum / runningTime
        // lefts = Math.floor((spendTime / 1000) % 60) //计算秒数

        let time = (overview.sourceRowNum - overview.targatRowNum) / speed / 1000

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

      if (data?.stats?.progressGroupByDB?.length) {
        data.stats.progressGroupByDB.forEach(statusItem => {
          let num = (statusItem.targetRowNum / statusItem.sourceRowNum) * 100,
            statusNum = num > 0 ? num.toFixed(2) * 1 : 0
          if (statusItem.statusNum) {
            statusItem.statusNum = statusNum
          } else {
            this.$set(statusItem, 'statusNum', statusNum)
          }
        })
      }
      this.progressGroupByDB = data.stats.progressGroupByDB

      this.completeTime = completeTime

      this.overviewStats = overview
    },
    // 清除
    handleClear() {},
    // 回溯
    backtracking() {}
  }
}
</script>
<style scoped lang="scss">
.task-progress {
  .task-progress-step-box {
    display: flex;
    justify-content: center;
    width: 100%;
    .task-progress-step {
      width: 970px;
      ::v-deep {
        .el-step {
          .el-step__head {
            .el-step__line {
              height: 2px;
              top: 8px;
            }
            .el-step__icon {
              width: 10px;
              height: 10px;
              border-color: #bfbfbf;
              background-color: #bfbfbf;
              .el-step__icon-inner {
                font-weight: normal;
                color: inherit;
                text-indent: -9999px;
              }
            }
          }
          & > .is-process {
            .el-step__icon {
              border-color: #2c65ff;
              background-color: #2c65ff;
            }
            .el-step__title {
              font-weight: 400;
            }
          }

          .el-step__title {
            font-weight: 500;
          }
          .el-step__description {
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }
  .task-progress-collapse {
    border-top: 0;
    ::v-deep {
      .el-collapse-item__header {
        display: block;
        font-weight: 500;
        font-size: 12px;
        color: #000;
        .el-collapse-item__arrow {
          margin-left: 6px;
        }
      }
    }
  }
  .task-progress-search-bar {
    display: flex;
    .search-bar {
      display: flex;
      flex-direction: row;
      li {
        white-space: nowrap;
      }
    }
  }
}
</style>
