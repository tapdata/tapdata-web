<template>
  <section class="apiaudit-wrap section-wrap">
    <!-- api审计 -->
    <TablePage ref="table" row-key="id" class="apiaudit-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <el-table-column label="API ID" :show-overflow-tooltip="true" prop="id"></el-table-column>
      <el-table-column :label="$t('apiaudit_name')" prop="name" sortable="name"> </el-table-column>
      <el-table-column
        :label="$t('apiaudit_access_type')"
        :show-overflow-tooltip="true"
        prop="method"
        sortable="method"
      ></el-table-column>
      <el-table-column
        :label="$t('apiaudit_interview_time')"
        :show-overflow-tooltip="true"
        prop="createTime"
        sortable="createTime"
      >
        <template #default="{ row }">
          {{ row.createTime ? $moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('apiaudit_visit_result')" :show-overflow-tooltip="true" prop="code" sortable="code">
      </el-table-column>
      <el-table-column
        :label="$t('apiaudit_reason_fail')"
        :show-overflow-tooltip="true"
        prop="codeMSg"
        sortable="codeMSg"
      >
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="140" fixed="right">
        <template slot-scope="scope">
          <el-button v-readonlybtn="'API_clients_amangement'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('button_details') }}
          </el-button>
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'

export default {
  name: 'ApiAudit',
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: ''
      },
      filterItems: [],
      order: 'clientName DESC',
      createDialogVisible: false,
      createForm: {
        processId: '',
        clientName: '',
        clientURI: ''
      }
    }
  },
  created() {
    this.getFilterItems()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 重置查询条件
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: ''
        }
      }
      this.table.fetch(1)
    },

    toDetails(item) {
      this.$router.push({ name: 'apiAuditDetails', params: { id: item.id } })
    },

    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ clientName: filterObj }]
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return this.$api('ApiCalls')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res) {
            this.table.setCache({
              keyword
            })
            return {
              total: res.data?.total || 0,
              data: res.data?.items || []
            }
          }
        })
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'clientName'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('api_server_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.apiaudit-wrap {
  height: 100%;
  .apiaudit-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
  }
}
</style>
<style lang="scss">
.apiaudit-wrap {
  .table-span {
    margin: 0 2px;
    padding: 2px;
    border: 1px solid #ccc;
  }
}
</style>
