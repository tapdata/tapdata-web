<template>
  <div class="task-progressInfo">
    <div class="tip">迁移详情</div>
    <TablePage
      ref="table"
      row-key="id"
      class="progressInfo-list"
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
            placeholder="输入表名关键字查询"
            @input="table.fetch(1, 800)"
          >
          </el-input>
        </li>
        <li class="item">
          全量迁移进度筛选：
          <el-select clearable size="mini" v-model="searchParams.metaType" @input="table.fetch(1)">
            <el-option v-for="opt in typeList" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
          </el-select>
        </li>
      </ul>
      <el-table-column label="源表名" prop="sourceTableName" sortable="sourceTableName">
        <template slot-scope="scope">
          {{ scope.row.statsData.sourceTableName }}
        </template>
      </el-table-column>
      <el-table-column label="总数据量（行）" prop="sourceRowNum" sortable="sourceRowNum">
        <template slot-scope="scope">
          {{ scope.row.statsData.sourceRowNum }}
        </template>
      </el-table-column>
      <el-table-column label="目标表名" prop="targetTableName" sortable="targetTableName">
        <template slot-scope="scope">
          {{ scope.row.statsData.targetTableName }}
        </template>
      </el-table-column>
      <el-table-column label="已迁移数据量" prop="targetRowNum" sortable="targetRowNum">
        <template slot-scope="scope">
          {{ scope.row.statsData.targetRowNum }}
        </template>
      </el-table-column>
      <el-table-column label="全量迁移进度" prop="status" sortable="status">
        <template slot-scope="scope">
          {{
            scope.row.statsData.status === 'done'
              ? '完成'
              : scope.row.statsData.status === 'running'
              ? '运行中'
              : '等待中'
          }}
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
        { label: '全部', value: 'all' },
        { label: '运行中', value: 'running' },
        { label: '等待中', value: 'done' }
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
        dataFlowId: {
          like: this.$route.query.id,
          options: 'i'
        },
        statsType: 'dataFlowDetailsStats'
      }
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword) }
        where.or = [{ 'statsData.sourceTableName': filterObj }, { 'statsData.targetTableName': filterObj }]
      }
      if (metaType !== 'all') {
        where['statsData.meta_type'] = metaType
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
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'sourceTableName'} ${order === 'sourceTableName' ? 'ASC' : 'DESC'}`
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
    height: 30px;
    padding-left: 20px;
    line-height: 30px;
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
    }
  }
}
</style>
