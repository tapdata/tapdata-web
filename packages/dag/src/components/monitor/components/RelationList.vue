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
        ref="table"
        height="100"
        class="table-list"
        hide-on-single-page
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
    </div>
  </div>
</template>

<script>
import { VTable, FilterBar } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { connectionsApi } from '@tap/api'
import { openUrl } from '@tap/shared'

export default {
  name: 'RelationList',

  components: { VTable, FilterBar, TaskStatus },

  data() {
    return {
      searchParams: {
        taskType: '',
        taskStatus: '',
        taskName: ''
      },
      filterItems: [],
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
          label: '启动时间',
          prop: 'startTime',
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
      this.getSearchItems()
    },

    getSearchItems() {
      this.filterItems = [
        {
          label: '任务类型',
          key: 'taskType',
          type: 'dark-select',
          items: [
            {
              label: '挖掘任务',
              value: '挖掘任务'
            },
            {
              label: '校验任务',
              value: '校验任务'
            },
            {
              label: '缓存任务',
              value: '缓存任务'
            },
            {
              label: '精准延时',
              value: '精准延时'
            }
          ]
        },
        {
          label: '任务状态',
          key: 'taskStatus',
          type: 'dark-select',
          items: [
            {
              label: '挖掘任务',
              value: '挖掘任务'
            },
            {
              label: '校验任务',
              value: '校验任务'
            },
            {
              label: '缓存任务',
              value: '缓存任务'
            },
            {
              label: '精准延时',
              value: '精准延时'
            }
          ]
        },
        {
          placeholder: '请输入任务名称...',
          key: 'taskName',
          type: 'input'
        }
      ]
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
                startTime: Date.now()
              },
              {
                id: '2',
                taskName: 'taskName',
                taskType: 'taskType',
                status: 'running',
                startTime: Date.now()
              },
              {
                id: '3',
                taskName: 'taskName',
                taskType: 'taskType',
                status: 'stopping',
                startTime: Date.now()
              }
            ]
          }
        })
    },

    handleDetail(row = {}) {
      console.log('handleDetail', row)
      const routeUrl = this.$router.resolve({
        name: 'relationTaskDetail',
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
