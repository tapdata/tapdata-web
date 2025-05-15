<script setup lang="ts">
import { taskInspectApi } from '@tap/api'
import { VEmpty } from '@tap/component'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { onBeforeUnmount, ref, watch } from 'vue'
import InspectDetailDialog from './InspectDetailDialog.vue'

interface Props {
  dataflow: {
    id?: string
    [key: string]: any
  }
  currentTab: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'openInspect'): void
}>()

interface InspectItem {
  id: string
  type: string
  beginTime: string
  endTime: string
  status: string
  statusType: string
  pingTime?: string
  attrs: {
    cdcIgnores: number
    cdcAccepts: number
    diffToTotals?: number
  }
}

interface TaskInspectHistory {
  id: string
  type: string
  beginTime: string
  endTime: string
  status: string
  attrs: {
    cdcIgnores: number
    cdcAccepts: number
    diffToTotals?: number
  }
}

interface ApiResponse {
  total: number
  items: TaskInspectHistory[]
}

const columns = [
  {
    label: i18n.t('packages_dag_inspect_type'),
    prop: 'type',
    minWidth: 100,
  },
  {
    label: i18n.t('packages_dag_inspect_start_time'),
    prop: 'beginTime',
    minWidth: 170,
    dataType: 'time',
  },
  {
    label: i18n.t('packages_dag_inspect_end_time'),
    prop: 'endTime',
    minWidth: 170,
    dataType: 'time',
  },
  {
    label: i18n.t('packages_dag_inspect_status'),
    prop: 'status',
    slotName: 'status',
    minWidth: 100,
  },
  {
    label: i18n.t('public_operation'),
    slotName: 'operation',
    width: 100,
  },
]

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentInspectId = ref('')
const inspectList = ref<InspectItem[]>([])
const pingTime = ref('')
const showEnabled = ref(false)
let timeout: number | undefined

const makeStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    RUNNING: i18n.t('public_status_running'),
    STOPPED: i18n.t('public_status_stop'),
    DONE: i18n.t('public_status_finished'),
    ERROR: i18n.t('public_status_error'),
  }

  const typeMap: Record<string, string> = {
    RUNNING: 'success',
    STOPPED: 'info',
    DONE: 'primary',
    ERROR: 'danger',
  }

  return {
    status: statusMap[status],
    statusType: typeMap[status],
  }
}

const handleDetail = (row: InspectItem) => {
  currentInspectId.value = row.id
  pingTime.value = dayjs(row.pingTime || row.beginTime).format(
    'YYYY-MM-DD HH:mm:ss',
  )
  detailDialogVisible.value = true
}

const remoteMethod = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const { id: taskId } = props.dataflow || {}

  if (!taskId) return Promise.resolve({ total: 0, data: [] })

  const filter = JSON.stringify({
    page: current,
    size,
    sort: ['beginTime desc'],
  })

  try {
    const response = await taskInspectApi.getHistories(taskId, { filter })
    const data = response as unknown as ApiResponse
    return {
      total: data.total || 0,
      data:
        data.items?.map((item) => ({
          id: item.id,
          type: item.type,
          beginTime: dayjs(item.beginTime).format('YYYY-MM-DD HH:mm:ss'),
          endTime: item.endTime
            ? dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          ...makeStatus(item.status),
          attrs: item.attrs,
        })) || [],
    }
  } catch (error) {
    console.error('Failed to fetch inspection results:', error)
    return { total: 0, data: [] }
  }
}

const fetch = async () => {
  loading.value = true
  const { data } = await remoteMethod({
    page: { current: 1, size: 10 },
  })

  // data.sort((a, b) => dayjs(b.beginTime).diff(dayjs(a.beginTime)))

  inspectList.value = data
  loading.value = false
}

const checkEnabled = async () => {
  const res = await taskInspectApi.getConfig(props.dataflow.id)
  return res.mode && res.mode !== 'CLOSE'
}

