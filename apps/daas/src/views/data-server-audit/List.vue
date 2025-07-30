<script>
import { CircleCloseFilled, SuccessFilled } from '@element-plus/icons-vue'
import {
  fetchAllMethods,
  fetchAllResponseCodes,
  fetchApiCalls,
  fetchApiClients,
} from '@tap/api'
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
      const { method, code, start, end, clientId, keyword } = this.searchParams
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
      <el-table-column prop="name" :label="$t('apiaudit_name')" width="220">
        <template #default="{ row }">
          <div>{{ row.name }}</div>
          <el-tag class="is-code" size="small" type="info" disable-transitions>
            <span class="text-caption">
              {{ row.apiId }}
            </span>
          </el-tag>
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
        prop="createTime"
        width="170"
        sortable="createTime"
      >
        <template #default="{ row }">
          {{ row.createTimeFmt }}
        </template>
      </el-table-column>
      <el-table-column
        prop="code"
        width="100"
        :label="$t('apiaudit_visit_result')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <el-text v-if="String(row.code) === '200'" type="success">
            <el-icon><SuccessFilled /></el-icon>
            <span class="ml-1">
              {{ $t('apiaudit_success') }}
            </span>
          </el-text>
          <el-text v-else type="danger">
            <el-icon><CircleCloseFilled /></el-icon>
            <span class="ml-1">
              {{ $t('public_status_failed') }}
            </span>
          </el-text>
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
