<template>
  <section class="version-list-wrap">
    <!-- <TablePage
      ref="table"
      row-key="id"
      class="metadata-list"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    > -->
    <div class="history-text">
      {{ $t('metadata.details.version.lastVersion') }}
    </div>
    <!-- 数据校验表格 start -->
    <el-table :data="tableData" class="table-page-table" height="100%">
      <el-table-column :label="$t('metadata.details.version.versionNum')" prop="version"> </el-table-column>
      <el-table-column :label="$t('metadata.details.version.updateTime')" prop="version_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.version_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.details.version.operator')" prop="version_user_name"></el-table-column>
      <el-table-column :label="$t('metadata.details.version.modifyDescription')" prop="version_description">
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="80">
        <template slot-scope="scope">
          <el-button v-readonlybtn="'data_catalog_edition'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('metadata.details.version.compared') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 数据校验表格 end -->
    <el-dialog
      custom-class="history-dialog"
      :title="histories.name"
      :close-on-click-modal="false"
      :visible.sync="showVersionDialog"
    >
      <HistoryVersion
        :comparedData="comparedData"
        :currentVersion="currentVersion"
        v-if="showVersionDialog"
      ></HistoryVersion>
    </el-dialog>
  </section>
</template>

<script>
import HistoryVersion from './HistoryVersion'
// import { toRegExp } from '../../utils/util'

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
          // let version_description = item.version_description
          // let descriptionArr = version_description?.split(';')
          // let localizeDescriptionArr = []
          // version_description = ''
          // descriptionArr.forEach(desc => {
          //   if (desc) {
          //     localizeDescriptionArr.push(desc ? this.$t('metadata.details.' + desc) : '')
          //   }
          // })
          // if (localizeDescriptionArr && localizeDescriptionArr.length > 0) {
          //   version_description = localizeDescriptionArr.join(', ')
          // }
          this.tableData.unshift({
            id: this.histories.id,
            version: item.version,
            version_user_id: item.version_user_id,
            version_user_name: item.version_user_name,
            version_time: item.version_time
            // version_description: version_description
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
  .table-page-table {
    // height: calc(100% - 60px);
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
