<template>
  <div class="inspect-wrap p-4 h-100 w-100 overflow-y-auto" v-loading="loading">
    <!-- <VTable
      :remoteMethod="remoteMethod"
      :columns="columns"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      ref="table"
      height="100%"
      hide-on-single-page
    >
      <template #status="{ row }">
        <ElTag :type="row.statusType" size="small">{{ row.status }}</ElTag>
      </template>
      <template #operation="{ row }">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(row)">
            {{ $t('public_button_details') }}
          </ElButton>
        </div>
      </template>
    </VTable> -->

    <div class="flex flex-column gap-4">
      <div
        v-for="inspect in inspectList"
        :key="inspect.id"
        class="flex align-items-stretch border rounded-lg overflow-hidden cursor-pointer hover:bg-light"
        @click="handleDetail(inspect)"
      >
        <div class="flex flex-column align-center gap-2 bg-light p-3 border-end" style="min-width: 150px">
          <div class="rounded-lg px-2 py-1 bg-fill-hover">{{ inspect.type }}</div>
          <ElTag :type="inspect.statusType" size="small">{{ inspect.status }}</ElTag>
        </div>

        <div class="flex justify-content-around align-center flex-1 gap-4 p-3 px-4 border-end">
          <div class="flex flex-column gap-2" style="min-width: 150px">
            <span class="flex align-center gap-1"><VIcon>time</VIcon>{{ $t('packages_dag_inspect_start_time') }} </span>
            <span class="fw-sub font-color-dark">
              {{ inspect.beginTime }}
            </span>
          </div>
          <div class="flex flex-column gap-2" style="min-width: 150px">
            <span class="flex align-center gap-1"><VIcon>time</VIcon>{{ $t('packages_dag_inspect_end_time') }} </span>
            <span class="fw-sub font-color-dark">
              {{ inspect.endTime || '-' }}
            </span>
          </div>
        </div>

        <div class="flex justify-content-around align-center flex-1 gap-4 p-3 px-4">
          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>EyeOff</VIcon>{{ $t('packages_dag_inspect_ignore_records') }}</span
            >
            <span class="fw-sub font-color-dark">
              {{ inspect.attrs.ignores }}
            </span>
          </div>

          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>Eye</VIcon>{{ $t('packages_dag_inspect_accept_records') }}</span
            >
            <span class="fw-sub font-color-dark">
              {{ inspect.attrs.accepts }}
            </span>
          </div>

          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>FileChartColumnIncreasing</VIcon>{{ $t('packages_dag_inspect_diff_records') }}</span
            >
            <span
              class="fw-sub font-color-dark"
              :class="{
                'color-danger': inspect.attrs.differences > 0
              }"
            >
              {{ inspect.attrs.differences }}
            </span>
          </div>

          <ElButton type="text">
            {{ $t('public_button_details') }}
            <VIcon>arrow-right</VIcon>
          </ElButton>
        </div>
      </div>
    </div>

    <VEmpty v-if="inspectList.length === 0" large>
      <template v-if="showEnabled">
        <div class="flex flex-column gap-3 align-center">
          <span class="font-color-light">{{ $t('packages_dag_inspect_start_config_desc') }}</span>
          <ElButton @click="$emit('open-inspect')">
            <VIcon>data-scan</VIcon>
            {{ $t('packages_dag_inspect_start_config') }}
          </ElButton>
        </div>
      </template>
    </VEmpty>

    <InspectDetailDialog :visible.sync="detailDialogVisible" :inspectId="currentInspectId" :pingTime="pingTime" />
  </div>
</template>

<script>
import i18n from '@tap/i18n'
import { VTable, VEmpty } from '@tap/component'
import { taskInspectApi } from '@tap/api'
import { openUrl } from '@tap/shared'
import InspectDetailDialog from './InspectDetailDialog.vue'
import dayjs from 'dayjs'

