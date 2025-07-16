<script>
import { CircleCloseFilled, SuccessFilled } from '@element-plus/icons-vue'
import { fetchAllMethods, fetchAllResponseCodes, fetchApiCalls } from '@tap/api'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'

export default {
  name: 'ApiAudit',
  components: {
    TablePage,
    FilterBar,
    CircleCloseFilled,
    SuccessFilled,
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        method: '',
        code: '',
        start: '',
        end: '',
      },
      filterItems: [],
      order: 'createTime DESC',
      createDialogVisible: false,
      createForm: {
        processId: '',
        clientName: '',
        clientURI: '',
      },
      colorMap: {
        POST: '#478C6C',
        PATCH: '#F2994B',
        DELETE: '#DB5050',
        GET: '#09819C',
      },
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
    'searchParams.createTime': function () {},
  },
  created() {
    this.getFilterItems()
  },
  methods: {
    toDetails(item) {
      this.$router.push({
        name: 'dataServerAuditDetails',
        params: { id: item.id },
      })
    },

    // 获取数据
    getData({ page }) {
      const { current, size } = page
      const { method, code, start, end, keyword } = this.searchParams
      const where = {}
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
        const filterObj = { like: escapeRegExp(keyword), options: 'i' }
        where.or = [{ name: filterObj }, { id: filterObj }]
      }

      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return fetchApiCalls(filter).then((data) => {
        return {
          total: data?.total || 0,
          data:
            data?.items.map((item) => {
              item.createTimeFmt = item.createTime
                ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              return item
            }) || [],
        }
      })
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('apiaudit_access_type'),
          key: 'method',
          type: 'select-inner',
          items: async () => {
            let data = await fetchAllMethods()
            data = data || []
            return data.map((item) => {
              return {
                label: item,
                value: item,
              }
            })
          },
          selectedWidth: '200px',
        },
        {
          label: this.$t('apiaudit_visit_result'),
          key: 'code',
          type: 'select-inner',
          items: async () => {
            let data = await fetchAllResponseCodes()
            data = data || []
            return data.map((item) => {
              return {
                label:
                  item == 200
                    ? this.$t('apiaudit_success')
                    : this.$t('public_status_failed'),
                value: item,
              }
            })
          },
          selectedWidth: '200px',
        },
        {
          title: this.$t('apiaudit_interview_time'),
          key: 'start,end',
          type: 'datetimerange',
          placeholder: this.$t('public_select_placeholder'),
          selectedWidth: '200px',
        },
        {
          placeholder: this.$t('apiaudit_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
  },
}
</script>

<template>
  <section class="apiaudit-wrap h-100">
    <!-- 服务审计 -->
    <TablePage
      ref="table"
      row-key="id"
      class="apiaudit-list"
      :remote-method="getData"
      @sort-change="handleSortTable"
    >
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </div>
      </template>
      <el-table-column prop="id" label="API ID" :show-overflow-tooltip="true" />
      <el-table-column prop="name" :label="$t('apiaudit_name')" />
      <el-table-column
        prop="method"
        width="100"
        :label="$t('apiaudit_access_type')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <span
            class="status-block"
            :style="{ 'background-color': colorMap[row.method] }"
            >{{ row.method }}</span
          >
        </template>
      </el-table-column>
      <el-table-column prop="clientName" :label="$t('apiaudit_visitor')" />
      <el-table-column
        :label="$t('apiaudit_interview_time')"
        :show-overflow-tooltip="true"
        prop="createTime"
        width="160"
        sortable="createTime"
      >
        <template #default="{ row }">
          {{ row.createTimeFmt }}
        </template>
      </el-table-column>
      <el-table-column
        prop="code"
        width="80"
        :label="$t('apiaudit_visit_result')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <span v-if="row.code == 200" class="success">
            <el-icon class="connections-status__icon"
              ><SuccessFilled
            /></el-icon>
            <span>
              {{ $t('apiaudit_success') }}
            </span>
          </span>
          <span v-else class="error">
            <el-icon class="connections-status__icon"
              ><CircleCloseFilled
            /></el-icon>
            <span>
              {{ $t('public_status_failed') }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="codeMsg"
        :label="$t('apiaudit_reason_fail')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ row.code == 200 ? '-' : row.codeMsg }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_operation')" width="70" fixed="right">
        <template #default="scope">
          <el-button
            v-readonlybtn="'API_clients_amangement'"
            text
            @click="toDetails(scope.row)"
          >
            {{ $t('public_button_details') }}
          </el-button>
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

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
    color: var(--text-white);
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
