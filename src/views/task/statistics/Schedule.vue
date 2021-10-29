<template>
  <div>
    <!--  步骤条  -->
    <ElSteps :active="active" align-center class="mini">
      <ElStep icon="icon">
        <div slot="title">任务初始化</div>
        <div slot="description">{{ formatTime(task.createTime) }}</div>
      </ElStep>
      <ElStep icon="icon">
        <div slot="title">结构迁移</div>
        <div slot="description"></div>
      </ElStep>
      <ElStep icon="icon">
        <div slot="title">全量同步</div>
        <div slot="description"></div>
      </ElStep>
      <ElStep icon="icon">
        <div slot="title">增量同步</div>
        <div slot="description"></div>
      </ElStep>
    </ElSteps>
    <!--  里程碑  -->
    <ElTable
      empty-text="此任务尚未启动或已被重置，暂无运行里程碑数据"
      :data="milestoneList"
      height="100%"
      fit
      class="mt-6"
    >
      <ElTableColumn label="里程碑" prop="label"></ElTableColumn>
      <ElTableColumn label="状态" prop="status" width="100px">
        <template slot-scope="scope">
          <StatusTag type="text" target="milestone" :status="getMilestoneStatus(scope.row.status)" only-img></StatusTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="时间" prop="fromNow" width="160px"></ElTableColumn>
    </ElTable>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'

export default {
  name: 'Schedule',
  components: { StatusTag },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      active: 1
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
  methods: {
    formatTime(time) {
      return time ? this.$moment(time).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped></style>
