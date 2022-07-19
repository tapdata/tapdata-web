<template>
  <ElDialog
    title="全量信息详情"
    width="774px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    @close="$emit('input', false)"
  >
    <VTable :remoteMethod="remoteMethod" :columns="columns" ref="table" class="table-list">
      <template slot="progress" slot-scope="scope">
        <ElProgress color="#2C65FF" :percentage="scope.row.progress" style="font-size: 12px !important"></ElProgress>
      </template>
      <template slot="structureStatus" slot-scope="scope">
        <span v-if="scope.row.structureStatus" :class="['status-' + scope.row.structureStatus.status, 'status-block']">
          {{ scope.row.structureStatus.text }}
        </span>
      </template>
      <template slot="syncStatus" slot-scope="scope">
        <span v-if="scope.row.syncStatus" :class="['status-' + scope.row.syncStatus.status, 'status-block']">
          {{ scope.row.syncStatus.text }}
        </span>
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text">重试</ElButton>
        </div>
      </template>
    </VTable>
  </ElDialog>
</template>

<script>
import { VTable } from '@tap/component'
import { subtaskApi } from '../../../../../api'

export default {
  name: 'InitialList',

  components: { VTable },

  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      visible: false,
      columns: [
        {
          label: '源表名',
          prop: 'source',
          width: 180
        },
        {
          label: '目标表名',
          prop: 'target',
          width: 180
        },
        {
          label: '表结构同步',
          prop: 'structureStatus',
          slotName: 'structureStatus',
          width: 80
        },
        {
          label: '数据同步',
          prop: 'progress',
          slotName: 'progress'
        },
        {
          label: '全量同步状态',
          prop: 'syncStatus',
          slotName: 'syncStatus',
          width: 100
        },
        {
          label: '操作',
          prop: 'operation',
          slotName: 'operation',
          width: 60
        }
      ]
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
    }
  },

  methods: {
    //获取全量同步详情表数据
    // getSyncTableData() {
    //   let filter = {
    //     limit: this.pageSize,
    //     skip: (this.currentPage - 1) * this.pageSize
    //   }
    //   subtaskApi.syncTable(this.id, filter).then(data => {
    //     this.syncTableList = data?.items || []
    //     this.tableTotal = data?.total || 0
    //   })
    // },
    remoteMethod({ page }) {
      console.log('remoteMethod', arguments)
      let { current, size } = page
      let where = {}
      let filter = {
        where: where,
        limit: size,
        skip: size * (current - 1)
      }
      let arr = Array(10)
        .fill()
        .map((t, index) => {
          return {
            source: 'table1-dfs-agent-17a' + index,
            target: 'table1-dfs-agent-17a' + index,
            structureStatus: { text: '已完成', status: 'finished' },
            progress: 10 + index,
            syncStatus: { text: '已停止', status: 'stop' }
          }
        })
      return new Promise((resolve, reject) => {
        resolve({
          total: 100,
          data: arr
        })
      })
      // return {
      //   total: 100,
      //   data: arr
      // }
      // return this.$axios
      //   .get('tm/api/DataFlowRecord?filter=' + encodeURIComponent(JSON.stringify(filter)))
      //   .then(data => {
      //     return {
      //       total: data.total,
      //       data: data.items.map(t => {
      //         t.dataFlowName = task.name || '-'
      //         t.startTypeLabel = startTypeMap[t.startType]
      //         return t
      //       })
      //     }
      //   })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-list {
  .el-progress {
    ::v-deep {
      .el-progress__text {
        font-size: 12px !important;
      }
    }
  }
}
</style>
