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
      <NodeLog :dataflow="dataflow" hide-filter class="log-box mt-6 border-top"></NodeLog>
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
          prop: 'type',
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
      console.log('remoteMethod', page, this.searchParams)
      const { ids } = this
      let { current, size } = page
      let filter = {
        where: {
          id: {
            inq: ids
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return logcollectorApi.relateTasks(filter).then(data => {
        const { total, items = [] } = data || {}
        return {
          total,
          data: items
        }
        // return {
        //   total: 10,
        //   data: [
        //     {
        //       id: '1',
        //       name: 'name',
        //       type: 'type',
        //       status: 'running',
        //       creatTime: Date.now()
        //     },
        //     {
        //       id: '2',
        //       name: 'name',
        //       type: 'type',
        //       status: 'running',
        //       creatTime: Date.now()
        //     },
        //     {
        //       id: '3',
        //       name: 'name',
        //       type: 'type',
        //       status: 'stopping',
        //       creatTime: Date.now()
        //     }
        //   ]
        // }
      })
    },

    handleDetail({ taskId }) {
      this.$router.push({
        name: 'TaskMonitor',
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
