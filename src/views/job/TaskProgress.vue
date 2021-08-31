<template>
  <div class="task-main">
    <div class="task-progress">
      <!-- v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs'" -->
      <template>
        <!--  全量+增量  -->
        <div class="progress-container" v-if="dataFlowSettings.sync_type === 'initial_sync+cdc'">
          <div class="progress-container__header flex justify-between">
            <div class="fw-normal">{{ $t('taskProgress.taskProgressOverview') }}</div>
            <ElLink
              class="progress-header_btn"
              type="primary"
              @click="handleInfo()"
              v-if="
                completeTime !== this.$t('taskProgress.fullyCompleted') && !$window.getSettingByKey('DFS_TCM_PLATFORM')
              "
            >
              {{ $t('taskProgress.seeDetails') }}
            </ElLink>
          </div>
          <div class="progress-tip">{{ $t('taskProgress.tip') }}</div>
          <div class="progress-container__body flex">
            <!--          <div>*目前任务进度查看仅支持： MySQL、Oracle、SQL Server、PostgreSQL和MongoDB</div>-->
            <div class="progress-container__img">
              <img :src="require('@/assets/images/tu.png')" />
            </div>
            <div class="progress-container__overview ml-6">
              <el-row>
                <el-col :span="24" class="flex"
                ><span>{{ $t('taskProgress.fullSyuncProgress') }}：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
                </el-col>
              </el-row>
              <el-row class="mt-3">
                <el-col :span="12">
                  <span>{{ $t('taskProgress.takeTime') }}：</span>
                  <span class="ml-3 color-green">{{ completeTime }}</span>
                </el-col>
                <!--              <el-col :span="12">-->
                <!--                <span>增量状态：</span>-->
                <!--                <span class="ml-3 color-green">{{ overviewStats.currentStatus }}</span>-->
                <!--              </el-col>-->
              </el-row>
            </div>
          </div>
          <div class="progress-container__footer mt-border">
            <!-- <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">源库名称：</span>ya
                <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">目标库名称：</span>
                <span class="footer-item__value">{{ overviewStats.targetName }}</span>
              </el-col>
            </el-row>
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">源库类型：</span>
                <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">目标库类型：</span>
                <span class="footer-item__value">{{ overviewStats.targatType }}</span>
              </el-col>
            </el-row> -->
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_plan_sync_table_num') : $t('taskProgress.planMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag
                      ? $t('taskprogress_completed_sync_table_num')
                      : $t('taskProgress.completedMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
              </el-col>
            </el-row>
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{ mappingFlag ? $t('taskprogress_plan_sync_data') : $t('taskProgress.planMigrateData') }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_completed_sync_data') : $t('taskProgress.completedMigrateData')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
              </el-col>
            </el-row>
            <!-- <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">增量所处时间点：</span>
                <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name">增量延迟：</span>
                <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
              </el-col>
            </el-row> -->
          </div>
        </div>
        <!--  全量  -->
        <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'initial_sync'">
          <div class="progress-container__header flex justify-between">
            <div class="fw-normal">{{ $t('taskProgress.taskProgressOverview') }}</div>
            <ElLink
              class="progress-header_btn"
              type="primary"
              @click="handleInfo()"
              v-if="
                completeTime !== this.$t('taskProgress.fullyCompleted') && !$window.getSettingByKey('DFS_TCM_PLATFORM')
              "
            >{{ $t('taskProgress.seeDetails') }}</ElLink
            >
          </div>
          <div class="progress-tip">{{ $t('taskProgress.tip') }}</div>
          <div class="progress-container__body flex">
            <div class="progress-container__img">
              <img :src="require('@/assets/images/tu.png')" />
            </div>
            <div class="progress-container__overview ml-6">
              <el-row>
                <el-col :span="24" class="flex"
                ><span>{{ $t('taskProgress.fullSyuncProgress') }}：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
                </el-col>
              </el-row>
              <el-row class="mt-3">
                <el-col :span="12">
                  <span>{{ $t('taskProgress.takeTime') }}：</span>
                  <span class="ml-3 color-green">{{ completeTime }}</span>
                </el-col>
                <!--              <el-col :span="12">-->
                <!--                <span>全量状态：</span>-->
                <!--                <span class="ml-3 color-green">{{ overviewStats.status }}</span>-->
                <!--              </el-col>-->
              </el-row>
            </div>
          </div>
          <div class="progress-container__footer mt-border">
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_plan_sync_table_num') : $t('taskProgress.planMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag
                      ? $t('taskprogress_completed_sync_table_num')
                      : $t('taskProgress.completedMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
              </el-col>
            </el-row>
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{ mappingFlag ? $t('taskprogress_plan_sync_data') : $t('taskProgress.planMigrateData') }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_completed_sync_data') : $t('taskProgress.completedMigrateData')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <!--  增量  -->
        <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'cdc'">
          <div class="progress-container__header flex justify-between">
            <div class="fw-normal">{{ $t('taskProgress.taskProgressOverview') }}</div>
            <!--          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>-->
          </div>
          <div class="progress-container__footer">
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_plan_sync_table_num') : $t('taskProgress.planMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag
                      ? $t('taskprogress_completed_sync_table_num')
                      : $t('taskProgress.completedMigrationTableNum')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
              </el-col>
            </el-row>
            <el-row class="footer-line">
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{ mappingFlag ? $t('taskprogress_plan_sync_data') : $t('taskProgress.planMigrateData') }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
              </el-col>
              <el-col class="footer-item" :span="12">
                <span class="footer-item__name"
                >{{
                    mappingFlag ? $t('taskprogress_completed_sync_data') : $t('taskProgress.completedMigrateData')
                  }}：</span
                >
                <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>
    </div>
    <div class="progress-database" v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')">
      <div class="progress-container">
        <div class="progress-container__header flex justify-between">
          <div class="fw-normal">
            {{ mappingFlag ? $t('taskprogress_current_sync') : $t('taskProgress.currentMigration') }}
          </div>
        </div>
        <div class="progress-container__body flex">
          <el-table :data="progressGroupByDB" height="250" border style="width: 100%" class="progress-container__table">
            <el-table-column prop="sourceDbName" :label="$t('taskProgress.sourceLibraryeName')"> </el-table-column>
            <el-table-column
              prop="sourceTableNum"
              :label="mappingFlag ? $t('taskprogress_plan_sync_table_num') : $t('taskProgress.planMigrationTableNum')"
            >
            </el-table-column>
            <el-table-column
              prop="targetRowNum"
              :label="mappingFlag ? $t('taskprogress_plan_sync_data') : $t('taskProgress.planMigrateData')"
            >
            </el-table-column>
            <el-table-column prop="targetDbName" :label="$t('taskProgress.targetLibraryName')"> </el-table-column>
            <el-table-column
              prop="statusNum"
              :label="mappingFlag ? $t('taskprogress_full_sync_progress') : $t('taskProgress.fullMigrationProgress')"
            >
              <template slot-scope="scope">{{ scope.row.statusNum }} %</template>
            </el-table-column>
            <el-table-column :label="$t('taskProgress.operate')">
              <template slot-scope="scope">
                <div v-if="scope.row.statusNum === 100">-</div>
                <el-button type="text" @click="handleInfo(scope.row)" v-else>{{
                    $t('taskProgress.details')
                  }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import factory from '@/api/factory'

// const dataFlowsAPI = factory('DataFlows')
// let timer = null
// import ws from '@/api/ws'
export default {
  name: 'TaskProgress',
  props: {
    dataFlow: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      progressBar: 0,
      completeTime: '',
      overviewStats: {},
      progressGroupByDB: [],
      mappingFlag: false
    }
  },
  computed: {
    dataFlowSettings() {
      return this.dataFlow?.setting ?? {}
    }
  },
  watch: {
    dataFlow: {
      deep: true,
      immediate: true,
      handler(data) {
        this.handleData(data)
      }
    }
  },
  mounted() {
    this.handleData(this.dataFlow)
    if (this.progressData?.length) {
      this.progressData.forEach(item => {
        let num = (item.targatRowNum / item.sourceRowNum) * 100
        item.status = num ? num.toFixed(2) * 1 : 0
      })
    }
    if (window.App.$route.query.mapping === 'custom') {
      this.mappingFlag = true
    }

    //及时更新输入输出的数据
    // ws.on('watch', function (data) {
    //   this.handleData(data)
    // })
  },

  methods: {
    // init() {
    //   this.loadData()
    // },
    // loadData() {
    //   this.loading = true
    //   let id = this.dataFlow.id
    //   console.log('[this.dataFlow.id]', this.dataFlow)
    //   this.overviewStats = this.dataFlow.overview
    //   dataFlowsAPI
    //     .get([id])
    //     .then(res => {
    //       debugger
    //       console.log('res', res)
    //       if (res?.data) {
    //         this.overviewStats = res.data?.stats?.overview
    //       }
    //     })
    //     .catch(e => {
    //       console.log(e, '#####')
    //     })
    //     .finally(() => {
    //       this.loading = false
    //     })
    // },
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
    // 跳转详情
    handleInfo(data) {
      debugger
      if (data) {
        window.open(
          location.href.split('#/')[0] +
          `#/taskProgressInfo?sourceConnectionId=${data.sourceConnectionId}&targetConnectionId=${data.targetConnectionId}&id=${this.dataFlow.id}&mappingFlag=${this.mappingFlag}`,
          '_blank'
        )
      } else {
        window.open(
          location.href.split('#/')[0] + `#/taskProgressInfo?id=${this.dataFlow.id}&mappingFlag=${this.mappingFlag}`,
          '_blank'
        )
      }
    }
  }
  // beforeDestroy() {
  //   // if (timer) {
  //   //   clearTimeout(timer)
  //   //   timer = null
  //   // }
  //   this.editor.destroy()
  // }
}
</script>
<style lang="scss" scoped>
.task-main {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
}
.task-progress,
.progress-database {
  margin-top: 20px;
  overflow: auto;
}
.progress-container {
  height: 100%;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
}
.progress-container__header {
  padding: 10px 16px;
  font-size: 14px;
  justify-content: space-between;
  background: #fafafa;
  border-bottom: 1px solid #d3d3d3;
}
.progress-tip {
  padding: 10px 16px 0;
  font-size: 12px;
  color: #999;
}
.progress-header_btn {
  padding: 0;
}
.progress-container__body {
  padding: 24px 16px;
}
.progress-container__overview {
  flex: 1;
  font-size: 12px;
  color: #9c9c9c;
  .el-progress {
    width: 180px;
    flex: 1;
  }
}
.progress-container__img {
  width: 40px;
  img {
    width: 100%;
  }
  // background-color: darkgreen;
}
.progress-container__table {
}
.progress-container__footer {
  margin: 0 16px 20px;
  padding: 8px;
  &.mt-border {
    border-top: 1px solid #d3d3d3;
  }
}
.footer-line {
}
.footer-item {
  margin-top: 16px;
}
.footer-item__name {
  display: inline-block;
  color: #9c9c9c;
  width: 150px;
  font-size: 12px;
}
.footer-item__value {
  color: #000;
}
.color-green {
  color: rgba(58, 132, 63, 1);
}
</style>
<style lang="scss">
.task-main {
  .task-progress {
    .el-progress-bar {
      width: 60%;
      .el-progress-bar__inner {
        background-color: #51b9e4;
      }
    }
  }
  .progress-database {
    .progress-container__table {
      th {
        padding: 3px 0;
        background-color: #ecf0f5;
        .cell {
          padding: 0 6px;
          color: #1e1e1e;
          white-space: nowrap;
        }
      }
      .el-table__header {
        height: 32px;
      }
    }
  }
}
</style>
