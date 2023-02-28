<template>
  <div>
    <div class="my-4 fs-5">{{ dataflow.name || $t('public_task_name') }}</div>
    <div class="bg-white p-6">
      <div class="mb-4 fs-8 fw-bold">
        {{
          $t('packages_business_relation_details_shiyonggaiguanlian', {
            val: taskTypeMap[type] || $t('packages_business_relation_details_renwu')
          })
        }}
      </div>
      <div class="flex">
        <div
          v-if="type === 'logCollector' && detailData.name"
          v-loading="!detailData.name"
          class="share-detail-head-left pr-4"
        >
          <div class="flex align-items-center">
            <span class="font-color-normal fw-bold mb-4 fs-7">{{
              $t('packages_business_relation_details_wajuexinxi')
            }}</span>
          </div>
          <div class="flex justify-content-start mb-4 text-left fs-8">
            <div class="fw-normal head-label font-color-light">
              {{ $t('packages_business_relation_details_wajuemingcheng') }}
            </div>
            <ElTooltip effect="dark" :content="detailData.name" placement="top-start">
              <div class="name font-color-dark fw-normal">{{ detailData.name }}</div>
            </ElTooltip>
          </div>
          <div class="flex justify-content-start mb-4 text-left fs-8">
            <div class="fw-normal head-label font-color-light">
              {{ $t('packages_business_relation_details_rizhiwajueshi') }}
            </div>
            <div class="font-color-dark fw-normal">{{ formatTime(detailData.logTime) }}</div>
          </div>
          <div class="flex justify-content-start mb-4 text-left fs-8">
            <div class="fw-normal head-label font-color-light">
              {{ $t('packages_business_share_form_setting_log_time') }}
            </div>
            <div class="font-color-dark fw-normal">{{ detailData.storageTime }}</div>
          </div>
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
      </div>
      <NodeLog v-if="isShowLog" :dataflow="dataflow" hide-filter class="log-box mt-6 border-top"></NodeLog>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import i18n from '@tap/i18n'
import { taskApi, logcollectorApi } from '@tap/api'
import { VTable } from '@tap/component'
import { TaskStatus, STATUS_MERGE, makeStatusAndDisabled } from '@tap/business'
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
          label: i18n.t('public_task_name'),
          prop: 'name'
        },
        {
          label: i18n.t('public_task_type'),
          prop: 'typeTitle',
          width: 150
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
          width: 200
        },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          width: 150
        }
      ],
      taskTypeMap: {
        logCollector: i18n.t('packages_business_relation_details_wajue'),
        mem_cache: i18n.t('packages_business_relation_details_huancun')
      },
      detailData: {}
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
      this.getDetail()
    },

    getDataflow() {
      const { id } = this.$route.params
      taskApi.get(id).then(data => {
        this.dataflow = data
      })
    },

    getDetail() {
      const { id } = this.$route.params
      logcollectorApi.getDetail(id).then(data => {
        let detailData = data || {}
        detailData.taskList = detailData.taskList?.map(makeStatusAndDisabled)
        this.detailData = detailData
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
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc'),
        'initial_sync+cdc': this.$t('public_task_type_initial_sync') + '+' + this.$t('public_task_type_cdc')
      }
      return logcollectorApi.relateTasks(filter).then(data => {
        const { total = 0, items = [] } = data || {}
        return {
          total,
          data: items.map(t => {
            t.typeTitle = MAP[t.type]
            t.status = STATUS_MERGE[t.status] || t.status
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
    },

    formatTime(date, f = 'YYYY-MM-DD HH:mm:ss') {
      return dayjs(date).format(f)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-list,
.log-box {
  height: 320px;
}
.share-detail-head-left {
  width: 260px;
  border-right: 1px solid map-get($borderColor, light);
  .head-label {
    min-width: 100px;
  }
  .name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
