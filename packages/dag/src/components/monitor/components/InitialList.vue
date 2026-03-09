<script>
import { getFullStatistics } from '@tap/api/src/core/measurement'
import { VTable } from '@tap/component/src/base/v-table'

import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'

export default {
  name: 'InitialList',
  components: { VTable },
  props: {
    dataflow: Object,
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tableName: '',
      visible: false,
      skipErrorTable: false,
      statusMap: {
        NOT_START: {
          text: i18n.t('packages_dag_components_initiallist_weikaishi'),
          type: 'waiting',
        },
        PAUSE: {
          text: i18n.t('public_status_stop'),
          type: 'pause',
        },
        DONE: {
          text: i18n.t('public_status_finished'),
          type: 'finish',
        },
        ING: {
          text: i18n.t('packages_dag_components_initiallist_tongbuzhong'),
          type: 'running',
        },
        COUNTING: {
          text: i18n.t('packages_dag_counting'),
          title: i18n.t('packages_dag_counting_num_of_rows_table'),
          type: 'scheduling',
        },
        ERROR_SKIPPED: {
          text: i18n.t('public_status_skipped'),
          type: 'error',
        },
      },
      columns: [
        {
          label: i18n.t('packages_dag_components_initiallist_yuanbiaoming'),
          prop: 'originTable',
        },
        {
          label: i18n.t('packages_dag_components_initiallist_mubiaobiaoming'),
          prop: 'targetTable',
        },
        {
          label: i18n.t('packages_dag_components_initiallist_shujutongbu'),
          prop: 'progress',
          slotName: 'progress',
          width: 240,
        },
        {
          label: i18n.t(
            'packages_dag_components_initiallist_quanliangtongbuzhuang',
          ),
          prop: 'syncStatus',
          slotName: 'syncStatus',
          width: 120,
        },
      ],
      timer: null,
    }
  },
  watch: {
    value(v) {
      this.visible = !!v
      if (this.visible) {
        this.init()
      } else {
        this.clearTimer()
        this.tableName = ''
        this.skipErrorTable = false
      }
    },
  },

  mounted() {
    this.lazyLoadData = debounce((pageNum) => {
      this.$refs.table?.fetch(pageNum)
    }, 200)
  },

  unmounted() {
    this.clearTimer()
  },

  methods: {
    init() {
      this.startLoadData()
      this.timer = setInterval(() => {
        this.$refs.table?.fetch?.(null, null, true)
      }, 5000)
    },

    startLoadData() {
      this.$refs.table?.fetch?.()
    },

    getFilter(pageObj = {}) {
      const { current = 1, size = 20 } = pageObj
      const filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current,
      }
      return filter
    },

    remoteMethod({ page }) {
      const { current, size } = page
      this.pageObj = { current, size }
      const filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current,
        tableName: this.tableName,
      }

      if (this.skipErrorTable) {
        filter.skipErrorTable = true
      }

      return getFullStatistics(filter).then((data) => {
        return {
          total: data.total || 0,
          data: data.items.map((t) => {
            const rate = Math.floor(t.syncRate * 100)
            t.progress = Math.min(rate, 100)
            t.syncStatusText = this.statusMap[t.fullSyncStatus]?.text
            t.syncStatusType = this.statusMap[t.fullSyncStatus]?.type
            t.syncStatusTitle = this.statusMap[t.fullSyncStatus]?.title
            return t
          }),
        }
      })
    },

    clearTimer() {
      clearInterval(this.timer)
    },

    handleInput() {
      this.lazyLoadData(1)
    },
  },
}
</script>

<template>
  <ElDialog
    v-model="visible"
    width="50%"
    class="min-w-800"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('update:value', false)"
  >
    <template #header="{ titleClass }">
      <div :class="titleClass" class="flex align-items-center gap-2">
        <span>{{
          $t('packages_dag_components_initiallist_quanliangxinxixiang')
        }}</span>
        <el-divider direction="vertical" />
        <ElInput
          v-model="tableName"
          :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
          clearable
          style="width: 240px"
          @input="handleInput"
        >
          <template #prefix>
            <i-lucide-search />
          </template>
        </ElInput>
        <el-checkbox
          v-model="skipErrorTable"
          :label="$t('packages_dag_only_show_skip')"
          border
          @change="startLoadData"
        />
        <el-button class="rounded-lg" circle @click="startLoadData">
          <template #icon>
            <i-lucide-refresh-cw />
          </template>
        </el-button>
      </div>
    </template>
    <VTable
      ref="table"
      :remote-method="remoteMethod"
      :columns="columns"
      height="100%"
      table-class="has-border-t"
      class="table-list"
    >
      <template #progress="scope">
        <ElProgress
          v-if="scope.row.fullSyncStatus !== 'COUNTING'"
          color="#2C65FF"
          :percentage="scope.row.progress"
          style="font-size: 12px !important"
        />
      </template>
      <template #syncStatus="scope">
        <span
          :class="[`status-${scope.row.syncStatusType}`, 'status-block']"
          :title="scope.row.syncStatusTitle"
        >
          {{ scope.row.syncStatusText }}
        </span>
      </template>
    </VTable>
  </ElDialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  .el-dialog__body {
    padding-top: 6px;
  }
}

.table-list {
  height: 560px;
  .el-progress {
    :deep(.el-progress__text) {
      font-size: 12px !important;
    }
  }
}
</style>
