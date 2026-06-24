<script setup lang="ts">
import { fetchClusterStates } from '@tap/api/src/core/cluster'
import { getExternalStorage } from '@tap/api/src/core/external-storage'
import {
  deleteSharedCache,
  fetchSharedCache,
} from '@tap/api/src/core/shared-cache'
import {
  batchRenewTasks,
  batchStartTasks,
  batchStopTasks,
  exportTasks,
  fetchTasks,
  forceStopTask,
} from '@tap/api/src/core/task'
import { requestClient, withPassive } from '@tap/api/src/request'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp, uniqBy } from 'lodash-es'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import Upload from '../../components/UploadDialog.vue'
import { makeStatusAndDisabled } from '../../shared'
import Details from './Details.vue'
import Editor from './Editor.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const buried =
  inject<(name: string, extra?: string, params?: object) => void>('buried')
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

// ── Refs ──────────────────────────────────────────────────────────────────────

const table = ref<any>()
const editor = ref<any>()
const details = ref<any>()
const upload = ref<any>()

const searchParams = ref({
  name: '',
  connectionName: '',
  status: '',
  agentId: '',
})

const order = ref('cacheTimeAt DESC')
let timer: ReturnType<typeof setInterval> | null = null
const taskBuried = { start: 'sharedMiningStart' }
const multipleSelection = ref<any[]>([])

// ── Computed ──────────────────────────────────────────────────────────────────

