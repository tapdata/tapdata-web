<script setup lang="ts">
import { fetchAllMethods, fetchApiCalls } from '@tap/api/src/core/api-calls'
import { fetchApiClients } from '@tap/api/src/core/api-client'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tableRef = ref<InstanceType<typeof TablePage>>()

const searchParams = reactive({
  keyword: '',
  clientName: '',
  method: '',
  code: '',
  start: '' as string | number,
  end: '' as string | number,
  options: 'i',
})

const filterItems = ref<any[]>([])
const order = ref('createTime DESC')

const colorMap: Record<string, string> = {
  POST: '#478C6C',
  PATCH: '#F2994B',
  DELETE: '#DB5050',
  GET: '#09819C',
}

const defaultSort = ref<{
  prop: string
  order: 'descending' | 'ascending' | null
}>({
  prop: 'createTime',
  order: 'descending',
})

// 从 route.query 初始化参数
function initFromQuery(query: Record<string, any>) {
  if (query.keyword) {
    searchParams.keyword = query.keyword
  }
  if (query.code) {
    searchParams.code = query.code
  }
  if (query.start) {
    searchParams.start = Number(query.start)
  }
  if (query.end) {
    searchParams.end = Number(query.end)
  }
  if (query.sortBy && query.sortOrder) {
    order.value = `${query.sortBy} ${query.sortOrder}`
    defaultSort.value = {
      prop: query.sortBy,
      order: query.sortOrder === 'ASC' ? 'ascending' : 'descending',
    }
  }
}

function toDetails(item: any) {
  router.push({
    name: 'dataServerAuditDetails',
    params: { id: item.id },
  })
}

// 获取数据
function getData({ page }: { page: { current: number; size: number } }) {
  const { current, size } = page
  const { method, code, start, end, clientId, keyword, options } =
    searchParams as any
  const where: Record<string, any> = {}
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
    const filterObj = {
      like: escapeRegExp(keyword),
      options: options ? '-' : options,
    }
    where.or = [{ name: filterObj }, { id: filterObj }]
  }

  const filter = {
    order: order.value,
    limit: size,
    skip: (current - 1) * size,
    where,
  }
  return fetchApiCalls(filter).then((data: any) => {
    return {
      total: data?.total || 0,
      data:
        data?.items.map((item: any) => {
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
}

function formatDuring(mss: number) {
  const ms = Number(mss)
  if (!Number.isFinite(ms) || ms <= 0) return '0ms'

  if (ms >= 24 * 60 * 60 * 1000) return '24h+'
  if (ms >= 60 * 60 * 1000) return `${(ms / (60 * 60 * 1000)).toFixed(2)}h`
  if (ms >= 60 * 1000) return `${(ms / (60 * 1000)).toFixed(2)}min`
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`

  return `${Math.round(ms)}ms`
}

// 表格排序
function handleSortTable({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) {
  order.value = `${sortOrder ? prop : 'createTime'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  tableRef.value?.fetch(1)
}

function getFilterItems() {
  filterItems.value = [
    {
      label: t('apiaudit_access_type'),
      key: 'method',
      type: 'select-inner',
      items: async () => {
        let data = await fetchAllMethods()
        data = data || []
        return data.map((item: string) => {
          return {
            label: item,
            value: item,
          }
        })
      },
      selectedWidth: '200px',
    },
    {
      label: t('apiaudit_visit_result'),
      key: 'code',
      type: 'select-inner',
      items: [
        {
          label: t('apiaudit_success'),
          value: '200',
        },
        {
          label: t('public_status_failed'),
          value: '500',
        },
      ],
      selectedWidth: '200px',
    },
    {
      label: t('api_monitor_total_clientName'),
      key: 'clientId',
      type: 'select-inner',
      items: async () => {
        const res = await fetchApiClients({
          limit: 1000,
        })

        return (
          (res as any).items?.map((item: any) => {
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
      startPlaceholder: t('apiaudit_interview_time_start'),
      endPlaceholder: t('apiaudit_interview_time_end'),
    },
    {
      placeholder: t('apiaudit_placeholder'),
      key: 'keyword',
      type: 'input',
    },
  ]
}

watch(
  () => route.query,
  (newQuery) => {
    initFromQuery(newQuery)
    tableRef.value?.fetch(1)
  },
)

// 初始化
getFilterItems()
initFromQuery(route.query)
</script>

<template>
  <PageContainer>
    <!-- 服务审计 -->
    <TablePage
      ref="tableRef"
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
            @fetch="tableRef?.fetch(1)"
          />
        </div>
      </template>
      <el-table-column
        prop="name"
        :label="$t('apiaudit_req_path')"
        min-width="220"
      >
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
          <span
            v-if="!row.failed"
            class="status-badge status-badge--success rounded-lg"
          >
            <span class="status-badge__dot" />
            {{ row.code }} {{ $t('apiaudit_success') }}
          </span>
          <el-tooltip
            v-else
            :disabled="!row.codeMsg"
            :content="row.codeMsg"
            placement="top"
            :hide-after="0"
          >
            <span
              class="status-badge status-badge--danger rounded-lg"
              :class="{ 'underline-dashed': row.codeMsg }"
            >
              <span class="status-badge__dot" />
              {{ row.code }} {{ $t('public_status_failed') }}
            </span>
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
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  &--success {
    color: var(--color-success);
    .status-badge__dot {
      background-color: var(--color-success);
    }
  }
  &--danger {
    color: var(--color-danger);
    .status-badge__dot {
      background-color: var(--color-danger);
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
