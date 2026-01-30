<script>
import { CircleCloseFilled, SuccessFilled } from '@element-plus/icons-vue'
import { fetchAllMethods, fetchApiCalls } from '@tap/api/src/core/api-calls'
import { fetchApiClients } from '@tap/api/src/core/api-client'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    CircleCloseFilled,
    SuccessFilled,
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        clientName: '',
        method: '',
        code: '',
        start: '',
        end: '',
        options: 'i'
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
      defaultSort: { prop: 'createTime', order: 'descending' },
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function (newQuery) {
      this.initFromQuery(newQuery)
      this.table.fetch(1)
    },
    'searchParams.createTime': function () {},
  },
  created() {
    this.getFilterItems()
    this.initFromQuery(this.$route.query)
  },
  methods: {
    // 从 route.query 初始化参数
    initFromQuery(query) {
      if (query.keyword) {
        this.searchParams.keyword = query.keyword
      }
      if (query.code) {
        this.searchParams.code = query.code
      }
      if (query.start) {
        this.searchParams.start = Number(query.start)
      }
      if (query.end) {
        this.searchParams.end = Number(query.end)
      }
      if (query.sortBy && query.sortOrder) {
        this.order = `${query.sortBy} ${query.sortOrder}`
        this.defaultSort = {
          prop: query.sortBy,
          order: query.sortOrder === 'ASC' ? 'ascending' : 'descending',
        }
      }
    },

    toDetails(item) {
      this.$router.push({
        name: 'dataServerAuditDetails',
        params: { id: item.id },
      })
    },

    // 获取数据
    getData({ page }) {
      const { current, size } = page
      const { method, code, start, end, clientId, keyword, options } = this.searchParams
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
      if (clientId) {
        where.clientId = clientId
      }
      if (keyword && keyword.trim()) {
        const filterObj = { like: escapeRegExp(keyword), options: options ? '-' : options }
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
              item.reqTimeFmt = item.reqTime
                ? dayjs(item.reqTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              return item
            }) || [],
        }
      })
    },
    formatDuring(mss) {
      let time = ''
      const minutes = Number.parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = (mss % (1000 * 60)) / 1000
      if (minutes > 1) {
        time = `${minutes.toFixed(2)}min`
      } else if (minutes < 1 && seconds > 1) {
        time = `${seconds.toFixed(2)}s`
      } else if (minutes < 1 && seconds < 1 && mss > 0) {
        time = `${mss}ms`
      }
      return time
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
          items: [
            {
              label: this.$t('apiaudit_success'),
              value: '200',
            },
            {
              label: this.$t('public_status_failed'),
              value: '500',
            },
          ],
          selectedWidth: '200px',
        },
        {
          label: this.$t('api_monitor_total_clientName'),
          key: 'clientId',
          type: 'select-inner',
          items: async () => {
            const res = await fetchApiClients({
              limit: 1000,
            })

            return (
              res.items?.map((item) => {
                return {
                  label: item.clientName,
                  value: item.clientId,
                }
              }) || []
            )
          },
        },
        {
          key: 'start,end',
          type: 'datetimerange',
          startPlaceholder: this.$t('apiaudit_interview_time_start'),
          endPlaceholder: this.$t('apiaudit_interview_time_end'),
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
  <PageContainer>
    <!-- 服务审计 -->
    <TablePage
      ref="table"
      row-key="id"
      class="apiaudit-list"
      :default-sort="defaultSort"
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
      <el-table-column prop="name" :label="$t('apiaudit_req_path')" min-width="220">
        <template #default="{ row }">
          <div>{{ row.apiPath }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="method"
        width="100"
        :label="$t('apiaudit_access_type')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <span
            class="status-block color-white"
            :style="{ 'background-color': colorMap[row.method] }"
            >{{ row.method }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="clientName"
        width="160"
        :label="$t('apiaudit_visitor')"
      />
      <el-table-column prop="userIp" width="120" :label="$t('apiaudit_ip')" />
      <el-table-column
        :label="$t('apiaudit_interview_time')"
        :show-overflow-tooltip="true"
        prop="reqTime"
        width="170"
        sortable="reqTime"
      >
        <template #default="{ row }">
          {{ row.reqTimeFmt }}
        </template>
      </el-table-column>
      <el-table-column
        prop="failed"
        width="110"
        :label="$t('apiaudit_visit_result')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <el-text v-if="row.failed" type="success">
            <el-icon><SuccessFilled /></el-icon>
            <span class="ml-1">
              {{ $t('apiaudit_success') }}
            </span>
          </el-text>
          <el-tooltip
            v-else
            :disabled="!row.codeMsg"
            :content="row.codeMsg"
            placement="top"
            :hide-after="0"
          >
            <el-text type="danger">
              <el-icon><CircleCloseFilled /></el-icon>
              <span class="ml-1" :class="{ 'underline-dashed': row.codeMsg }">
                {{ $t('public_status_failed') }}
              </span>
            </el-text>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="latency"
        width="170"
        sortable="latency"
        :label="$t('api_response_time')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ row.latency ? formatDuring(row.latency) : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="dbCost"
        width="170"
        sortable="dbCost"
        :label="$t('api_db_cost_time')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ row.dbCost ? formatDuring(row.dbCost) : '-' }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="codeMsg"
        :label="$t('apiaudit_reason_fail')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          {{ row.code === 200 ? '-' : row.codeMsg }}
        </template>
      </el-table-column> -->
      <el-table-column
        :label="$t('public_operation')"
        width="100"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-readonlybtn="'API_clients_amangement'"
            text
            type="primary"
            @click="toDetails(scope.row)"
          >
            {{ $t('public_button_details') }}
          </el-button>
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
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