const filterItems = computed(() => [
  {
    label: t('public_status'),
    key: 'status',
    type: 'select-inner',
    items: [
      { label: t('public_status_running'), value: 'running' },
      { label: t('public_status_stop'), value: 'stop' },
      { label: t('public_status_error'), value: 'error' },
    ],
  },
  {
    label: t('public_agent_name'),
    key: 'agentId',
    type: 'select-inner',
    menuMinWidth: '250px',
    items: async () => {
      if (isDaas) {
        const clusterData = await fetchClusterStates()
        const options = (clusterData?.items || [])
          .filter((item) => item.systemInfo?.process_id)
          .map((item) => ({
            label: (item as any).agentName || item.systemInfo.hostname,
            value: item.systemInfo.process_id,
          }))
        return uniqBy(options, 'value')
      }
      // Cloud mode
      const filter = { where: { status: { $in: ['Running'] } }, size: 100 }
      const data = await requestClient.get<any>(
        `api/tcm/agent?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      return (data?.items || []).map((item: any) => ({
        label: item.name,
        value: item.tmInfo.agentId,
      }))
    },
  },
  {
    placeholder: t('public_task_name'),
    key: 'name',
    type: 'input',
  },
  {
    placeholder: t('public_connectionName'),
    key: 'connectionName',
    type: 'input',
  },
])

// ── Data fetching ─────────────────────────────────────────────────────────────

const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const { name, connectionName, status, agentId } = searchParams.value
  const where: Record<string, any> = {}

  if (name) {
    where.name = { like: escapeRegExp(name), options: 'i' }
  }
  if (connectionName) {
    where.connectionName = { like: escapeRegExp(connectionName), options: 'i' }
  }
  if (status) {
    where.status = status
  }
  if (agentId) {
    where.agentId = agentId
  }

  const filter = {
    order: order.value,
    limit: size,
    skip: (current - 1) * size,
    where,
  }
  const data = await fetchSharedCache(filter)
  const list: any[] = data?.items || []
  return {
    total: data?.total,
    data: list.map((item) => {
      item.createTimeFmt = item.createTime
        ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
        : '-'
      makeStatusAndDisabled(item)
      return item
    }),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getConfirmMessage = (operateStr: string, task: { name: string }) => {
  const strArr = t(`dataFlow_${operateStr}_confirm_message`).split('xxx')
  const msg = `<p>${strArr[0]}<span class="color-primary">${task.name}</span>${strArr[1]}</p>`
  return { msg, title: t(`dataFlow_${operateStr}_confirm_title`) }
}

const openRoute = (routeObj: any, newTab = true) => {
  if (newTab) {
    window.open(router.resolve(routeObj).href)
  } else {
    router.push(routeObj)
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

const handleEditor = (row: any = {}) => {
  editor.value?.open(row.id)
}

const create = () => {
  handleEditor({ id: '' })
}

const checkDetails = (row: any) => {
  details.value?.getData(row.id)
}

const del = async (row: any = {}) => {
  try {
    await ElMessageBox.confirm(
      t('public_message_delete_confirm_with_name', { val: row.name }),
    )
    await deleteSharedCache(row.id)
    ElMessage.success(t('public_message_delete_ok'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

const handleSortTable = ({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) => {
  order.value = `${sortOrder ? prop : 'cacheTimeAt'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const start = async (ids: string[], row: any) => {
  const externalStorage = await getExternalStorage(
    row.externalStorageId,
    undefined,
  )
  if (!externalStorage?.id) {
    ElMessage.error(t('packages_business_shared_cache_list_qingxianxiugaiwai'))
    return
  }
  buried?.(taskBuried.start)
  fetchTasks({ where: { id: ids[0] } }).then(() => {
    batchStartTasks(ids)
      .then((data: any) => {
        buried?.(taskBuried.start, '', { result: true })
        ElMessage.success(
          data?.message || t('public_message_operation_success'),
        )
        table.value?.fetch()
      })
      .catch(() => {
        buried?.(taskBuried.start, '', { result: false })
      })
  })
}

const forceStop = async (ids: string[], row: any) => {
  const { msg, title } = getConfirmMessage('force_stop', row)
  try {
    await ElMessageBox.confirm(msg, title, { dangerouslyUseHTMLString: true })
    const data: any = await forceStopTask(ids[0]!)
    ElMessage.success(data?.message || t('public_message_operation_success'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

const stop = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      t('packages_business_stop_confirm_message'),
      t('packages_business_important_reminder'),
    )
    const data: any = await batchStopTasks(ids)
    ElMessage.success(data?.message || t('public_message_operation_success'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

const handleDetails = (task: any = {}) => {
  openRoute({ name: 'SharedCacheMonitor', params: { id: task.id } })
}

const handleReset = async (row: any) => {
  const { msg, title } = getConfirmMessage('initialize', row)
  try {
    await ElMessageBox.confirm(msg, title, { dangerouslyUseHTMLString: true })
    const data: any = await batchRenewTasks([row.id])
    ElMessage.success(data?.message || t('public_message_operation_success'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

const handleExport = () => {
  const ids = multipleSelection.value.map((t) => t.id)
  exportTasks(ids)
}

const handleImport = () => {
  upload.value?.show()
}

// ── Lifecycle & Watchers ──────────────────────────────────────────────────────

watch(
  () => route.query,
  () => {
    searchParams.value = {
      ...searchParams.value,
      name: (route.query?.keyword as string) || '',
    }
    table.value?.fetch(1)
  },
)

onMounted(() => {
  timer = setInterval(() => {
    withPassive(() => table.value?.fetch(null, 0, true))
  }, 8000)
  Object.assign(searchParams.value, { name: route.query?.keyword || '' })
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-show="multipleSelection.length > 0 && isDaas"
        v-readonlybtn="'SYNC_job_export'"
        class="btn message-button-cancel"
        @click="handleExport"
      >
        <span> {{ $t('public_button_export') }}</span>
      </el-button>
      <el-button
        v-if="isDaas"
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        @click="handleImport"
      >
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </el-button>
      <ElButton class="btn btn-create" type="primary" @click="create">
        <span> {{ $t('packages_business_shared_cache_button_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      @sort-change="handleSortTable"
      @selection-change="handleSelectionChange"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table?.fetch(1)"
        />
      </template>
      <el-table-column
        reserve-selection
        type="selection"
        width="32"
        align="center"
        :selectable="(row) => !row.hasChildren"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="name"
        :label="$t('packages_business_shared_cache_name')"
      >
        <template #default="{ row }">
          <ElLink
            style="display: inline"
            type="primary"
            @click.stop="checkDetails(row)"
            >{{ row.name }}</ElLink
          >
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="connectionName"
        width="260"
        :label="$t('packages_business_shared_cache_column_connection')"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="tableName"
        width="240"
        :label="$t('packages_business_shared_cache_column_table')"
      />
      <ElTableColumn
        :label="$t('packages_business_shared_cache_status')"
        width="120"
      >
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="createTime"
        :label="$t('public_create_time')"
        width="160"
        sortable="createTime"
      >
        <template #default="scope">
          {{ scope.row.createTimeFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="cacheTimeAt"
        width="160"
        :label="$t('packages_business_shared_cache_time')"
      >
        <template #default="scope">
          {{ scope.row.cacheTimeAtFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="290" :label="$t('public_operation')" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id], row)"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <template v-else>
              <ElButton
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.forceStop"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElButton>
              <ElButton
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.stop"
                @click="stop([row.id])"
              >
                {{ $t('public_button_stop') }}
              </ElButton>
            </template>
            <ElDivider
              v-readonlybtn="'SYNC_job_operation'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.edit"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.reset"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.delete"
              @click="del(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </TablePage>
    <Editor ref="editor" @success="table?.fetch(1)" />
    <Details ref="details" width="380px" />
    <!-- 导入 -->
    <Upload
      v-if="isDaas"
      ref="upload"
      type="dataflow"
      :show-tag="false"
      @success="table?.fetch()"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: var(--color-danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid var(--border-light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid var(--border-light);
    .label {
      font-size: var(--font-base-title);
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: var(--font-base-title);
      color: var(--text-dark);
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: var(--bg-normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: var(--color-white);
  }
}
</style>
