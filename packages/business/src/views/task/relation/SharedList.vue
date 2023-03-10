<template>
  <div class="log-container flex justify-content-between">
    <div class="flex flex-column pt-5 w-100">
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
              $t('public_button_details')
            }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

<script>
import { VTable } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { logcollectorApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import i18n from '@tap/i18n'
import { TASK_TYPE_MAP } from '@tap/business'

export default {
  name: 'RelationSharedList',

  components: { VTable, TaskStatus },

  data() {
    return {
      columns: [
        {
          label: i18n.t('public_serial_number'),
          type: 'index'
        },
        {
          label: i18n.t('public_task_name'),
          prop: 'name'
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
          prop: 'creatTime',
          dataType: 'time',
          width: 180
        },
        {
          label: i18n.t('public_task_cdc_time_point'),
          prop: 'creatTime1',
          dataType: 'time',
          width: 180
        },
        {
          label: '使用的挖掘表',
          slotName: 'operation',
          width: 200
        }
      ]
    }
  },

  methods: {
    remoteMethod() {
      const taskId = this.$route.params.id
      const { syncType } = this.$attrs.dataflow || {}
      return logcollectorApi
        .relateTasks({
          taskId,
          type: syncType
        })
        .then(data => {
          return {
            total: data.total,
            data: (data.items || []).map(t => {
              t.typeLabel = TASK_TYPE_MAP[t.type]
              return t
            })
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
