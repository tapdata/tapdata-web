<template>
  <div class="log-container flex justify-content-between">
    <div class="flex flex-column w-100">
      <FilterBar
        v-if="showFilter"
        v-model="searchParams"
        :items="filterItems"
        :change-route="false"
        class="ml-2 pt-3"
        @search="handleFetch"
        @fetch="handleFetch"
      ></FilterBar>
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
            <ElButton size="mini" type="text" @click="handleTableNum(row)">{{ row.tableNum }}</ElButton>
          </div>
        </template>
        <template #operation="{ row }">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleMonitor(row)">{{
              $t('packages_business_task_list_button_monitor')
            }}</ElButton>
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
import { VTable, FilterBar } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { taskApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import i18n from '@tap/i18n'
import { TASK_TYPE_MAP } from '@tap/business'
import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'

export default {
  name: 'RelationSharedList',

  components: { VTable, FilterBar, TaskStatus, SharedMiningTable },

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
      },
      searchParams: {
        type: '',
        status: '',
        keyword: ''
      },
      filterItems: [],
      map: {
        logCollector: {
          label: i18n.t('packages_business_task_monitor_mining_task'),
          monitor: 'SharedMiningMonitor'
        },
        connHeartbeat: {
          label: i18n.t('public_task_type_heartbeat'),
          monitor: 'HeartbeatMonitor'
        },
        sync: {
          label: i18n.t('public_task_type_sync'),
          monitor: 'TaskMonitor'
        },
        migrate: {
          label: i18n.t('public_task_type_migrate'),
          monitor: 'MigrationMonitor'
        },
        mem_cache: {
          label: i18n.t('packages_business_relation_list_gongxianghuancun'),
          monitor: 'SharedCacheMonitor'
        }
      }
    }
  },

  computed: {
    showFilter() {
      return ['migrate', 'sync'].includes(this.type)
    },

    cols() {
      const result = [
        {
          label: i18n.t('public_task_name'),
          prop: 'name',
          slotName: 'name'
        },
        {
          label: i18n.t('public_task_type'),
          prop: 'typeLabel',
          width: 150
        },
        {
          label: i18n.t('public_task_status'),
          prop: 'status',
          slotName: 'status',
          width: 150
        },
        {
          label: i18n.t('packages_business_task_preview_startTime'),
          prop: 'startTime',
          dataType: 'time',
          width: 200
        },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          width: 100
        }
      ]

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
            prop: 'syncTypeLabel',
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
          },
          {
            label: i18n.t('public_operation'),
            slotName: 'operation',
            width: 100
          }
        ],
        shareCache: [
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
            prop: 'syncTypeLabel',
            width: 120
          },
          {
            label: i18n.t('public_task_sync_type'),
            prop: 'tongbuLabel',
            width: 120
          },
          {
            label: i18n.t('public_task_status'),
            prop: 'status',
            slotName: 'status',
            width: 150
          },
          {
            label: i18n.t('packages_dag_monitor_topheader_qidongshijian'),
            prop: 'startTime',
            dataType: 'time',
            default: '-',
            width: 180
          },
          {
            label: i18n.t('public_operation'),
            slotName: 'operation',
            width: 100
          }
        ]
      }
      return map[this.type] || result
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.getSearchItems()
    },

    getSearchItems() {
      let items = []
      for (let key in this.map) {
        const temp = this.map[key]
        items.push({
          label: temp.label,
          value: key
        })
      }
      this.filterItems = [
        {
          label: i18n.t('public_task_type'),
          key: 'type',
          type: 'dark-select',
          items: items
        },
        {
          placeholder: i18n.t('packages_business_relation_list_qingshururenwu'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },

    remoteMethod() {
      const taskId = this.$route.params.id
      const { taskRecordId } = this.$route.query || this.$attrs.dataflow || {}

      let filter = {
        taskId,
        taskRecordId
      }
      if (this.showFilter) {
        const { keyword, type, status } = this.searchParams
        filter = {
          keyword,
          taskId,
          type,
          status,
          taskRecordId
        }
      }
      if (this.type === 'logCollector') {
        filter.type = 'task_by_collector'
      }
      return taskApi.taskConsoleRelations(filter).then(data => {
        return {
          total: 0,
          data:
            data.map(t => {
              t.typeLabel = this.map[t.type]?.label
              t.syncTypeLabel = this.map[t.syncType]?.label
              t.tongbuLabel = TASK_TYPE_MAP[t.taskType]
              return t
            }) || []
        }
      })
    },

    handleTableNum(row = {}) {
      this.sharedMiningTableParams.tableTaskId = row.id
      this.visible = true
    },

    handleName({ id, syncType }) {
      const MAP = {
        migrate: 'MigrationMonitor',
        sync: 'TaskMonitor',
        logCollector: 'SharedMiningMonitor',
        mem_cache: 'SharedCacheMonitor'
      }

      taskApi.getParentTaskSign(id, this.$attrs.dataflow?.id).then(data => {
        const routeUrl = this.$router.resolve({
          name: MAP[syncType],
          params: {
            id
          },
          query: {
            parent_task_sign: data
          }
        })
        openUrl(routeUrl.href)
      })
    },

    handleOpen() {
      this.$nextTick(() => {
        this.$refs.sharedMiningTable?.fetch?.()
      })
    },

    handleFetch() {
      this.$refs.table?.fetch(1)
    },

    handleMonitor(row = {}) {
      this.handleName(row)
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
