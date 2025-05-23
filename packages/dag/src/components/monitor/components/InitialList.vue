<template>
  <ElDialog
    width="774px"
    v-model="visible"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @close="$emit('input', false)"
  >
    <template #header>
      <div>
        <span>{{ $t('packages_dag_components_initiallist_quanliangxinxixiang') }}</span>
        <ElTooltip
          transition="tooltip-fade-in"
          :content="$t('packages_dag_components_initiallist_dianjishuaxin')"
          class="ml-2"
        >
          <VIcon class="color-primary cursor-pointer" size="12" @click="startLoadData">icon_table_selector_load</VIcon>
        </ElTooltip>
      </div>
      <div class="mb-2">
        <ElInput
          v-model="tableName"
          :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
          prefixIcon="el-icon-search"
          clearable
          @input="handleInput"
          style="width: 240px"
        ></ElInput>
      </div>
    </template>
    <VTable :remoteMethod="remoteMethod" :columns="columns" height="100%" ref="table" class="table-list">
      <template v-slot:progress="scope">
        <ElProgress
          v-if="scope.row.fullSyncStatus !== 'COUNTING'"
          color="#2C65FF"
          :percentage="scope.row.progress"
          style="font-size: 12px !important"
        ></ElProgress>
      </template>
      <template v-slot:syncStatus="scope">
        <span :class="['status-' + scope.row.syncStatusType, 'status-block']" :title="scope.row.syncStatusTitle">
          {{ scope.row.syncStatusText }}
        </span>
      </template>
    </VTable>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'

import { VTable } from '@tap/component'
import { measurementApi } from '@tap/api'
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
          type: 'running'
        },
        COUNTING: {
          text: i18n.t('packages_dag_counting'),
          title: i18n.t('packages_dag_counting_num_of_rows_table'),
          type: 'scheduling'
        }
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
          label: i18n.t('packages_dag_components_initiallist_quanliangtongbuzhuang'),
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
    this.lazyLoadData = debounce(pageNum => {
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
      let { current = 1, size = 20 } = pageObj
      let filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current,
      }
      return filter
    },

    remoteMethod({ page }) {
      let { current, size } = page
      this.pageObj = { current, size }
      let filter = {
        taskRecordId: this.dataflow?.taskRecordId,
        size,
        page: current,
        tableName: this.tableName
      }
      return measurementApi.fullStatistics(filter).then((data) => {
        return {
          total: data.total || 0,
          data: data.items.map((t) => {
            const rate = Math.floor(t.syncRate * 100)
            t.progress = rate > 100 ? 100 : rate
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
    }
  }
}
</script>

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
