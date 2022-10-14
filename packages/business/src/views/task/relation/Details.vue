<template>
  <div>
    <div class="my-4 fs-5">标题，xxx任务名称</div>
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
        style="height: 300px"
      >
        <template slot="status" slot-scope="scope">
          <TaskStatus :task="scope.row" />
        </template>
        <template slot="operation" slot-scope="scope" fixed="right">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">详情</ElButton>
          </div>
        </template>
      </VTable>
      <Log :dataflow="dataflow"></Log>
    </div>
  </div>
</template>

<script>
import { connectionsApi } from '@tap/api'
import { VTable } from '@tap/component'
import { TaskStatus } from '@tap/business'
import Log from '@tap/dag/src/components/monitor/components/Log'
import {taskApi} from "../../../../../api";

export default {
  name: 'Details',

  components: {
    VTable,
    TaskStatus,
    Log
  },

  data() {
    return {
      dataflow: null,
      columns: [
        {
          label: '任务名称',
          prop: 'taskName'
        },
        {
          label: '任务类型',
          prop: 'taskType',
          width: 150
        },
        {
          label: '任务状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '创建时间',
          prop: 'created',
          dataType: 'time',
          width: 150
        },
        {
          label: '操作',
          slotName: 'operation',
          fixed: 'right',
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
      taskApi.get(this.id).then(data => {
        this.dataflow = data || {
          id: '123'
        }
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
      return connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: 10,
            data: [
              {
                id: '1',
                taskName: 'taskName',
                taskType: 'taskType',
                status: 'running',
                created: Date.now()
              },
              {
                id: '2',
                taskName: 'taskName',
                taskType: 'taskType',
                status: 'running',
                created: Date.now()
              },
              {
                id: '3',
                taskName: 'taskName',
                taskType: 'taskType',
                status: 'stopping',
                created: Date.now()
              }
            ]
          }
        })
    }
  }
}
</script>

<style scoped></style>
