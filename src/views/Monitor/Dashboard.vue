<template>
  <section class="monitor-dashboard-wrap flex flex-column flex-fill overflow-hidden" v-loading="loading">
    <div v-if="task" class="flex align-items-center g-panel-container">
      <div class="monitor-icon rounded-circle overflow-hidden mr-6 p-3">
        <img src="../../../public/images/task/console.png" />
      </div>
      <div class="base-info flex-fill">
        <div class="flex align-items-center">
          <ElLink class="fs-7 mr-4" type="primary">任务名称: {{ task.name }}</ElLink>
          <img v-if="task.isFinished" style="height: 25px" src="../../../public/images/task/yiwancheng.png" alt="" />
          <StatusTag v-else type="text" target="task" :status="task.status" only-img></StatusTag>
        </div>
        <div class="mt-1">创建人: {{ task.creator }}</div>
        <div class="mt-2">
          <VButton type="primary" @click="start">启动</VButton>
          <VButton @click="stop">停止</VButton>
          <VButton @click="reset">重置</VButton>
          <VButton @click="forceStop">强制停止</VButton>
        </div>
      </div>
      <div class="input-and-output flex align-center">
        <span>总输出</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{ task.totalOutput }}</span>
        <span class="ml-6">总输入</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{ task.totalInput }}</span>
      </div>
    </div>
    <div v-if="task" class="dashboard-main flex mt-6 flex-fill overflow-hidden">
      <div class="panel-left h-100 overflow-auto p-6">
        <div class="info-item">
          <span class="font-color-sub">任务类型: </span>
          <span class="font-color-main">{{ task.typeText }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">本次执行时间: </span>
          <span class="font-color-main">{{ task.startTimeFmt }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">本次结束时间: </span>
          <span class="font-color-main">{{ task.endTimeFmt }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">增量所处时间点: </span>
          <span class="font-color-main">{{ task.cdcTimeFmt }}</span>
        </div>
        <div class="info-item info-title fs-7">源端信息</div>
        <div class="info-item">
          <span class="font-color-sub">节点名称: </span>
          <span class="font-color-main">{{ task.sourceName }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">所属库: </span>
          <span class="font-color-main">{{ task.sourceDB }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库地址: </span>
          <span class="font-color-main">{{ task.sourceUrl }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库类型: </span>
          <span class="font-color-main">{{ task.sourceType }}</span>
        </div>
        <div class="info-item info-title fs-7">目标端信息</div>
        <div class="info-item">
          <span class="font-color-sub">节点名称: </span>
          <span class="font-color-main">{{ task.targetName }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">所属库: </span>
          <span class="font-color-main">{{ task.targetDB }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库地址: </span>
          <span class="font-color-main">{{ task.targetUrl }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库类型: </span>
          <span class="font-color-main">{{ task.targetType }}</span>
        </div>
      </div>
      <div class="panel-right flex-fill h-100 overflow-hidden p-6">
        <ElTabs class="dashboard-tabs flex flex-column overflow-hidden h-100" v-model="activeTab" @tab-click="tabClick">
          <ElTabPane label="任务进度" name="progress">用户管理</ElTabPane>
          <ElTabPane label="运行日志" name="log">配置管理</ElTabPane>
          <ElTabPane class="h-100 overflow-hidden" label="任务里程碑" name="milestone">
            <ElTable fit height="100%" empty-text="此任务尚未启动或已被重置，暂无运行里程碑数据" :data="milestoneList">
              <ElTableColumn label="任务详情" prop="label"></ElTableColumn>
              <ElTableColumn label="状态" prop="status" width="100px"></ElTableColumn>
              <ElTableColumn label="时间" prop="fromNow" width="160px"></ElTableColumn>
            </ElTable>
          </ElTabPane>
          <ElTabPane label="同步内容" name="content">
            <FieldMapping ref="fieldMapping" :readOnly="true"></FieldMapping>
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
  </section>
</template>
<style lang="scss">
.monitor-dashboard-wrap {
  line-height: 22px;
  .monitor-icon {
    width: 55px;
    height: 55px;
    background: rgba(44, 101, 255, 0.08);
    box-sizing: border-box;
    img {
      display: block;
      height: 100%;
      width: 100%;
    }
  }
  .dashboard-main {
    background: #fff;
    border-radius: 4px;
  }
  .info-title {
    font-weight: 500;
  }
  .info-item {
    margin-bottom: 24px;
  }
  .panel-left {
    width: 340px;
    border-right: 1px solid #f2f2f2;
    box-sizing: border-box;
  }
  .panel-right {
    box-sizing: border-box;
  }
  .dashboard-tabs .el-tabs__content {
    flex: 1;
  }
}
</style>
<script>
import StatusTag from '@/components/StatusTag'
import FieldMapping from '@/components/FieldMappings'
export default {
  components: { StatusTag, FieldMapping },
  data() {
    return {
      loading: true,
      task: null,
      activeTab: 'milestone'
    }
  },
  created() {
    this.getData()
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
  methods: {
    getData() {
      this.loading = true
      this.$axios
        .get(`tm/api/Dataflows/${this.$route.params.id}`)
        .then(data => {
          this.task = this.formatTask(data)
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatTask(data) {
      data.totalOutput = data.stats?.output?.rows || 0
      data.totalInput = data.stats?.input?.rows || 0
      data.creator = data.username || data.user.username || '-'
      data.typeText = data.mappingTemplate === 'cluster-clone' ? '迁移任务' : '同步任务'
      let timeFmt = 'YYYY-MM-DD HH:mm:ss'
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.$moment(data.startTime).format(timeFmt) || '-'
      data.endTimeFmt = this.$moment(data.finishTime).format(timeFmt) || '-'
      data.cdcTimeFmt = this.$moment(cdcTime).format(timeFmt) || '-'
      let stages = data.stages || []
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
      data.sourceName = source.name
      data.targetName = target.name
      data.sourceType = source.databaseType || source.database_type
      data.targetType = target.databaseType || target.database_type
      return data
    },
    tabClick(val) {
      if (val.name === 'content') {
        this.$refs.fieldMapping.getMetaData(this.task)
      }
    },
    start() {},
    stop() {},
    reset() {},
    forceStop() {}
  }
}
</script>
