<template>
  <section class="version-list-wrap">
    <div class="history-text">
      {{ $t('metadata_details_version_lastVersion') }}
    </div>
    <!-- 数据校验表格 start -->
    <ElTable :data="tableData" class="table-page-table" height="100%">
      <ElTableColumn :label="$t('metadata_details_version_versionNum')" prop="version"> </ElTableColumn>
      <ElTableColumn :label="$t('metadata_details_version_updateTime')" prop="version_time">
        <template v-slot="scope">
          {{ scope.row.versionTimeFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('metadata_details_version_operator')" prop="version_user_name"></ElTableColumn>
      <ElTableColumn :label="$t('metadata_details_version_modifyDescription')" prop="version_description">
      </ElTableColumn>
      <ElTableColumn :label="$t('column_operation')" width="80">
        <template v-slot="scope">
          <ElButton v-readonlybtn="'data_catalog_edition'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('metadata_details_version_compared') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <!-- 数据校验表格 end -->
    <ElDialog
      custom-class="history-dialog"
      :title="histories.name"
      :close-on-click-modal="false"
      v-model:visible="showVersionDialog"
    >
      <HistoryVersion
        :comparedData="comparedData"
        :currentVersion="currentVersion"
        v-if="showVersionDialog"
      ></HistoryVersion>
    </ElDialog>
  </section>
</template>

<script>
import HistoryVersion from './HistoryVersion'
import dayjs from 'dayjs'

export default {
  components: {
    HistoryVersion
  },

  props: {
    histories: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      order: 'last_updated DESC',
      showVersionDialog: false,
      tableData: [],
      comparedData: null,
      currentVersion: ''
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    metaType() {
      let metaType = this.searchParams.metaType
      if (metaType) {
        return [metaType]
      } else {
        return this.$route.meta.types || []
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      let self = this
      this.tableData = []
      let histories = self.histories?.histories || []
      if (histories?.length)
        histories.forEach(item => {
          this.tableData.unshift({
            id: this.histories.id,
            version: item.version,
            version_user_id: item.version_user_id,
            version_user_name: item.version_user_name,
            versionTimeFmt: dayjs(item.version_time).format('YYYY-MM-DD HH:mm:ss')
          })
          this.currentVersion = this.histories.version
        })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },

    toDetails(item) {
      this.comparedData = item
      this.showVersionDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.version-list-wrap {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .history-text {
    padding-bottom: 16px;
    font-size: 12px;
  }
}
</style>

<style lang="scss">
.version-list-wrap {
  .table-page-table {
    border-bottom: 1px solid #eee;
  }
  .history-dialog {
    width: 100%;
    height: 100%;
    margin: 0 auto !important;
    .table-page-table {
      min-height: 200px;
    }
  }
}
</style>
