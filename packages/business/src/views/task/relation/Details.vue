<template>
  <div>
    <div class="my-4 fs-5">{{ dataflow.name || '任务名称' }}</div>
    <div class="bg-white p-6">
      <div class="mb-4 fs-7 fw-bold">使用该关联任务的任务清单</div>
      <VTable
        :columns="columns"
        :remoteMethod="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        ref="table"
        height="300px"
        class="table-list"
        hide-on-single-page
      >
        <template slot="status" slot-scope="scope">
          <TaskStatus :task="scope.row" />
        </template>
        <template slot="operation" slot-scope="scope" fixed="right">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">查看任务</ElButton>
          </div>
        </template>
      </VTable>
      <NodeLog v-if="isShowLog" :dataflow="dataflow" hide-filter class="log-box mt-6 border-top"></NodeLog>
    </div>
  </div>
</template>

<script>
import { taskApi, logcollectorApi } from '@tap/api'
import { VTable } from '@tap/component'
import { TaskStatus } from '@tap/business'
import NodeLog from '../../../components/logs/NodeLog'

export default {
  name: 'Details',

  components: {
    VTable,
    TaskStatus,
    NodeLog
  },

  data() {
    return {
      dataflow: {},
      columns: [
        {
          label: '任务名称',
          prop: 'name'
        },
        {
          label: '任务类型',
          prop: 'typeTitle',
          width: 150
        },
        {
          label: '任务状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '创建时间',
          prop: 'creatTime',
          dataType: 'time',
          width: 150
        },
        {
          label: '操作',
          slotName: 'operation',
          width: 150
        }
      ]
    }
  },

  computed: {
    type() {
      return this.$route.query.type
    },
    isShowLog() {
      return ['logCollector', 'mem_cache'].includes(this.type)
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.getDataflow()
    },

    getDataflow() {
      const { id } = this.$route.params
      taskApi.get(id).then(data => {
        this.dataflow = data
      })
    },

    remoteMethod({ page }) {
      const { id } = this.$route.params
      const { type } = this
      let { current, size } = page
      let filter = {
        taskId: id,
        type,
        page: current,
        size
      }
      const MAP = {
        initial_sync: this.$t('packages_business_task_info_initial_sync'),
        cdc: this.$t('packages_business_task_info_initial_cdc'),
        'initial_sync+cdc':
          this.$t('packages_business_task_info_initial_sync') + '+' + this.$t('packages_business_task_info_initial_cdc')
      }
      return logcollectorApi.relateTasks(filter).then(data => {
        const { total = 0, items = [] } = data || {}
        return {
          total,
          data: items.map(t => {
            t.typeTitle = MAP[t.type]
            return t
          })
        }
      })
    },

    handleDetail({ taskId, syncType }) {
      const MAP = {
        migrate: 'MigrateViewer',
        sync: 'DataflowViewer'
      }
      this.$router.push({
        name: MAP[syncType],
        params: {
          id: taskId
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-list,
.log-box {
  height: 320px;
}
</style>
