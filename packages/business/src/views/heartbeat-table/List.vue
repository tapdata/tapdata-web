<script setup lang="ts">
import { fetchClusterStates } from '@tap/api/src/core/cluster'
import {
  batchDeleteTasks,
  batchRenewTasks,
  batchStartTasks,
  batchStopTasks,
  fetchTasks,
  forceStopTask,
} from '@tap/api/src/core/task'
import { requestClient } from '@tap/api/src/request'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp, uniqBy } from 'lodash-es'
import { computed, h, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import { makeStatusAndDisabled, TASK_TYPE_MAP } from '../../shared'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const buried =
  inject<(name: string, extra?: string, params?: object) => void>('buried')
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

const havePermission = (row: any, type: string) => {
  if (!isDaas) return true
  return row.permissionActions?.includes(type)
}

// ── Refs ──────────────────────────────────────────────────────────────────────

const table = ref<any>()

const searchParams = ref({
  keyword: '',
  status: '',
  agentId: '',
})

const order = ref('createTime DESC')
const spacer = h(ElDivider, { direction: 'vertical', class: 'mx-1' })
let timer: ReturnType<typeof setInterval> | null = null
const taskBuried = { start: 'heartbeatStart' }

// ── Computed ──────────────────────────────────────────────────────────────────

const colWidth = computed(() =>
  locale.value === 'en'
    ? { taskType: 140, status: 145, operation: 340 }
    : { taskType: 80, status: 110, operation: 280 },
)

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
    key: 'keyword',
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
  const where: Record<string, any> = { syncType: 'connHeartbeat' }
  const { keyword, status, agentId } = searchParams.value

  if (keyword?.trim()) {
    where.name = { like: escapeRegExp(keyword), options: 'i' }
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

  const data = await fetchTasks(filter)
  const list: any[] = data?.items || []
  return {
    total: data?.total || 0,
    data: list.map((item) => {
      item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
      item.taskType =
        TASK_TYPE_MAP[item.type as keyof typeof TASK_TYPE_MAP] || ''
      makeStatusAndDisabled(item)
      if (item.status === 'edit') {
        item.btnDisabled.start = false
      }
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

const start = (ids: string[]) => {
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
  openRoute({ name: 'HeartbeatMonitor', params: { id: task.id } })
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

const del = async (ids: string[], item: any = {}) => {
  try {
    await ElMessageBox.confirm(
      t('packages_business_shared_mining_list_shanchurenwus', {
        val1: item.name,
      }),
      t('packages_ldp_src_tablepreview_querenshanchu'),
      { dangerouslyUseHTMLString: true },
    )
    await batchDeleteTasks(ids)
    ElMessage.success(t('public_message_delete_ok'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

// ── Lifecycle & Watchers ──────────────────────────────────────────────────────

watch(
  () => route.query,
  () => {
    searchParams.value = route.query
    table.value?.fetch(1)
  },
)

onMounted(() => {
  timer = setInterval(() => {
    table.value?.fetch(null, 0, true)
  }, 8000)
  Object.assign(searchParams.value, route.query)
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
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remote-method="getData"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table?.fetch(1)"
        />
      </template>
      <el-table-column
        min-width="250"
        :label="$t('public_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('public_task_type')"
        :min-width="colWidth.taskType"
        prop="taskType"
      />
      <el-table-column
        min-width="110"
        prop="status"
        :label="$t('packages_business_shared_list_status')"
      >
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        min-width="160"
        :label="$t('public_create_time')"
        sortable
      />
      <el-table-column
        width="240"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <el-space :spacer="spacer" :size="0" class="flex-wrap">
            <ElButton
              v-if="
                row.btnDisabled.stop &&
                row.btnDisabled.forceStop &&
                havePermission(row, 'Start')
              "
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <ElButton
              v-else-if="
                havePermission(row, 'Stop') && row.status === 'stopping'
              "
              text
              type="primary"
              :disabled="row.btnDisabled.forceStop"
              @click="forceStop([row.id], row)"
            >
              {{ $t('public_button_force_stop') }}
            </ElButton>
            <ElButton
              v-else-if="havePermission(row, 'Stop')"
              text
              type="primary"
              :disabled="row.btnDisabled.stop"
              @click="stop([row.id])"
            >
              {{ $t('public_button_stop') }}
            </ElButton>
            <ElButton
              text
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElButton
              v-if="havePermission(row, 'Reset')"
              text
              type="primary"
              :disabled="row.btnDisabled.reset"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElButton
              v-if="havePermission(row, 'Delete')"
              text
              type="primary"
              :disabled="row.btnDisabled.delete"
              @click="del([row.id], row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </el-space>
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
</template>
