<script setup lang="ts">
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { inspectApi, metadataInstancesApi } from '@tap/api'
import loadingImg from '@tap/assets/icons/loading.svg'
import {
  ExportOutlined,
  FileAddColorful,
  FileDocxColorful,
  FilterBar,
  ImportOutlined,
  Modal,
  VIcon,
} from '@tap/component'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TablePage } from '../../components'
import { ErrorMessage } from '../../components/error-message'
import PageContainer from '../../components/PageContainer.vue'
import PermissionseSettingsCreate from '../../components/permissionse-settings/Create.vue'
import { inspectMethod, statusMap, typeList as verifyTypeList } from './const'

import type { UploadUserFile } from 'element-plus'

// 类型定义
interface SearchParams {
  keyword: string
  inspectMethod: string
  mode: string
  enabled: string
  result: string
}

interface FilterItem {
  label?: string
  key: string
  type: string
  items?: Array<{ label: string; value: string | number }>
  selectedWidth?: string
  id: string
  placeholder?: string
}

interface InspectResult {
  source_total: number
  target_total: number
  progress?: number
  parentId?: string
}

interface InspectItem {
  id: string
  name: string
  inspectMethod: string
  mode: string
  enabled: boolean
  status: string
  result: string
  lastStartTime: string
  sourceTotal: string | number
  targetTotal: string | number
  InspectResult?: InspectResult
  errorMsg?: string
  difference_number?: number
  flowId?: string
  user_id?: string
  permissionActions?: string[]
  tasks?: Array<{
    source: { columns?: any }
    target: { columns?: any }
  }>
}

interface ImportForm {
  type: 'task' | 'table'
  taskId: string
  fileList: UploadUserFile[]
}

// Composables
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Refs
const table = ref<InstanceType<typeof TablePage>>()
const permissionseSettingsCreate =
  ref<InstanceType<typeof PermissionseSettingsCreate>>()
let timer: NodeJS.Timeout | null = null
const importDialogVisible = ref(false)
const importForm = ref<ImportForm>({
  type: 'task',
  taskId: '',
  fileList: [],
})
const importLoading = ref(false)

// Reactive data
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const order = ref('last_updated DESC')
const multipleSelection = ref<InspectItem[]>([])

const searchParams = ref<SearchParams>({
  keyword: '',
  inspectMethod: '',
  mode: '',
  enabled: '',
  result: '',
})

const validList = [
  { label: t('public_select_option_all'), value: '' },
  {
    label: t('packages_business_verification_check_same'),
    value: 'passed',
  },
  {
    label: t('packages_business_verification_count_difference'),
    value: 'row_count',
  },
  {
    label: t('packages_business_verification_content_difference'),
    value: 'valueDiff',
  },
  { label: 'Error', value: 'error' },
]

const filterItems = ref<FilterItem[]>([])
const taskOptions = ref([])
const taskOptionsLoading = ref(false)

// Computed
const tableRef = computed(() => table.value)

// Methods
const inspectMethodChange = (val: string) => {
  if (val !== 'row_count' && searchParams.value.result === 'row_count') {
    searchParams.value.result = ''
  }
  table.value?.fetch(1)
}

const handleExport = () => {
  const ids = multipleSelection.value.map((item) => item.id)
  const where = {
    _id: {
      in: ids,
    },
  }
  metadataInstancesApi.download(where, 'Inspect')
}

const handleSelectionChange = (val: InspectItem[]) => {
  multipleSelection.value = val
}

