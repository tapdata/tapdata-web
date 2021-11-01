<template>
  <div class="">
    <!--  步骤条  -->
    <ElSteps :active="active" align-center class="mini">
      <ElStep v-for="(item, index) in steps" :key="index" icon="icon">
        <div slot="title">{{ item.label }}</div>
        <div slot="description"></div>
      </ElStep>
    </ElSteps>
    <!--  任务初始化  -->
    <div v-if="active === 1">
      <!--  里程碑  -->
      <Milestone :task="task" class="table-list"></Milestone>
    </div>
    <!--  结构迁移  -->
    <div v-else>
      <div class="mb-4">
        <div class="fs-7 font-color-main fw-bolder">任务里程碑</div>
        <Milestone :task="task" class="table-list"></Milestone>
      </div>
      <div>
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}概览</div>
        <div class="p-4" style="background: #fafafa; border-radius: 4px 4px 0 0">
          <div class="flex justify-content-between mb-2">
            <div>
              <span>计划迁移表数量 100</span>
              <span class="ml-3">已完成迁移表量 100</span>
            </div>
            <div>预计迁移完成时间：24小时23分1秒</div>
          </div>
          <ElProgress :percentage="50"></ElProgress>
        </div>
      </div>
      <div class="mt-4">
        <div class="mb-4 fs-7 font-color-main fw-bolder">{{ currentStep.label }}详情</div>
        <FilterBar v-model="searchParams" :items="items" hide-refresh></FilterBar>
        <TableList :columns="columns" class="table-list"></TableList>
      </div>
    </div>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import FilterBar from '@/components/FilterBar'
import Milestone from './Milestone'

export default {
  name: 'Schedule',
  components: { TableList, FilterBar, Milestone },
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
      columns: []
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
      this.getStep()
      this.getSearchItems()
      this.getColumns()
    },
    getStep() {
      this.active = 1
      if (this.taskType === 'cdc') {
        this.steps = [
          { label: '任务初始化', key: 'initStep' },
          { label: '结构迁移', key: 'migrateStep' },
          { label: '增量同步', key: 'cdcStep' }
        ]
      } else if (this.taskType === 'initial_sync') {
        this.steps = [
          { label: '任务初始化', key: 'initStep' },
          { label: '结构迁移', key: 'migrateStep' },
          { label: '全量同步', key: 'fullStep' }
        ]
      } else {
        this.steps = [
          { label: '任务初始化', key: 'initStep' },
          { label: '结构迁移', key: 'migrateStep' },
          { label: '全量同步', key: 'fullStep' },
          { label: '增量同步', key: 'cdcStep' }
        ]
      }
    },
    getColumns() {
      let { currentStep } = this
      switch (currentStep) {
        case 'cdcStep':
          this.columns = [
            {
              label: '数据库',
              prop: 'database'
            },
            {
              label: '数据表',
              prop: 'table'
            },
            {
              label: '进度',
              prop: 'schedule'
            },
            {
              label: '状态',
              prop: 'type'
            }
          ]
          break
        case 'fullStep':
          this.columns = [
            {
              label: '数据库',
              prop: 'database'
            },
            {
              label: '数据表',
              prop: 'table'
            },
            {
              label: '进度',
              prop: 'schedule'
            },
            {
              label: '状态',
              prop: 'type'
            }
          ]
          break
      }
    },
    formatTime(time) {
      return time ? this.$moment(time).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    },
    getSearchItems() {
      this.items = [
        {
          label: '表名称',
          key: 'tableName',
          type: 'input'
        },
        {
          label: '状态',
          key: 'type',
          type: 'select',
          options: []
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
//.table-list {
//  height: 300px;
//}
</style>
