<template>
  <div class="log-container flex justify-content-between">
    <div class="flex flex-column w-100">
      <VTable
        :columns="cols"
        :remoteMethod="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        :has-pagination="false"
        ref="table"
        height="100"
        class="table-list"
      >
        <template #name="{ row }">
          <ElLink type="primary" @click="handleName(row)">{{ row.name }}</ElLink>
        </template>
        <template #status="{ row }">
          <TaskStatus :task="row" />
        </template>
        <template #tableNum="{ row }">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleDetail(row)">{{ row.tableNum }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>

    <ElDialog
      :visible.sync="visible"
      :title="$t('packages_business_shared_mining_table_wajuebiaoxinxi')"
      width="1000px"
      :close-on-click-modal="false"
      :append-to-body="true"
      @open="handleOpen"
    >
      <SharedMiningTable
        ref="sharedMiningTable"
        :task-id="$route.params.id"
        :params="sharedMiningTableParams"
        :show-title="false"
        class="shared-mining-table mt-n5"
      ></SharedMiningTable>
    </ElDialog>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { taskApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import i18n from '@tap/i18n'
import { TASK_TYPE_MAP } from '@tap/business'
import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'

export default {
  name: 'RelationSharedList',

  components: { VTable, TaskStatus, SharedMiningTable },

  props: {
    type: {
      type: String,
      default: 'logCollector'
    }
  },

  data() {
    return {
      visible: false,
      sharedMiningTableParams: {
        tableTaskId: ''
      }
    }
  },

  computed: {
    cols() {
      const map = {
        logCollector: [
          {
            label: i18n.t('public_serial_number'),
            type: 'index'
          },
          {
            label: i18n.t('public_task_name'),
            prop: 'name',
            slotName: 'name'
          },
          {
            label: i18n.t('public_task_type'),
            prop: 'typeLabel',
            width: 120
          },
          {
            label: i18n.t('public_task_status'),
            prop: 'status',
            slotName: 'status',
            width: 150
          },
          {
            label: i18n.t('public_create_time'),
            prop: 'createDate',
            dataType: 'time',
            default: '-',
            width: 180
          },
          {
            label: i18n.t('public_task_cdc_time_point'),
            prop: 'currentEventTimestamp',
            dataType: 'time',
            default: '-',
            width: 180
          },
          {
            label: i18n.t('packages_business_relation_sharedlist_shiyongdewajue'),
            slotName: 'tableNum',
            width: 200
          }
        ],
        sync: [
          {
            label: i18n.t('public_serial_number'),
            type: 'index'
          },
          {
            label: i18n.t('public_task_name'),
            prop: 'name',
            slotName: 'name'
          },
          {
            label: i18n.t('public_task_type'),
            prop: 'typeLabel',
            width: 120
          },
          {
            label: i18n.t('public_task_status'),
            prop: 'status',
            slotName: 'status',
            width: 150
          },
          {
            label: i18n.t('public_create_time'),
            prop: 'createDate',
            dataType: 'time',
            default: '-',
            width: 180
          },
          {
            label: i18n.t('public_task_cdc_time_point'),
            prop: 'currentEventTimestamp',
            dataType: 'time',
            default: '-',
            width: 180
          }
        ]
      }
      return map[this.type]
    }
  },

  methods: {
    remoteMethod() {
      const map = {
        logCollector: this.logCollectorRemote,
        sync: this.syncRemote
      }
      return map[this.type]?.()
    },

    logCollectorRemote() {
      const taskId = this.$route.params.id
      const { taskRecordId } = this.$attrs.dataflow || {}
      return taskApi
        .taskConsoleRelations({
          taskId,
          // type: syncType
          type: 'task_by_collector',
          taskRecordId
        })
        .then(data => {
          return {
            total: data.length || 0,
            data: (data || []).map(t => {
              t.typeLabel = TASK_TYPE_MAP[t.taskType]
              return t
            })
          }
        })
    },

    syncRemote() {
      const taskId = this.$route.params.id
      const { taskRecordId } = this.$attrs.dataflow || {}
      return taskApi
        .taskConsoleRelations({
          taskId,
          // type: syncType
          type: 'task_by_collector',
          taskRecordId
        })
        .then(data => {
          return {
            total: data.length || 0,
            data: (data || []).map(t => {
              t.typeLabel = TASK_TYPE_MAP[t.taskType]
              return t
            })
          }
        })
    },

    handleDetail(row = {}) {
      this.sharedMiningTableParams.tableTaskId = row.id
      this.visible = true
    },

    handleName({ id, syncType }) {
      const MAP = {
        migrate: 'MigrateViewer',
        sync: 'DataflowViewer'
      }
      const routeUrl = this.$router.resolve({
        name: MAP[syncType],
        params: {
          id
        }
      })
      openUrl(routeUrl.href)
    },

    handleOpen() {
      this.$nextTick(() => {
        this.$refs.sharedMiningTable?.fetch?.()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  height: inherit;
}
.white-space-nowrap {
  white-space: nowrap;
}

.log-list {
  border-radius: 1px;
  background-color: rgba(229, 236, 255, 0.22);
  ::v-deep {
    .log-line {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .highlight-bg-color {
      background-color: #ff0;
    }
    .empty-wrap {
      margin: 24px 0;
    }
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  ::v-deep {
    .el-alert__closebtn {
      top: 7px;
    }
  }
}
.shared-mining-table {
  height: 350px;
}
</style>
