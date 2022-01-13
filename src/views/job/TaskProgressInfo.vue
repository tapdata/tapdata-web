<template>
  <div class="task-progressInfo">
    <div class="tip">{{ $t('taskProgress.progressInfo') }}</div>
    <TablePage
      ref="table"
      row-key="id"
      class="progressInfo-list"
      :defaultPageSize="100"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <ul class="search-bar" slot="search">
        <li class="item">
          <el-input
            clearable
            class="input-with-select"
            size="mini"
            v-model="searchParams.keyword"
            :placeholder="$t('taskProgress.querySearch')"
            @input="table.fetch(1, 800)"
          >
          </el-input>
        </li>
        <li class="item">
          {{ $t('taskProgress.progressScreening') }}：
          <el-select clearable size="mini" v-model="searchParams.metaType" @input="table.fetch(1)">
            <el-option v-for="opt in typeList" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
          </el-select>
        </li>
      </ul>
      <el-table-column :label="$t('taskProgress.sourceTableName')" prop="statsData.sourceTableName" sortable>
        <template slot-scope="scope">
          {{ scope.row.statsData.sourceTableName }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('taskProgress.sourceLibraryeName')"
        prop="statsData.sourceDbName"
        sortable
        v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
      >
      </el-table-column>
      <el-table-column
        :label="$t('taskProgress.sourceType')"
        prop="statsData.sourceDatabaseType"
        sortable
        v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
      >
      </el-table-column>

      <el-table-column :label="$t('taskProgress.totalDataVolume')" prop="statsData.sourceRowNum" sortable>
        <template slot-scope="scope">
          {{ scope.row.statsData.sourceRowNum }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('taskProgress.targetTableName')" prop="statsData.targetTableName" sortable>
        <template slot-scope="scope">
          {{ scope.row.statsData.targetTableName }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('taskProgress.targetLibraryName')"
        prop="statsData.targetDbName"
        sortable
        v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
      >
      </el-table-column>
      <el-table-column
        :label="$t('taskProgress.targetType')"
        prop="statsData.targetDatabaseType"
        sortable
        v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
      >
      </el-table-column>

      <el-table-column
        :label="
          $route.query.mappingFlag ? $t('taskprogress_completed_sync_data') : $t('taskProgress.completedMigrateData')
        "
        prop="statsData.targetRowNum"
        sortable
      >
        <template slot-scope="scope">
          {{ scope.row.statsData.targetRowNum }}
        </template>
      </el-table-column>
      <el-table-column
        :label="
          $route.query.mappingFlag ? $t('taskprogress_full_sync_progress') : $t('taskProgress.fullMigrationProgress')
        "
        prop="statsData.status"
        sortable
      >
        <template slot-scope="scope">
          {{ scope.row.statsData.status }}
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>
<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '@/utils/util'

export default {
  name: 'TaskProgressInfo',
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        metaType: 'all'
      },
      typeList: [
        { label: this.$t('taskProgress.all'), value: 'all' },
        { label: this.$t('taskProgress.running'), value: 'running' },
        { label: this.$t('taskProgress.waiting'), value: 'waiting' }
      ]
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let { keyword, metaType } = this.searchParams
      let where = {
        dataFlowId: { like: this.$route.query.id },
        statsType: 'dataFlowDetailsStats'
      }
      if (this.$route.query.sourceConnectionId) {
        where['statsData.sourceConnectionId'] = { like: this.$route.query.sourceConnectionId }
        where['statsData.targetConnectionId'] = { like: this.$route.query.targetConnectionId }
      }
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ 'statsData.sourceTableName': filterObj }, { 'statsData.targetTableName': filterObj }]
      }
      if (metaType !== 'all' && metaType) {
        where['statsData.status'] = metaType
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('DataFlowInsights').count({ where: JSON.stringify(where) }),
        this.$api('DataFlowInsights').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        if (res?.data?.length) {
          res.data.forEach(item => {
            if (item.statsData.status === 'running') {
              let num = (item.statsData.targetRowNum / item.statsData.sourceRowNum) * 100
              item.statsData.status = num ? num.toFixed(2) + '%' : 0 + '%'
            } else if (item.statsData.status === 'done' || item.statsData.sourceRowNum === 0) {
              // 如果源表行数为0，则忽略状态字段直接视为完成状态
              item.statsData.status = this.$t('taskProgress.done')
            } else {
              item.statsData.status = this.$t('taskProgress.waiting')
            }
          })
        }
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'statsData.status'} ${order === 'statsData.status' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style scoped lang="scss">
.task-progressInfo {
  height: 100%;
  overflow: hidden;
  .tip {
    height: 40px;
    padding-left: 20px;
    line-height: 40px;
    font-size: 12px;
    background: #f5f5f5;
    border: 1px solid #dedee4;
    border-left: 0;
    box-sizing: border-box;
  }
  .progressInfo-list {
    height: calc(100% - 30px);
  }
  .search-bar {
    display: flex;
    width: 100%;
    .item {
      margin-right: 10px;
      font-size: 12px;
      white-space: nowrap;
    }
  }
}
</style>
