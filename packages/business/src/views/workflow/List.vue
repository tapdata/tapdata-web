<script setup lang="ts">
import {
  deleteWorkflow,
  disableWorkflow,
  enableWorkflow,
  fetchWorkflows,
  getWorkflowErrorPayload,
  type WorkflowDefinitionDto,
  type WorkflowRunStatus,
  type WorkflowTriggerType,
} from '@tap/api/src/core/workflows'
import { withPassive } from '@tap/api/src/request'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp } from 'lodash-es'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import ContextTaskDialog from './components/ContextTaskDialog.vue'
import {
  RUN_STATUSES,
  runStatusLabelKey,
  runStatusTagType,
  TRIGGER_TYPES,
  triggerLabelKey,
} from './constants'
import {
  canDeleteDefinition,
  canEditDefinition,
  canRunDefinition,
  canTestDefinition,
  formatDateTime,
  formatDuration,
} from './helpers'
import { useWorkflowActions } from './useWorkflowActions'

const { t } = useI18n()
const router = useRouter()
const table = ref<any>()
const {
  contextVisible,
  contextOptions,
  askContextThen,
  cancelContext,
  runOrTest,
} = useWorkflowActions()

const searchParams = ref({
  name: '',
  enabled: '',
  triggerSummary: '',
  lastRunStatus: '',
})

const filterItems = computed(() => [
  {
    label: t('packages_business_workflow_enabled'),
    key: 'enabled',
    type: 'select-inner',
    items: [
      { label: t('public_button_enable'), value: 'true' },
      { label: t('public_button_disable'), value: 'false' },
    ],
  },
  {
    label: t('packages_business_workflow_trigger_type'),
    key: 'triggerSummary',
    type: 'select-inner',
    items: TRIGGER_TYPES.map((type) => ({
      label: t(triggerLabelKey(type)),
      value: type,
    })),
  },
  {
    label: t('packages_business_workflow_last_result'),
    key: 'lastRunStatus',
    type: 'select-inner',
    items: RUN_STATUSES.map((status) => ({
      label: t(runStatusLabelKey(status)),
      value: status,
    })),
  },
  {
    placeholder: t('public_name'),
    key: 'name',
    type: 'input',
  },
])

const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const { name, enabled, triggerSummary, lastRunStatus } = searchParams.value
  const where: Record<string, any> = {}
  if (name) where.name = { like: escapeRegExp(name), options: 'i' }
  if (enabled === 'true') where.enabled = true
  if (enabled === 'false') where.enabled = false
  if (triggerSummary) where.triggerSummary = triggerSummary
  if (lastRunStatus) where.lastRunStatus = lastRunStatus as WorkflowRunStatus

  const data = await fetchWorkflows({
    where,
    limit: size,
    skip: (current - 1) * size,
    sort: ['last_updated DESC'],
  })
  return { total: data?.total || 0, data: data?.items || [] }
}

function goCreate() {
  router.push({ name: 'workflowCreate' })
}

function goEdit(row: WorkflowDefinitionDto) {
  router.push({ name: 'workflowEdit', params: { id: row.id } })
}

function goRuns(row?: WorkflowDefinitionDto) {
  if (row?.id) {
    router.push({ name: 'workflowRuns', params: { id: row.id } })
  } else {
    router.push({ name: 'workflowRunList' })
  }
}

function goActiveRun(row: WorkflowDefinitionDto) {
  if (!row.activeRunId) return
  router.push({ name: 'workflowRunDetail', params: { runId: row.activeRunId } })
}

async function toggleEnabled(row: WorkflowDefinitionDto) {
  if (row.enabled) {
    await disableWorkflow(row.id)
    ElMessage.success(t('public_message_operation_success'))
  } else {
    await enableWorkflow(row.id)
    ElMessage.success(t('packages_business_workflow_enabled_ok'))
  }
  table.value?.fetch()
}

