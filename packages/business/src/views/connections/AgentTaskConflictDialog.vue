<script setup lang="ts">
import {
  checkConnectionAgentSettings,
  updateConflictTaskAgents,
  type BatchUpdateConnectionAgentSettingsParams,
  type ConnectionAgentConflictReport,
} from '@tap/api/src/core/connections'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import BatchAgentSettingsDialog from './BatchAgentSettingsDialog.vue'
import { useRouter } from 'vue-router'
import {
  taskAgentEdits,
  conflictTaskDestination,
  automaticConflictTasks,
} from './connectionAgentConflicts'
import { STATUS_MAP } from '../../shared'

const { t } = useI18n()
const router = useRouter()
const visible = ref(false)
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const report = ref<ConnectionAgentConflictReport>({
  total: 0,
  hiddenCount: 0,
  hasConflicts: false,
  items: [],
})
let payload: BatchUpdateConnectionAgentSettingsParams | null = null
let generation = 0
const selectedTasks = ref<ConnectionAgentConflictReport['items']>([])
const taskSettingsDialog = ref<InstanceType<
  typeof BatchAgentSettingsDialog
> | null>(null)
const taskSaving = ref(false)
const savedCount = ref(0)
const taskNames = new Map<string, string>()
const failures = ref<Array<{ id: string; code: string }>>([])
let finish: ((value: boolean) => void) | null = null

function settle(value: boolean) {
  finish?.(value)
  finish = null
}

function editTasks() {
  taskSettingsDialog.value?.open(selectedTasks.value)
}

const automaticRows = computed(() =>
  automaticConflictTasks(
    selectedTasks.value.length ? selectedTasks.value : report.value.items,
  ),
)

async function saveAutomatically() {
  if (
    !payload ||
    !automaticRows.value.length ||
    taskSaving.value ||
    loading.value
  )
    return
  const rows = report.value.items.filter((row) =>
    automaticRows.value.some((item) => item.id === row.id),
  )
  try {
    await ElMessageBox.confirm(
      t('packages_business_agent_auto_confirm', {
        count: rows.length,
        names: rows.map((row) => row.name).join(', '),
      }),
      t('packages_business_agent_auto_title'),
      { type: 'warning' },
    )
  } catch {
    return
  }
  await saveTasks(
    {
      ...payload,
      settings: {
        accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
        accessNodeProcessId: null,
        priorityProcessId: null,
      },
    },
    rows,
  )
}

async function saveTasks(
  settings: BatchUpdateConnectionAgentSettingsParams,
  rows = selectedTasks.value,
) {
  if (!payload || taskSaving.value) return
  const tasks = [...rows]
  taskSaving.value = true
  tasks.forEach(({ id, name }) => taskNames.set(id, name))
  try {
    const result = await updateConflictTaskAgents({
      ...payload,
      taskEdits: taskAgentEdits(tasks),
      taskSettings: settings.settings,
    })
    savedCount.value += result.updatedTaskIds.length
    failures.value = result.failures
    taskSettingsDialog.value?.close()
    selectedTasks.value = []
    await changePage(1)
  } catch {
    failures.value = tasks.map(({ id }) => ({
      id,
      code: 'Task.AgentUpdateResultUnknown',
    }))
    await changePage(1)
  } finally {
    taskSaving.value = false
  }
}

function failureLabel(failure: { id: string; code: string }) {
  const reason =
    failure.code === 'Task.AgentConflict'
      ? t('packages_business_agent_conflict_reason_task')
      : failure.code === 'Task.SourceAgentConflict'
        ? t('packages_business_agent_conflict_reason_connections')
        : t('packages_business_agent_tasks_retry')
  return `${taskNames.get(failure.id) || failure.id}: ${reason}`
}

function onClosed() {
  generation += 1
  settle(false)
}

function continueSave() {
  settle(true)
  visible.value = false
}

function open(
  settings: BatchUpdateConnectionAgentSettingsParams,
  data: ConnectionAgentConflictReport,
) {
  settle(false)
  generation += 1
  payload = settings
  report.value = data
  page.value = 1
  loading.value = false
  savedCount.value = 0
  failures.value = []
  selectedTasks.value = []
  visible.value = true
  return new Promise<boolean>((resolve) => {
    finish = resolve
  })
}

async function changePage(nextPage: number) {
  if (!payload || loading.value) return
  const current = generation
  loading.value = true
  try {
    const data = await checkConnectionAgentSettings({
      ...payload,
      skip: (nextPage - 1) * pageSize,
      limit: pageSize,
    })
    if (current !== generation) return
    report.value = data
    page.value = nextPage
  } catch {
    // The request client displays the error; keep the current page available for retry.
  } finally {
    if (current === generation) loading.value = false
  }
}

function statusLabel(status: string) {
  const entry = STATUS_MAP[status as keyof typeof STATUS_MAP]
  return entry ? t(entry.i18n) : status
}

function category(item: ConnectionAgentConflictReport['items'][number]) {
  if (item.blockedReason === 'no_edit_permission') return 'no_edit_permission'
  if (item.code === 'Task.SourceAgentConflict') return 'connection_conflict'
  if (item.blockedReason) return item.blockedReason
  return item.autoResolvable ? 'auto' : 'policy_conflict'
}

function editOneTask(item: ConnectionAgentConflictReport['items'][number]) {
  selectedTasks.value = [item]
  editTasks()
}

