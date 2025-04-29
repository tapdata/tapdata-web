<script>
import { measurementApi } from '@tap/api'

import { VTable } from '@tap/component'
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
      },
      columns: [
        {
          label: i18n.t('packages_dag_components_initiallist_yuanbiaoming'),
          prop: 'originTable',
          width: 180,
        },
        {
          label: i18n.t('packages_dag_components_initiallist_mubiaobiaoming'),
          prop: 'targetTable',
          width: 180,
        },
        // {
        //   label: '表结构同步',
        //   prop: 'structureStatus',
        //   slotName: 'structureStatus',
        //   width: 80
        // },
        {
          label: i18n.t('packages_dag_components_initiallist_shujutongbu'),
          prop: 'progress',
          slotName: 'progress',
        },
        {
          label: i18n.t(
            'packages_dag_components_initiallist_quanliangtongbuzhuang',
          ),
          prop: 'syncStatus',
          slotName: 'syncStatus',
          width: 120,
        },
        // {
        //   label: '操作',
        //   prop: 'operation',
        //   slotName: 'operation',
        //   width: 60
        // }
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
      }
    },
  },

  mounted() {
    this.lazyLoadData = debounce((pageNum) => {
      this.$refs.table?.fetch(pageNum)
    }, 200)
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
      return measurementApi.fullStatistics(filter).then((data) => {
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
    width="774px"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @close="$emit('update:value', false)"
  >
    <template #header>
      <div>
        <span>{{
          $t('packages_dag_components_initiallist_quanliangxinxixiang')
        }}</span>
        <ElTooltip
          transition="tooltip-fade-in"
          :content="$t('packages_dag_components_initiallist_dianjishuaxin')"
          class="ml-2"
        >
          <VIcon
            class="color-primary cursor-pointer"
            size="12"
            @click="startLoadData"
            >icon_table_selector_load</VIcon
          >
        </ElTooltip>
      </div>
      <div class="mb-2">
        <ElInput
          v-model="tableName"
          :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
          prefix-icon="el-icon-search"
          clearable
          style="width: 240px"
          @input="handleInput"
        />
      </div>
    </template>
    <VTable
      ref="table"
      :remote-method="remoteMethod"
      :columns="columns"
      height="100%"
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