async function handleRun(row: WorkflowDefinitionDto, mode: 'run' | 'test') {
  const decision = await runOrTest(row, mode)
  if (decision?.decision === 'ACCEPTED' && decision.runId) {
    router.push({
      name: 'workflowRunDetail',
      params: { runId: decision.runId },
    })
  } else if (decision?.decision === 'SUPPRESSED' && decision.activeRunId) {
    ElMessage.warning(t('packages_business_workflow_suppressed'))
    router.push({
      name: 'workflowRunDetail',
      params: { runId: decision.activeRunId },
    })
  }
  table.value?.fetch()
}

async function handleDelete(row: WorkflowDefinitionDto) {
  try {
    await ElMessageBox.confirm(
      t('public_message_delete_confirm_with_name', { val: row.name }),
    )
    await deleteWorkflow(row.id)
    ElMessage.success(t('public_message_delete_ok'))
    table.value?.fetch()
  } catch (error) {
    if (getWorkflowErrorPayload(error).code) return
  }
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    withPassive(() => table.value?.fetch(null, 0, true))
  }, 8000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton @click="goRuns()">
        {{ t('packages_business_workflow_all_runs') }}
      </ElButton>
      <ElButton type="primary" @click="goCreate">
        {{ t('public_button_create') }}
      </ElButton>
    </template>
    <TablePage ref="table" row-key="id" :remote-method="getData">
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table?.fetch(1)"
        />
      </template>
      <ElTableColumn
        prop="name"
        :label="t('public_name')"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <ElLink type="primary" @click="goEdit(row)">{{ row.name }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_enabled')"
        width="90"
      >
        <template #default="{ row }">
          <ElTag :type="row.enabled ? 'success' : 'info'" size="small">
            {{
              row.enabled
                ? t('public_button_enable')
                : t('public_button_disable')
            }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_trigger_type')"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.triggerSummary
              ? t(triggerLabelKey(row.triggerSummary as WorkflowTriggerType))
              : '-'
          }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_last_result')"
        width="150"
      >
        <template #default="{ row }">
          <ElTag
            v-if="row.lastRunStatus"
            :type="runStatusTagType(row.lastRunStatus)"
            size="small"
          >
            {{ t(runStatusLabelKey(row.lastRunStatus)) }}
          </ElTag>
          <span v-else>-</span>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_last_run_time')"
        width="170"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.lastRunStartedAt) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_duration')"
        width="100"
      >
        <template #default="{ row }">
          {{ formatDuration(row.lastRunDurationMs) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_next_fire')"
        width="170"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.nextFireAt) }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('public_version')" width="80">
        <template #default="{ row }">v{{ row.currentVersion }}</template>
      </ElTableColumn>
      <ElTableColumn :label="t('public_operation')" width="360" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton text type="primary" @click="toggleEnabled(row)">
              {{
                row.enabled
                  ? t('public_button_disable')
                  : t('public_button_enable')
              }}
            </ElButton>
            <ElButton
              v-if="row.enabled"
              text
              type="primary"
              :disabled="!canRunDefinition(row)"
              @click="handleRun(row, 'run')"
            >
              {{ t('packages_business_workflow_run') }}
            </ElButton>
            <ElButton
              v-else
              text
              type="primary"
              :disabled="!canTestDefinition(row)"
              @click="handleRun(row, 'test')"
            >
              {{ t('packages_business_workflow_test') }}
            </ElButton>
            <ElButton
              v-if="row.hasActiveRun"
              text
              type="primary"
              @click="goActiveRun(row)"
            >
              {{ t('packages_business_workflow_view_active') }}
            </ElButton>
            <ElButton
              text
              type="primary"
              :disabled="!canEditDefinition(row)"
              @click="goEdit(row)"
            >
              {{ t('public_button_edit') }}
            </ElButton>
            <ElButton text type="primary" @click="goRuns(row)">
              {{ t('packages_business_workflow_runs') }}
            </ElButton>
            <ElButton
              text
              type="primary"
              :disabled="!canDeleteDefinition(row)"
              @click="handleDelete(row)"
            >
              {{ t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </TablePage>
    <ContextTaskDialog
      v-model:visible="contextVisible"
      :options="contextOptions"
      @confirm="askContextThen"
      @closed="cancelContext"
    />
  </PageContainer>
</template>
