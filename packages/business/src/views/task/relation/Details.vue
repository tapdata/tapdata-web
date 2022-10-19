<template>
  <div>
    <div class="my-4 fs-5">{{ dataflow.name || $t('packages_business_task_name') }}</div>
    <div class="bg-white p-6">
      <div class="mb-4 fs-8 fw-bold">
        {{
          $t('packages_business_relation_details_shiyonggaiguanlian', {
            val: taskTypeMap[type] || $t('packages_business_relation_details_renwu')
          })
        }}
      </div>
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
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
              $t('packages_business_relation_details_chakanrenwu')
            }}</ElButton>
          </div>
        </template>
      </VTable>
      <NodeLog v-if="isShowLog" :dataflow="dataflow" hide-filter class="log-box mt-6 border-top"></NodeLog>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

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
          label: i18n.t('packages_business_task_name'),
          prop: 'name'
        },
        {
          label: i18n.t('packages_business_task_list_task_type'),
          prop: 'typeTitle',
          width: 150
        },
        {
          label: i18n.t('packages_business_task_status'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: i18n.t('packages_business_column_create_time'),
          prop: 'creatTime',
          dataType: 'time',
          width: 150
        },
        {
          label: i18n.t('packages_business_connection_operate'),
          slotName: 'operation',
          width: 150
        }
      ],
      taskTypeMap: {
        logCollector: i18n.t('packages_business_relation_details_wajue'),
        mem_cache: i18n.t('packages_business_relation_details_huancun')
      }
    }
  },

  computed: {
    type() {
      return this.$route.query.type
    },
    isShowLog() {
      return ['logCollector', 'mem_cache'].includes(this.type)
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
      const { id } = this.$route.params
      const { type } = this
      let { current, size } = page
      let filter = {
        taskId: id,
        type,
        page: current,
        size
      }
      const MAP = {
        initial_sync: this.$t('packages_business_task_info_initial_sync'),
        cdc: this.$t('packages_business_task_info_initial_cdc'),
        'initial_sync+cdc':
          this.$t('packages_business_task_info_initial_sync') + '+' + this.$t('packages_business_task_info_initial_cdc')
      }
      return logcollectorApi.relateTasks(filter).then(data => {
        const { total = 0, items = [] } = data || {}
        return {
          total,
          data: items.map(t => {
            t.typeTitle = MAP[t.type]
            return t
          })
        }
      })
    },

    handleDetail({ taskId, syncType }) {
      const MAP = {
        migrate: 'MigrateViewer',
        sync: 'DataflowViewer'
      }
      this.$router.push({
        name: MAP[syncType],
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
