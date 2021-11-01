<template>
  <div class="">
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
      <ElStep v-if="taskType !== 'cdc'" icon="icon">
        <div slot="title">全量同步</div>
        <div slot="description"></div>
      </ElStep>
      <ElStep v-if="taskType !== 'initial_sync'" icon="icon">
        <div slot="title">增量同步</div>
        <div slot="description"></div>
      </ElStep>
    </ElSteps>
    <!--  任务初始化  -->
    <div v-if="active === 1">
      <!--  里程碑  -->
      <Milestone :task="task" class="table-list"></Milestone>
    </div>
    <!--  结构迁移  -->
    <div v-else-if="active === 2">
      <div class="mb-4 fs-7 font-color-main fw-bolder">
        <div>任务里程碑</div>
        <Milestone :task="task" class="table-list"></Milestone>
      </div>
      <div>
        <div class="mb-4 fs-7 font-color-main fw-bolder">结构迁移概览</div>
        <div class="p-4" style="background: #fafafa; border-radius: 4px 4px 0 0">
          <div class="flex justify-content-between mb-2">
            <div><span>计划迁移表数量 100</span><span>已完成迁移表量 100</span></div>
            <div>预计迁移完成时间：24小时23分1秒</div>
          </div>
          <ElProgress :percentage="50"></ElProgress>
        </div>
      </div>
      <div class="mt-4">
        <div class="fw-bolder">迁移详情</div>
        <FilterBar v-model="searchParams" :items="items" hide-refresh></FilterBar>
        <TableList :columns="migrateColumns" class="table-list"></TableList>
      </div>
    </div>

    <div v-else-if="active === 3">
      <!--   全量   -->
      <!--   增量   -->
      <!--   全量+增量   -->
    </div>
    <!--  增量同步  -->
    <div v-else-if="active === 4">
      <!--   全量+增量任务   -->
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
      searchParams: {
        tableName: '',
        type: ''
      },
      migrateColumns: [
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
    }
  },
  computed: {
    taskType() {
      return this.task?.setting?.sync_type
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
      console.log('task', this.task)
      this.getSearchItems()
      this.loadStep()
    },
    loadStep() {
      this.active = 2
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
.table-list {
  height: 300px;
}
</style>
