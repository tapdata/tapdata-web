<template>
  <div class="log-container flex justify-content-between">
    <div class="flex flex-column pt-5 w-100">
      <FilterBar
        v-model="searchParams"
        :items="filterItems"
        :change-route="false"
        class="ml-2"
        @search="handleFetch"
        @fetch="handleFetch"
      ></FilterBar>
      <VTable
        :columns="columns"
        :remoteMethod="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        :has-pagination="false"
        ref="table"
        height="100"
        class="table-list mt-4"
      >
        <template slot="status" slot-scope="scope">
          <TaskStatus :task="scope.row" />
        </template>
        <template slot="operation" slot-scope="scope">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
              $t('packages_business_task_list_button_monitor')
            }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

<script>
import { VTable, FilterBar } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { taskApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import i18n from '@tap/i18n'

export default {
  name: 'RelationList',

  components: { VTable, FilterBar, TaskStatus },

  data() {
    return {
      searchParams: {
        type: '',
        status: '',
        keyword: ''
      },
      filterItems: [],
      columns: [
        {
          label: i18n.t('public_task_name'),
          prop: 'name'
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
      ],
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
        }
      }
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
      const { taskRecordId } = this.$route.query || {}
      const { keyword, type, status } = this.searchParams
      let filter = {
        keyword,
        taskId,
        type,
        status,
        taskRecordId
      }
      return taskApi.taskConsoleRelations(filter).then(data => {
        return {
          total: 0,
          data:
            data.map(t => {
              t.typeLabel = this.map[t.type]?.label
              return t
            }) || []
        }
      })
    },

    handleDetail(row = {}) {
      const routeUrl = this.$router.resolve({
        name: this.map[row.type]?.monitor,
        params: {
          id: row.id
        }
      })
      openUrl(routeUrl.href)
    },

    handleFetch() {
      this.$refs.table?.fetch(1)
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
</style>
