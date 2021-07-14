<template>
  <div class="task-progress">
    <!-- v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs'" -->
    <template>
      <!--  全量+增量  -->
      <div class="progress-container" v-if="dataFlowSettings.sync_type === 'initial_sync+cdc'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">
            <img :src="require('@/assets/images/tu.png')" />
          </div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">{{ completeTime }}</span>
              </el-col>
              <el-col :span="12">
                <span>全量状态：</span>
                <span class="ml-3 color-green">{{ overviewStats.status }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
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
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
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
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">
            <img :src="require('@/assets/images/tu.png')" />
          </div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">{{ completeTime }}</span>
              </el-col>
              <el-col :span="12">
                <span>全量状态：</span>
                <span class="ml-3 color-green">{{ overviewStats.status }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
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
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <!--  增量  -->
      <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'cdc'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__footer">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
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
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
// import factory from '@/api/factory'

// const dataFlowsAPI = factory('DataFlows')
// let timer = null
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
      overviewStats: {}
    }
  },
  computed: {
    dataFlowSettings() {
      return this.dataFlow?.setting ?? {}
    }
  },
  watch: {
    // dataFlow: {
    //   deep: true,
    //   handler(data) {
    //     this.handleData(data)
    //   }
    // }
  },
  mounted() {
    // this.init()
    // this.overviewStats = this.dataFlow.overview
    // let self = this
    // if (timer) return
    // timer = setInterval(() => {
    //   self.updateDataFlow()
    // }, 5000)
    this.handleData(this.dataFlow)
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
      let inputCount = data?.stats?.throughput?.inputCount
      if (data?.stats?.overview) {
        let overview = data.stats.overview

        overview.waitingForSyecTableNums = overview.sourceTableNum - overview.waitingForSyecTableNums
        let num = (overview.targatRowNum / overview.sourceRowNum) * 100
        this.progressBar = num.toFixed(0) * 1

        let time = (overview.sourceRowNum - overview.targatRowNum) / inputCount
        let r = ''
        if (time) {
          let s = parseInt(time),
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
          if (m === 0 && h == 0 && d === 0 && s < 60 && s > 0) {
            r = 1 + '分钟'
          }
          // r = parseInt(s) + this.$t('timeToLive.s')
          if (m > 0) {
            r = parseInt(m) + '分钟'
          }
          if (h > 0) {
            r = parseInt(h) + '小时' + r
          }
          if (d > 0) {
            r = parseInt(d) + '天' + r
          }
          this.completeTime = r
        } else {
          this.completeTime = '全量已完成'
        }

        overview.status ===
        (overview.sourceTableNum === overview.waitingForSyecTableNums &&
          overview.sourceRowNum === overview.targatRowNum)
          ? '已完成'
          : '进行中'
        this.overviewStats = overview
      }
    },
    // 跳转详情
    handleInfo() {
      window.open('/#/taskProgressInfo?id=' + this.dataFlow.id, '_blank')
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
.task-progress {
  padding: 24px;
}
.progress-container {
  border: 1px solid #d3d3d3;
  border-radius: 4px;
}
.progress-container__header {
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #d3d3d3;
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
  width: 200px;
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
.task-progress {
  .el-progress-bar {
    width: 60%;
    .el-progress-bar__inner {
      background-color: #51b9e4;
    }
  }
}
</style>
