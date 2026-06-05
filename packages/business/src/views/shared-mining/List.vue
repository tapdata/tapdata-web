<script setup lang="ts">
import { fetchClusterStates } from '@tap/api/src/core/cluster'
import {
  checkLogcollector,
  fetchLogcollector,
  getSystemConfig,
  patchSystemConfig,
} from '@tap/api/src/core/logcollector'
import {
  batchDeleteTasks,
  batchRenewTasks,
  batchStartTasks,
  batchStopTasks,
  fetchTasks,
  forceStopTask,
  taskConsoleRelations,
} from '@tap/api/src/core/task'
import { requestClient } from '@tap/api/src/request'
import { VTable } from '@tap/component/src/base/v-table'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit, openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp, uniqBy } from 'lodash-es'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import { makeStatusAndDisabled } from '../../shared'
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
const digSettingFormRef = ref<any>()

const searchParams = ref({
  taskName: '',
  connectionName: '',
  status: '',
  agentId: '',
})

const order = ref('createTime DESC')
let timer: ReturnType<typeof setInterval> | null = null
const taskBuried = { start: 'sharedMiningStart' }

const settingDialogVisible = ref(false)
const loadingConfig = ref(false)
const showEditSettingBtn = ref(false)
const digSettingForm = ref({
  persistenceMode: 'Mem',
  persistenceMongodb_uri_db: '',
  persistenceMongodb_collection: '',
  persistenceRocksdb_path: '',
  share_cdc_ttl_day: 3,
})
const enumsItems = ['Mem', 'MongoDB', 'RocksDB']
const logSaveList = [1, 2, 3, 4, 5, 6, 7]
const showUsingTaskDialog = ref({ visible: false, list: [] as any[] })

const rules = {
  persistenceMongodb_uri_db: [
    {
      required: true,
      message: t('packages_business_shared_cdc_setting_select_mongodb_tip'),
      trigger: 'blur',
    },
  ],
  persistenceMongodb_collection: [
    {
      required: true,
      message: t('packages_business_shared_cdc_setting_select_table_tip'),
      trigger: 'blur',
    },
  ],
}