const handleSortTable = ({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) => {
  order.value = `${sortOrder ? prop : 'last_updated'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}

const getData = ({ page }: { page: { current: number; size: number } }) => {
  const { current, size } = page
  let {
    keyword,
    inspectMethod: method,
    mode,
    enabled,
    result,
  } = searchParams.value
  const where: any = {}

  // 精准搜索 iModel
  if (keyword && keyword.trim()) {
    const filterObj = { like: escapeRegExp(keyword), options: 'i' }
    where.$or = [{ name: filterObj }, { dataFlowName: filterObj }]
  }
  if (enabled) {
    where.enabled = enabled == '1'
  }
  if (result) {
    if (result === 'error') {
      where.status = 'error'
    } else if (result === 'passed') {
      where.status = { neq: 'error' }
      where.result = 'passed'
    } else if (result === 'row_count') {
      where.status = { neq: 'error' }
      where.result = 'failed'
      method = searchParams.value.inspectMethod = 'row_count'
    } else {
      where.status = { neq: 'error' }
      where.result = 'failed'
      if (method === 'row_count') {
        method = searchParams.value.inspectMethod = ''
      }
      where.inspectMethod = { neq: 'row_count' }
    }
  }
  method && (where.inspectMethod = method)
  mode && (where.mode = mode)
  const filter = {
    order: order.value,
    limit: size,
    skip: (current - 1) * size,
    where,
  }
  return inspectApi
    .get({
      filter: JSON.stringify(filter),
    })
    .then((data: any) => {
      const list = data?.items || []
      return {
        total: data?.total,
        data: list.map((item: any) => {
          const result = item.InspectResult
          let sourceTotal: string | number = '-'
          let targetTotal: string | number = '-'
          if (result) {
            sourceTotal = result.source_total
            targetTotal = result.target_total
          }
          item.lastStartTime = item.lastStartTime
            ? dayjs(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss')
            : '-'
          item.sourceTotal = sourceTotal
          item.targetTotal = targetTotal
          if (item.inspectMethod === 'hash') {
            item.sourceTotal = '-'
            item.targetTotal = '-'
          }

          delete item.tasks

          if (item.status !== 'error') {
            delete item.errorMsg
          }

          return item
        }),
      }
    })
}

const toTableInfo = (id: string) => {
  router.push({
    name: 'dataVerifyDetails',
    params: {
      id,
    },
  })
}

const history = (id: string) => {
  router.push({
    name: 'dataVerifyHistory',
    params: {
      id,
    },
  })
}

const startTask = (id: string) => {
  inspectApi
    .update(
      {
        id,
      },
      {
        status: 'scheduling',
        ping_time: 0,
        scheduleTimes: 0,
        byFirstCheckId: '',
      },
    )
    .then(() => {
      ElMessage.success(t('packages_business_verification_startVerify'))
      table.value?.fetch()
    })
}

const remove = async (id: string, row: InspectItem) => {
  const name = row.name
  const confirmed = await Modal.confirm(
    t('packages_business_dataFlow_importantReminder'),
    `${t('packages_business_verification_deleteMessage')} ${name}?`,
    {
      confirmButtonText: t('public_button_delete'),
    },
  )

  if (confirmed) {
    await inspectApi.delete(id)
    ElMessage.success(t('public_message_delete_ok'))
    table.value?.fetch()
  }
}

const goEdit = (id: string, flowId?: string) => {
  const query: any = {
    taskMode: flowId ? 'pipeline' : 'random',
  }
  if (flowId) {
    query.flowId = flowId
  }
  router.push({
    name: 'dataVerificationEdit',
    params: {
      id,
    },
    query,
  })
}

const getFilterItems = () => {
  filterItems.value = [
    {
      label: t('packages_business_verification_type'),
      key: 'inspectMethod',
      type: 'select-inner',
      items: verifyTypeList,
      selectedWidth: '200px',
      id: 'type-filter-select',
    },
    {
      label: t('packages_business_verification_check_frequency'),
      key: 'mode',
      type: 'select-inner',
      items: [
        { label: t('public_select_option_all'), value: '' },
        {
          label: t('packages_business_verification_single'),
          value: 'MANUALLY_SPECIFIED_BY_THE_USER',
        },
        {
          label: t('packages_business_verification_repeating'),
          value: 'cron',
        },
      ],
      id: 'mode-filter-select',
    },
    {
      label: t('packages_business_verification_is_enabled'),
      key: 'enabled',
      type: 'select-inner',
      items: [
        { label: t('public_select_option_all'), value: '' },
        {
          label: t('packages_business_verification_job_enable'),
          value: 1,
        },
        {
          label: t('packages_business_verification_job_disable'),
          value: 2,
        },
      ],
      id: 'enabled-filter-select',
    },
    {
      label: t('packages_business_verification_result_title'),
      key: 'result',
      type: 'select-inner',
      items: validList,
      id: 'result-filter-select',
    },
    {
      placeholder: t('packages_business_verification_task_name'),
      key: 'keyword',
      type: 'input',
      id: 'name-filter-input',
    },
  ]
}

const handleError = (row: InspectItem = {} as InspectItem) => {
  ErrorMessage(row.errorMsg)
}

const getInspectName = (row: InspectItem = {} as InspectItem) => {
  // if (row.tasks?.some((t) => !!t.source.columns || !!t.target.columns)) {
  //   return t('packages_business_verification_list_biaobufenziduan')
  // }
  return inspectMethod[row.inspectMethod]
}

const stop = (id: string = '') => {
  inspectApi
    .update(
      {
        id,
      },
      { status: 'stopping' },
    )
    .then(() => {
      ElMessage.success(t('public_message_operation_success'))
      table.value?.fetch()
    })
}

const handleCreate = (type: string) => {
  router.push({
    name: 'dataVerificationCreate',
    query: { taskMode: type },
  })
}

const havePermission = (data: string[] = [], type: string = '') => {
  if (!isDaas) return true
  return data.includes(type)
}

const handlePermissionsSettings = () => {
  permissionseSettingsCreate.value?.open(multipleSelection.value, 'Inspect')
}

const handleImport = () => {
  importDialogVisible.value = true
}

const handleDelete = () => {
  importForm.value.fileList = []
}

const fetchTaskOptions = async () => {
  if (taskOptions.value.length) return

  taskOptionsLoading.value = true

  const data = await inspectApi.getTaskList()

  taskOptions.value = data || []
  taskOptionsLoading.value = false
}

const startImport = async () => {
  console.log('startImport')
  const formData = new FormData()
  formData.append('file', importForm.value.fileList[0].raw)
  formData.append('taskId', importForm.value.taskId)

  importLoading.value = true

  const res = await inspectApi.import(formData)

  importLoading.value = false

  ElMessage.success(t('public_message_operation_success'))

  importDialogVisible.value = false
  table.value?.fetch(1)
}

const onImportDialogClosed = () => {
  importForm.value.fileList = []
  importForm.value.taskId = ''
  importForm.value.type = 'task'
}

// Watchers
watch(
  () => route.query,
  () => {
    Object.assign(searchParams.value, route.query)
    table.value?.fetch(1)
  },
)

// Lifecycle
onMounted(() => {
  timer = setInterval(() => {
    table.value?.fetch(null, 0, true)
  }, 8000)
  getFilterItems()
  Object.assign(searchParams.value, route.query)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  table.value = null
  permissionseSettingsCreate.value = null
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton :icon="ImportOutlined" @click="handleImport">
        {{ $t('public_task_import') }}
      </ElButton>
      <ElButton
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        @click="handleCreate('pipeline')"
      >
        <span>{{
          $t('packages_business_verification_list_renwuyizhixing')
        }}</span>
      </ElButton>
      <ElButton
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        @click="handleCreate('random')"
      >
        <span>{{
          $t('packages_business_verification_list_renyibiaoshuju')
        }}</span>
      </ElButton>
    </template>

    <el-dialog
      v-model="importDialogVisible"
      :title="$t('public_task_import')"
      width="600px"
      @closed="onImportDialogClosed"
    >
      <el-upload
        v-show="!importForm.fileList.length"
        v-model:file-list="importForm.fileList"
        drag
        accept=".gz"
        :auto-upload="false"
        :show-file-list="false"
      >
        <el-icon size="40"><FileAddColorful /></el-icon>
        <div
          class="el-upload__text mt-6"
          v-html="$t('packages_business_drag_file_here')"
        />
      </el-upload>

      <div
        v-if="importForm.fileList.length"
        class="flex align-center gap-3 border rounded-xl p-3 lh-base hover:border-primary"
      >
        <el-icon size="32"><FileDocxColorful /></el-icon>
        <div>
          <div class="font-bold">
            {{ importForm.fileList[0].name }}
          </div>
          <div
            class="fs-8"
            :style="{ color: 'var(--el-text-color-placeholder)' }"
          >
            {{ calcUnit(importForm.fileList[0].size, 1) }}
          </div>
        </div>

        <el-button class="ml-auto flex-shrink-0" text @click="handleDelete">
          <template #icon>
            <el-icon><i-lucide-trash-2 /></el-icon>
          </template>
        </el-button>
      </div>

      <div class="p-4 bg-light rounded-xl mt-4">
        <el-form :model="importForm" label-position="top">
          <el-form-item :label="$t('packages_business_validation_task_type')">
            <el-radio-group
              v-model="importForm.type"
              @change="importForm.taskId = ''"
            >
              <el-radio value="task">{{
                $t('packages_business_verification_list_renwuyizhixing')
              }}</el-radio>
              <el-radio value="table">{{
                $t('packages_business_verification_list_renyibiaoshuju')
              }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="importForm.type === 'task'"
            :label="$t('packages_business_select_task_to_be_verified')"
          >
            <el-select-v2
              v-model="importForm.taskId"
              filterable
              :loading="taskOptionsLoading"
              :options="taskOptions"
              :props="{ label: 'name', value: 'id' }"
              @visible-change="fetchTaskOptions"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button
          :disabled="!importForm.fileList.length"
          type="primary"
          :loading="importLoading"
          @click="startImport"
          >{{ $t('public_start_import') }}</el-button
        >
      </template>
    </el-dialog>

    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table?.fetch(1)"
          />
        </div>
      </template>

      <template #multipleSelectionActions>
        <ElButton @click="handlePermissionsSettings">{{
          $t('packages_business_permissionse_settings_create_quanxianshezhi')
        }}</ElButton>
        <ElButton
          v-readonlybtn="'SYNC_category_application'"
          @click="handleExport"
        >
          <el-icon><ExportOutlined /></el-icon>
          <span> {{ $t('public_button_export') }}</span>
        </ElButton>
      </template>

      <el-table-column
        reserve-selection
        type="selection"
        width="32"
        align="center"
      />
      <el-table-column
        :label="$t('packages_business_verification_task_name')"
        min-width="250"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="ellipsis">{{ scope.row.name }}</div>
          <div>
            <el-tag type="info" size="small" disable-transitions
              >{{ getInspectName(scope.row) }} (
              {{
                scope.row.mode === 'manual'
                  ? $t('packages_business_verification_singleVerify')
                  : $t('packages_business_verification_repeatingVerify')
              }}
              )
            </el-tag>
            <span v-if="!scope.row.enabled" class="font-color-slight"
              >&nbsp;Disabled</span
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="sourceTotal"
        min-width="140"
        align="center"
        :label="$t('packages_business_verification_history_source_total_rows')"
      >
        <template #default="scope">
          {{
            scope.row.inspectMethod === 'hash'
              ? '-'
              : scope.row.sourceTotal || 0
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('packages_business_verification_result_title')"
        min-width="180"
      >
        <template #default="scope">
          <div class="flex align-center">
            <template
              v-if="
                scope.row.InspectResult &&
                ['waiting', 'done'].includes(scope.row.status)
              "
            >
              <div
                v-if="scope.row.result !== 'passed'"
                class="data-verify__status error flex align-center gap-1"
              >
                <el-icon class="color-danger"><CircleCloseFilled /></el-icon>
                <span
                  v-if="
                    scope.row.inspectMethod === 'row_count' ||
                    scope.row.inspectMethod === 'hash'
                  "
                >
                  {{ $t('packages_business_verification_inconsistent') }}
                </span>
                <span v-if="scope.row.inspectMethod === 'field'">
                  {{ $t('packages_business_verification_contConsistent') }}
                  {{ scope.row.difference_number }}
                </span>
                <span v-if="scope.row.inspectMethod === 'jointField'">
                  {{ $t('packages_business_verification_contConsistent') }}
                  {{ scope.row.difference_number }}
                </span>
                <span v-if="scope.row.inspectMethod === 'cdcCount'">
                  {{ $t('packages_business_verification_contConsistent') }}
                  {{ scope.row.difference_number }}
                </span>
              </div>
              <div
                v-else
                class="data-verify__status success flex align-center gap-1"
              >
                <el-icon class="color-success"><CircleCheckFilled /></el-icon>
                <span>{{
                  $t('packages_business_verification_consistent')
                }}</span>
              </div>
            </template>
            <div
              v-else-if="scope.row.status === 'error'"
              class="data-verify__status flex align-center gap-1"
            >
              <el-icon class="color-danger"><CircleCloseFilled /></el-icon>
              <span>{{ $t('public_status_error') }}</span>
              <ElButton
                v-if="scope.row.errorMsg"
                text
                type="primary"
                @click="handleError(scope.row)"
                >{{ $t('public_button_check') }}
              </ElButton>
            </div>
            <div
              v-else-if="scope.row.status === 'waiting'"
              class="data-verify__status"
            >
              -
            </div>
            <div
              v-else-if="scope.row.status !== 'done'"
              class="data-verify__status"
            >
              <img
                style="width: 26px; vertical-align: middle"
                :src="loadingImg"
              />
              <span>{{ statusMap[scope.row.status] }}</span>
            </div>
            <div v-else>-</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('packages_business_verification_verifyStatus')"
        min-width="110"
        prop="status"
      >
        <template #default="scope">
          <span>{{ statusMap[scope.row.status] }}</span>
          <span
            v-if="scope.row.InspectResult && scope.row.status === 'running'"
          >
            {{
              `(${scope.row.InspectResult.progress ? Math.floor(scope.row.InspectResult.progress * 100) : 0}%)`
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('packages_business_verification_verifyTime')"
        prop="lastStartTime"
        sortable="lastStartTime"
        min-width="170"
      />
      <el-table-column
        :label="$t('public_operation')"
        width="300"
        fixed="right"
      >
        <template v-if="isDaas" #header>
          <div class="flex align-center">
            <span>{{ $t('public_operation_available') }}</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              :content="
                $t('packages_business_connections_list_wuquanxiandecao')
              "
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>

        <template #default="{ row }">
          <ElButton
            text
            type="primary"
            :disabled="!row.InspectResult"
            @click="toTableInfo(row.id)"
            >{{ $t('packages_business_verification_result_title') }}
          </ElButton>

          <template
            v-if="
              havePermission(row.permissionActions, 'Stop') &&
              row.status === 'running'
            "
          >
            <ElDivider
              v-readonlybtn="'verify_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'verify_job_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'verify_job_edition_all_data',
                  row.user_id,
                )
              "
              @click="stop(row.id)"
              >{{ $t('public_button_stop') }}
            </ElButton>
          </template>

          <template
            v-if="
              havePermission(row.permissionActions, 'Start') &&
              row.status !== 'running'
            "
          >
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton
              v-readonlybtn="'verify_job_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'verify_job_edition_all_data',
                  row.user_id,
                ) || ['running', 'scheduling', 'stopping'].includes(row.status)
              "
              @click="startTask(row.id)"
              >{{ $t('packages_business_verification_executeVerifyTip') }}
            </ElButton>
          </template>

          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-readonlybtn="'verify_job_edition'"
            text
            type="primary"
            :disabled="!row.InspectResult"
            @click="history(row.id)"
            >{{ $t('packages_business_verification_historyTip') }}
          </ElButton>

          <template v-if="havePermission(row.permissionActions, 'Edit')">
            <ElDivider
              v-readonlybtn="'verify_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'verify_job_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'verify_job_edition_all_data',
                  row.user_id,
                ) || ['running', 'scheduling'].includes(row.status)
              "
              @click="goEdit(row.id, row.flowId)"
              >{{ $t('packages_business_verification_configurationTip') }}
            </ElButton>
          </template>

          <template v-if="havePermission(row.permissionActions, 'Delete')">
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton
              v-readonlybtn="'verify_job_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission('verify_job_delete_all_data', row.user_id)
              "
              @click="remove(row.id, row)"
              >{{ $t('public_button_delete') }}
            </ElButton>
          </template>
        </template>
      </el-table-column>
    </TablePage>
    <PermissionseSettingsCreate ref="permissionseSettingsCreate" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.data-verify-wrap {
  height: 100%;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }

  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
  }

  .btn + .btn {
    margin-left: 10px;
  }

  .btn {
    &.btn-dropdowm {
      margin-left: 5px;
    }
  }

  .data-verify__status {
    display: flex;
    align-items: center;
  }

  .data-verify__icon {
    margin-left: -5px;
    width: 26px;
    text-align: center;
    font-size: 14px;
  }
}
:deep(.verify-list-error-msg) {
  .el-message-box__message {
    max-height: 450px;
    overflow-y: auto;
    word-break: break-word;
  }
}
</style>

<style lang="scss">
.data-verify-wrap {
  .el-table--border td {
    border-right: 0;
  }

  // .el-table--border th {
  //   border-right: 1px solid #dcdfe6;
  // }
}
</style>
