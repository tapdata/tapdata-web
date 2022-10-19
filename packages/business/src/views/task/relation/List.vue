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
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">详情</ElButton>
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

<script>
import { VTable, FilterBar } from '@tap/component'
import { TaskStatus, STATUS_MAP } from '@tap/business'
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
        taskStatus: '',
        keyword: ''
      },
      filterItems: [],
      columns: [
        {
          label: '任务名称',
          prop: 'name'
        },
        {
          label: '任务类型',
          prop: 'typeLabel',
          width: 150
        },
        {
          label: '任务状态',
          prop: 'status',
          slotName: 'status',
          width: 150
        },
        {
          label: '启动时间',
          prop: 'startTime',
          dataType: 'time',
          width: 200
        },
        {
          label: '操作',
          slotName: 'operation',
          width: 100
        }
      ]
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
      let statusItems = []
      for (let key in STATUS_MAP) {
        statusItems.push({
          label: i18n.t(STATUS_MAP[key].i18n),
          value: key
        })
      }

      this.filterItems = [
        {
          label: '任务类型',
          key: 'type',
          type: 'dark-select',
          items: [
            {
              label: '挖掘任务',
              value: 'logCollector'
            },
            {
              label: '校验任务',
              value: 'inspect'
            },
            {
              label: '缓存任务',
              value: 'mem_cache'
            }
          ]
        },
        {
          label: '任务状态',
          key: 'taskStatus',
          type: 'dark-select',
          items: statusItems
        },
        {
          placeholder: '请输入任务名称...',
          key: 'keyword',
          type: 'input'
        }
      ]
    },

    remoteMethod() {
      const taskId = this.$route.params.id
      const { taskRecordId } = this.$route.query || {}
      const { keyword } = this.searchParams
      const MAP = {
        logCollector: '挖掘任务',
        mem_cache: '缓存任务',
        inspect: '校验任务'
      }
      let filter = {
        keyword,
        taskId,
        taskRecordId
      }
      return taskApi.taskConsoleRelations(filter).then(data => {
        return {
          total: 10,
          data:
            data.map(t => {
              t.typeLabel = MAP[t.type]
              return t
            }) || []
        }
      })
    },

    handleDetail(row = {}) {
      const routeUrl = this.$router.resolve({
        name: 'relationTaskDetail',
        params: {
          id: row.id
        },
        query: {
          type: row.type
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