const taskColumns = [
  { label: t('public_task_name'), prop: 'name', slotName: 'name' },
]

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
    placeholder: t('packages_business_shared_cdc_placeholder_task_name'),
    key: 'taskName',
    type: 'input',
    width: '220px',
  },
  {
    placeholder: t('packages_business_shared_cdc_placeholder_connection_name'),
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
  const { taskName, connectionName, status, agentId } = searchParams.value
  const where: Record<string, any> = {}

  if (taskName) {
    where.name = { like: escapeRegExp(taskName), options: 'i' }
  }
  if (connectionName) {
    where.connectionName = connectionName
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
  const data = await fetchLogcollector(filter)
  const list: any[] = data?.items || []
  const pointTime = new Date()
  return {
    total: data?.total || 0,
    data: list.map((item) => {
      if (item.syncTimePoint === 'current') {
        item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
      } else {
        item.pointTime = item.syncTimeZone
      }
      item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
      item.logTime = item.logTime
        ? dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss')
        : '-'
      item.delayTime =
        item.delayTime < 0 || typeof item.delayTime !== 'number'
          ? '-'
          : calcTimeUnit(item.delayTime, 2, { autoHideMs: true })
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

const handleSetting = () => {
  loadingConfig.value = true
  checkLogcollector()
    .then((data: any) => {
      showEditSettingBtn.value = data?.data
      settingDialogVisible.value = true
      getSystemConfig({})
        .then((data: any) => {
          if (data) digSettingForm.value = data
        })
        .finally(() => {
          loadingConfig.value = false
        })
    })
    .catch(() => {
      loadingConfig.value = false
    })
}

const saveSetting = () => {
  digSettingFormRef.value?.validate((valid: boolean) => {
    if (!valid) return
    const form = digSettingForm.value
    if (form.persistenceMode === 'Mem') {
      form.persistenceMongodb_uri_db = ''
      form.persistenceMongodb_collection = ''
      form.persistenceRocksdb_path = ''
    } else if (form.persistenceMode === 'MongoDB') {
      form.persistenceRocksdb_path = ''
    } else if (form.persistenceMode === 'RocksDB') {
      form.persistenceMongodb_uri_db = ''
      form.persistenceMongodb_collection = ''
    }
    patchSystemConfig(form).then(() => {
      settingDialogVisible.value = false
      ElMessage.success(t('public_message_save_ok'))
    })
  })
}

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

const handleEditor = (task: any = {}) => {
  editor.value?.open(task.id)
}

const handleDetails = (task: any = {}) => {
  openRoute({ name: 'SharedMiningMonitor', params: { id: task.id } })
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

const handleDelete = async (row: any) => {
  showUsingTaskDialog.value.list = await taskConsoleRelations({
    type: 'task_by_collector',
    taskId: row.id,
  })
  try {
    await ElMessageBox.confirm(
      t('packages_business_shared_mining_list_shanchurenwus', {
        val1: row.name,
      }),
      t('packages_ldp_src_tablepreview_querenshanchu'),
      { dangerouslyUseHTMLString: true },
    )
    if (showUsingTaskDialog.value.list.length) {
      showUsingTaskDialog.value.visible = true
      return
    }
    const data: any = await batchDeleteTasks([row.id])
    ElMessage.success(data?.message || t('public_message_operation_success'))
    table.value?.fetch()
  } catch {
    // dismissed
  }
}

const handleName = ({
  syncType,
  name,
  type,
}: {
  syncType: string
  name: string
  type: string
}) => {
  const MAP: Record<string, string> = {
    migrate: 'migrateList',
    sync: 'dataflowList',
    logCollector: 'sharedMiningList',
    mem_cache: 'sharedCacheList',
    connHeartbeat: 'HeartbeatTableList',
  }
  const routeUrl = router.resolve({
    name: MAP[type] || MAP[syncType],
    query: { keyword: name },
  })
  openUrl(routeUrl.href)
}

// ── Lifecycle & Watchers ──────────────────────────────────────────────────────

watch(
  () => route.query,
  () => {
    searchParams.value = {
      ...searchParams.value,
      taskName: (route.query?.keyword as string) || '',
    }
    table.value?.fetch(1)
  },
)

onMounted(() => {
  timer = setInterval(() => {
    table.value?.fetch(null, 0, true)
  }, 8000)
  Object.assign(searchParams.value, { taskName: route.query?.keyword || '' })
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
      <!--外存配置已上，这里关闭，稳定后相关注释代码可去掉-->
      <!--      <div slot="operation">-->
      <!--        <el-button class="btn btn-create" type="primary"  :loading="loadingConfig" @click="handleSetting">-->
      <!--        </el-button>-->
      <!--      </div>-->
      <el-table-column
        min-width="250"
        :label="$t('packages_business_shared_list_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('packages_business_shared_list_time_excavation')"
      >
        <template #header>
          <div class="inline-flex align-center">
            <span>{{
              $t('packages_business_shared_list_time_excavation')
            }}</span>
            <ElTooltip
              class="ml-1"
              placement="top"
              :content="$t('public_database_time')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>

        <template #default="scope">
          {{ scope.row.logTime }}
        </template> </el-table-column
      >l
      <el-table-column
        sortable
        min-width="160"
        :label="$t('packages_business_shared_list_time')"
        prop="delayTime"
      >
        <template #header>
          <div class="inline-flex align-center">
            <span>{{ $t('packages_business_shared_list_time') }}</span>
            <ElTooltip
              class="ml-1"
              placement="top"
              :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        min-width="260"
        :label="$t('public_create_time')"
        sortable
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
        width="280"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
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
              @click="handleDelete(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      v-model="settingDialogVisible"
      width="500px"
      class="setting-dialog"
      :title="$t('packages_business_shared_list_setting')"
      :close-on-click-modal="false"
    >
      <el-form
        ref="digSettingFormRef"
        label-position="left"
        label-width="180px"
        :model="digSettingForm"
        :disabled="!showEditSettingBtn"
        :rules="rules"
      >
        <el-form-item
          prop="persistenceMode"
          :label="$t('packages_business_shared_cdc_setting_select_mode')"
        >
          <el-select v-model="digSettingForm.persistenceMode">
            <el-option
              v-for="item in enumsItems"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_uri_db"
          label="MongoDB URI"
        >
          <el-input
            v-model="digSettingForm.persistenceMongodb_uri_db"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_form_setting_table_name')"
        >
          <el-input v-model="digSettingForm.persistenceMongodb_collection" />
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'RocksDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_cdc_persistence_rocksdb_path')"
        >
          <el-input
            v-model="digSettingForm.persistenceRocksdb_path"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          v-if="['MongoDB', 'RocksDB'].includes(digSettingForm.persistenceMode)"
          :label="$t('packages_business_shared_form_setting_log_time')"
        >
          <el-select
            v-model="digSettingForm.share_cdc_ttl_day"
            allow-create
            filterable
            :placeholder="
              $t('packages_business_shared_cdc_setting_select_time_tip')
            "
          >
            <el-option
              v-for="op in logSaveList"
              :key="op"
              :label="op + $t('public_time_d')"
              :value="op"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingDialogVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button
            type="primary"
            :disabled="!showEditSettingBtn"
            @click="saveSetting()"
            >{{ $t('public_button_confirm') }}</el-button
          >
        </span>
      </template>
    </el-dialog>

    <Editor ref="editor" @success="table?.fetch(1)" />

    <!-- 挖掘关联的任务 -->
    <ElDialog
      v-model="showUsingTaskDialog.visible"
      :title="$t('public_message_title_prompt')"
      :close-on-click-modal="false"
      class="create-role"
      width="600px"
    >
      <div>
        {{
          $t('packages_business_shared_mining_list_gaiwajuerenwu', {
            val: showUsingTaskDialog.list.length,
          })
        }}
      </div>
      <VTable
        :columns="taskColumns"
        :data="showUsingTaskDialog.list"
        :has-pagination="false"
      >
        <template #name="{ row }">
          <ElLink type="primary" @click="handleName(row)">{{
            row.name
          }}</ElLink>
        </template>
      </VTable>
      <template #footer>
        <div class="dialog-footer">
          <ElButton
            @click="
              ;((showUsingTaskDialog.list = []),
                (showUsingTaskDialog.visible = false))
            "
            >{{ $t('public_button_cancel') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.share-list-wrap {
  height: 100%;
  .refresh {
    color: var(--color-primary);
    font-weight: normal;
    font-size: 12px;
    cursor: pointer;
  }
  .share-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 5px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
    .metadata-name {
      .name {
        color: var(--color-primary);
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .name:hover {
        text-decoration: underline;
      }
      .tag {
        margin-left: 5px;
        color: var(--text-slight);
        background: var(--bg-main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: var(--text-slight);
      }
    }
  }
  :deep(.el-dialog__body) {
    padding: 10px 20px;
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-size: 12px;
        }
        .el-select,
        .el-date-editor {
          width: 100%;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.hide-current__dateTime {
  .el-picker-panel__footer {
    .el-button--text {
      display: none;
    }
  }
}
</style>
