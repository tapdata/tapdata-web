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
      >
        <template #default="{ row }">
          <span class="status-block" :style="{ 'background-color': colorMap[row.method] }">{{ row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('apiaudit_visitor')" prop="clientName"> </el-table-column>
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
        <template #default="{ row }">
          {{ row.code == 200 ? $t('apiaudit_success') : $t('apiaudit_fail') }}
        </template>
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
        keyword: '',
        method: '',
        code: '',
        start: '',
        end: ''
      },
      filterItems: [],
      order: 'createTime DESC',
      createDialogVisible: false,
      createForm: {
        processId: '',
        clientName: '',
        clientURI: ''
      },
      colorMap: {
        POST: '#478C6C',
        PATCH: '#F2994B',
        DELETE: '#DB5050',
        GET: '#09819C'
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
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    },
    'searchParams.createTime'() {}
  },
  methods: {
    toDetails(item) {
      this.$router.push({ name: 'apiAuditDetails', params: { id: item.id } })
    },

    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { method, code, start, end, keyword } = this.searchParams
      let where = {}
      if (method) {
        where.method = method
      }
      if (code) {
        where.code = code
      }
      if (start) {
        where.start = start
      }
      if (end) {
        where.end = end
      }
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ name: filterObj }, { id: filterObj }]
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
          label: this.$t('apiaudit_access_type'),
          key: 'method',
          type: 'select-inner',
          items: async () => {
            let res = await this.$api('ApiCalls').getAllMethod()
            let data = res?.data || []
            if (data?.length) {
              return data.map(item => {
                return {
                  label: item,
                  value: item
                }
              })
            } else {
              return []
            }
          },
          selectedWidth: '200px'
        },
        {
          label: this.$t('apiaudit_visit_result'),
          key: 'code',
          type: 'select-inner',
          items: async () => {
            let res = await this.$api('ApiCalls').getAllResponseCode()
            let data = res?.data || []
            if (data?.length) {
              return data.map(item => {
                return {
                  label: item == 200 ? this.$t('apiaudit_success') : this.$t('apiaudit_fail'),
                  value: item
                }
              })
            } else {
              return []
            }
          },
          selectedWidth: '200px'
        },
        {
          title: this.$t('apiaudit_interview_time'),
          key: 'start,end',
          type: 'datetimerange',
          placeholder: this.$t('common_placeholder_select'),
          selectedWidth: '200px'
        },
        {
          placeholder: this.$t('apiaudit_placeholder'),
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
  .status-block {
    color: #fff;
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