const startLoop = () => {
  timeout = window.setInterval(fetch, 5000)
}

const stopLoop = () => {
  if (timeout) {
    clearInterval(timeout)
  }
}

watch(
  () => props.currentTab,
  (val) => {
    if (val === 'inspect') {
      fetch()
      startLoop()
    } else {
      stopLoop()
    }
  },
)

fetch().then(async () => {
  if (!inspectList.value.length) {
    const enabled = await checkEnabled()
    if (!enabled) {
      showEnabled.value = true
    }
  }
})

onBeforeUnmount(() => {
  stopLoop()
})
</script>

<template>
  <div v-loading="loading" class="inspect-wrap p-4 h-100 w-100 overflow-y-auto">
    <div class="flex flex-column gap-4">
      <div
        v-for="inspect in inspectList"
        :key="inspect.id"
        class="flex align-items-stretch border rounded-lg overflow-hidden cursor-pointer hover:bg-light"
        @click="handleDetail(inspect)"
      >
        <div
          class="flex flex-column align-center gap-2 bg-light p-3 border-end"
          style="min-width: 150px"
        >
          <div class="rounded-lg px-2 py-1 bg-fill-hover">
            {{ inspect.type }}
          </div>
          <ElTag :type="inspect.statusType" size="small">{{
            inspect.status
          }}</ElTag>
        </div>

        <div
          class="flex justify-content-around align-center flex-1 gap-4 p-3 px-4 border-end"
        >
          <div class="flex flex-column gap-2" style="min-width: 150px">
            <span class="flex align-center gap-1"
              ><VIcon>time</VIcon>{{ $t('packages_dag_inspect_start_time') }}
            </span>
            <span class="fw-sub font-color-dark">
              {{ inspect.beginTime }}
            </span>
          </div>
          <div class="flex flex-column gap-2" style="min-width: 150px">
            <span class="flex align-center gap-1"
              ><VIcon>time</VIcon>{{ $t('packages_dag_inspect_end_time') }}
            </span>
            <span class="fw-sub font-color-dark">
              {{ inspect.endTime || '-' }}
            </span>
          </div>
        </div>

        <div
          class="flex justify-content-around align-center flex-1 gap-4 p-3 px-4"
        >
          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>EyeOff</VIcon
              >{{ $t('packages_dag_inspect_ignore_records') }}</span
            >
            <span class="fw-sub font-color-dark">
              {{ inspect.attrs.cdcIgnores }}
            </span>
          </div>

          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>Eye</VIcon
              >{{ $t('packages_dag_inspect_accept_records') }}</span
            >
            <span class="fw-sub font-color-dark">
              {{ inspect.attrs.cdcAccepts }}
            </span>
          </div>

          <div class="flex flex-column gap-2">
            <span class="flex align-center gap-1"
              ><VIcon>FileChartColumnIncreasing</VIcon
              >{{ $t('packages_dag_inspect_diff_records') }}</span
            >
            <span
              class="fw-sub font-color-dark"
              :class="{
                'color-danger': inspect.attrs.diffToTotals > 0,
              }"
            >
              {{ inspect.attrs.diffToTotals }}
            </span>
          </div>

          <ElButton text type="primary">
            {{ $t('public_button_details') }}
            <VIcon>arrow-right</VIcon>
          </ElButton>
        </div>
      </div>
    </div>

    <VEmpty v-if="inspectList.length === 0" large>
      <template v-if="showEnabled">
        <div class="flex flex-column gap-3 align-center">
          <span class="font-color-light">{{
            $t('packages_dag_inspect_start_config_desc')
          }}</span>
          <ElButton @click="emit('openInspect')">
            <VIcon>data-scan</VIcon>
            {{ $t('packages_dag_inspect_start_config') }}
          </ElButton>
        </div>
      </template>
    </VEmpty>

    <InspectDetailDialog
      v-model="detailDialogVisible"
      :inspect-id="currentInspectId"
      :ping-time="pingTime"
    />
  </div>
</template>
