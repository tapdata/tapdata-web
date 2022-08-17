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
      <!--      <template slot="structureStatus" slot-scope="scope">-->
      <!--        <span v-if="scope.row.structureStatus" :class="['status-' + scope.row.structureStatus.status, 'status-block']">-->
      <!--          {{ scope.row.structureStatus.text }}-->
      <!--        </span>-->
      <!--      </template>-->
      <template slot="syncStatus" slot-scope="scope">
        <span :class="['status-' + scope.row.syncStatusType, 'status-block']">
          {{ scope.row.syncStatusText }}
        </span>
      </template>
      <!--      <template slot="operation" slot-scope="scope">-->
      <!--        <div class="operate-columns">-->
      <!--          <ElButton size="mini" type="text">重试</ElButton>-->
      <!--        </div>-->
      <!--      </template>-->
    </VTable>
  </ElDialog>
</template>

<script>
import { VTable } from '@tap/component'
import { measurementApi } from '@tap/api'

export default {
  name: 'InitialList',

  components: { VTable },

  props: {
    dataflow: Object,
    value: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      visible: false,
      statusMap: {
        NOT_START: {
          text: '未开始',
          type: 'waiting'
        },
        PAUSE: {
          text: '已停止',
          type: 'pause'
        },
        DONE: {
          text: '已完成',
          type: 'finish'
        }
      },
      columns: [
        {
          label: '源表名',
          prop: 'originTable',
          width: 180
        },
        {
          label: '目标表名',
          prop: 'targetTable',
          width: 180
        },
        // {
        //   label: '表结构同步',
        //   prop: 'structureStatus',
        //   slotName: 'structureStatus',
        //   width: 80
        // },
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
        }
        // {
        //   label: '操作',
        //   prop: 'operation',
        //   slotName: 'operation',
        //   width: 60
        // }
      ]
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
      if (this.visible) {
        this.init()
      }
    }
  },

  methods: {
    init() {
      this.startLoadData()
    },

    startLoadData() {
      this.$refs.table.fetch?.()
    },

    getFilter(pageObj = {}) {
      let { current = 1, size = 20 } = pageObj
      let filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current
      }
      return filter
    },

    remoteMethod({ page }) {
      let { current, size } = page
      this.pageObj = { current, size }
      let filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current
      }
      return measurementApi.fullStatistics(filter).then(data => {
        return {
          total: data.total || 0,
          data: data.items.map(t => {
            t.progress = Math.floor(t.syncRate * 100)
            t.syncStatusText = this.statusMap[t.fullSyncStatus]?.text
            t.syncStatusType = this.statusMap[t.fullSyncStatus]?.type
            return t
          })
        }
      })
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