function openTask(item: ConnectionAgentConflictReport['items'][number]) {
  const destination = conflictTaskDestination(item)
  if (!destination && item.editable) {
    editOneTask(item)
    return
  }
  if (!destination || !router.hasRoute(destination.name)) return
  window.open(router.resolve(destination).href, '_blank', 'noopener')
}

function hasTaskEntry(item: ConnectionAgentConflictReport['items'][number]) {
  const destination = conflictTaskDestination(item)
  return destination ? router.hasRoute(destination.name) : item.editable
}

defineExpose({ open })
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="t('packages_business_agent_conflict_title')"
    width="900px"
    append-to-body
    :close-on-click-modal="!taskSaving"
    :close-on-press-escape="!taskSaving"
    :show-close="!taskSaving"
    @closed="onClosed"
  >
    <ElAlert
      :type="report.hasConflicts ? 'warning' : 'success'"
      :closable="false"
      :title="
        report.hasConflicts
          ? t('packages_business_agent_conflict_summary', {
              count: report.total + report.hiddenCount,
            })
          : t('packages_business_agent_recheck_clear')
      "
    />
    <ElAlert
      v-if="report.hiddenCount"
      class="mt-3"
      type="warning"
      :closable="false"
      :title="
        t('packages_business_agent_conflict_hidden', {
          count: report.hiddenCount,
        })
      "
    />
    <ElAlert
      v-if="savedCount"
      class="mt-3"
      type="warning"
      :closable="false"
      :title="t('packages_business_agent_tasks_saved', { count: savedCount })"
    />
    <ElAlert
      v-for="failure in failures"
      :key="failure.id"
      class="mt-2"
      type="error"
      :closable="false"
      :title="failureLabel(failure)"
    />
    <ElAlert
      class="mt-3"
      type="info"
      :closable="false"
      :title="t('packages_business_agent_tasks_hint')"
    />
    <ElButton
      class="mt-3"
      :disabled="loading || taskSaving"
      @click="changePage(1)"
      >{{ t('packages_business_agent_recheck') }}</ElButton
    >
    <ElButton
      class="mt-3"
      type="primary"
      :disabled="!automaticRows.length || loading || taskSaving"
      @click="saveAutomatically"
      >{{
        t('packages_business_agent_auto_save', { count: automaticRows.length })
      }}</ElButton
    >
    <div class="mt-3 text-muted">
      {{ t('packages_business_agent_actions_hint') }}
    </div>
    <ElButton
      class="mt-3"
      :disabled="!selectedTasks.length || taskSaving || loading"
      @click="editTasks"
    >
      {{ t('packages_business_agent_tasks_edit') }}
    </ElButton>
    <ElTable
      v-loading="loading"
      class="mt-4"
      :data="report.items"
      max-height="420"
      row-key="id"
      @selection-change="selectedTasks = $event"
    >
      <ElTableColumn
        type="selection"
        width="48"
        :selectable="
          (row) =>
            row.editable &&
            row.code !== 'Task.SourceAgentConflict' &&
            !taskSaving
        "
      />
      <ElTableColumn
        :label="t('public_task_name')"
        min-width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <ElLink
            v-if="hasTaskEntry(row)"
            type="primary"
            @click="openTask(row)"
            >{{ row.name }}</ElLink
          >
          <span v-else>{{ row.name }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_action')"
        min-width="210"
      >
        <template #default="{ row }"
          >{{ t(`packages_business_agent_action_${category(row)}`)
          }}<ElLink
            v-if="row.editable && row.code !== 'Task.SourceAgentConflict'"
            class="ml-2"
            type="primary"
            :disabled="taskSaving || loading"
            @click="editOneTask(row)"
            >{{ t('packages_business_agent_edit_one') }}</ElLink
          ></template
        >
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_type')"
        width="110"
      >
        <template #default="{ row }">{{
          t(`packages_business_agent_conflict_type_${row.syncType}`)
        }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_status')"
        width="100"
      >
        <template #default="{ row }">{{ statusLabel(row.status) }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_connections')"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{
          row.connections
            .map((connection) => connection.name || connection.id)
            .join(', ')
        }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_reason')"
        min-width="230"
      >
        <template #default="{ row }">{{
          t(
            row.code === 'Task.SourceAgentConflict'
              ? 'packages_business_agent_conflict_reason_connections'
              : 'packages_business_agent_conflict_reason_task',
          )
        }}</template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      v-if="report.total > pageSize"
      class="mt-4"
      :disabled="loading"
      :current-page="page"
      :page-size="pageSize"
      :total="report.total"
      layout="total, prev, pager, next"
      @current-change="changePage"
    />
    <template #footer>
      <ElButton
        type="primary"
        :disabled="report.hasConflicts || loading || taskSaving"
        @click="continueSave"
      >
        {{ t('packages_business_agent_tasks_continue') }}
      </ElButton>
      <ElButton :disabled="taskSaving" @click="visible = false">{{
        t('public_button_cancel')
      }}</ElButton>
    </template>
    <BatchAgentSettingsDialog
      ref="taskSettingsDialog"
      :title="t('packages_business_agent_tasks_edit')"
      subtitle-key="packages_business_agent_tasks_selected"
      :loading="taskSaving"
      @submit="saveTasks"
    />
  </ElDialog>
</template>
