<template>
  <div class="task-progress">
    <template v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs'">
      <!--  全量+增量  -->
      <div class="progress-container" v-if="dataFlowSettings.sync_type === 'initial_sync+cdc'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">图片</div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span><el-progress class="el-progress" :percentage="50"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">全量已完成</span>
              </el-col>
              <el-col :span="12">
                <span>增量状态：</span>
                <span class="ml-3 color-green">进行中</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.targetTableNum }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">增量所处时间点：</span>
              <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">增量延迟：</span>
              <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <!--  全量  -->
      <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'initial_sync'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">图片</div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span><el-progress class="el-progress" :percentage="50"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">全量已完成</span>
              </el-col>
              <el-col :span="12">
                <span>增量状态：</span>
                <span class="ml-3 color-green">进行中</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.targetTableNum }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col :span="12">
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
        </div>
        <div class="progress-container__footer mt-border">
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
            <el-col :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.targetTableNum }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col :span="12">
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
import factory from '@/api/factory'

const dataFlowsAPI = factory('DataFlows')

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
      overviewStats: {}
    }
  },
  computed: {
    dataFlowSettings() {
      return this.dataFlow?.setting ?? {}
    }
  },
  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      dataFlowsAPI
        .getOverview()
        .then(res => {
          console.log('res', res)
          if (res?.data) {
            this.overviewStats = res.data?.stats?.overview
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
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
.progress-container__body {
  padding: 24px 16px;
}
.progress-container__overview {
  flex: 1;
  .el-progress {
    flex: 1;
  }
}
.progress-container__img {
  width: 80px;
  background-color: darkgreen;
}
.progress-container__footer {
  margin: 0 16px;
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
}
.footer-item__value {
}
.color-green {
  color: rgba(58, 132, 63, 1);
}
</style>