export default {
  name: 'TaskInspect',

  components: { VTable, VEmpty, InspectDetailDialog },

  props: {
    dataflow: {
      type: Object,
      default: () => ({})
    },
    currentTab: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_dag_inspect_type'),
          prop: 'type',
          minWidth: 100
        },
        {
          label: i18n.t('packages_dag_inspect_start_time'),
          prop: 'beginTime',
          minWidth: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_end_time'),
          prop: 'endTime',
          minWidth: 170,
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_inspect_status'),
          prop: 'status',
          slotName: 'status',
          minWidth: 100
        },

        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          width: 100
        }
      ],
      loading: false,
      detailDialogVisible: false,
      currentInspectId: '',
      inspectList: [],
      pingTime: '',
      showEnabled: false
    }
  },

  watch: {
    currentTab(val) {
      if (val === 'inspect') {
        this.fetch()
        this.startLoop()
      } else {
        this.stopLoop()
      }
    }
  },

  created() {
    this.fetch().then(async () => {
      if (!this.inspectList.length) {
        const enabled = await this.checkEnabled()
        if (!enabled) {
          this.showEnabled = true
        }
      }
    })
  },

  beforeDestroy() {
    this.stopLoop()
  },

  methods: {
    startLoop() {
      this.loop(this.fetch, 5000)
    },

    stopLoop() {
      clearInterval(this.timeout)
    },

    loop(fn, interval) {
      this.timeout = setInterval(fn, interval)
    },

    remoteMethod({ page }) {
      const { current, size } = page
      const { id: taskId } = this.dataflow || {}

      if (!taskId) return Promise.resolve({ total: 0, data: [] })

      const params = {
        page: current,
        size: size
      }

      return taskInspectApi
        .getHistories(taskId, params)
        .then(data => {
          return {
            total: data.total || 0,
            data:
              data.items?.map(item => {
                return {
                  id: item.id,
                  type: this.getInspectTypeName(item.inspectMethod || item.type),
                  beginTime: dayjs(item.beginTime).format('YYYY-MM-DD HH:mm:ss'),
                  endTime: item.endTime ? dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss') : '',
                  ...this.makeStatus(item.status),
                  attrs: item.attrs
                  // taskId: item.taskId,
                  // inspectId: item.id,
                  // rawData: item
                }
              }) || []
          }
        })
        .catch(err => {
          console.error('Failed to fetch inspection results:', err)
          return { total: 0, data: [] }
        })
    },

    getInspectTypeName(type) {
      const typeMap = {
        row_count: i18n.t('packages_dag_components_inspect_type_count'),
        hash: i18n.t('packages_dag_components_inspect_type_hash'),
        field: i18n.t('packages_dag_components_inspect_type_field'),
        jointField: i18n.t('packages_dag_components_inspect_type_jointField'),
        full: i18n.t('packages_dag_components_inspect_type_full'),
        increment: i18n.t('packages_dag_components_inspect_type_increment')
      }
      return typeMap[type] || type
    },

    makeStatus(status) {
      const statusMap = {
        RUNNING: i18n.t('public_status_running'),
        STOPPED: i18n.t('public_status_stop'),
        DONE: i18n.t('public_status_finished'),
        ERROR: i18n.t('public_status_error')
      }

      const typeMap = {
        RUNNING: 'success',
        STOPPED: 'info',
        DONE: 'primary',
        ERROR: 'danger'
      }

      return {
        status: statusMap[status],
        statusType: typeMap[status]
      }
    },

    handleDetail(row) {
      this.currentInspectId = row.id
      this.pingTime = dayjs(row.pingTime).format('YYYY-MM-DD HH:mm:ss')
      this.detailDialogVisible = true
    },

    async fetch() {
      this.loading = true
      const { data } = await this.remoteMethod({ page: { current: 1, size: 10 } })
      this.inspectList = data
      this.loading = false
    },

    async checkEnabled() {
      const res = await taskInspectApi.getConfig(this.dataflow.id)
      return res.mode && res.mode !== 'CLOSE'
    }
  }
}
</script>
