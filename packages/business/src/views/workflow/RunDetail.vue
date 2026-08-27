<script setup lang="ts">
import {
  getWorkflowRun,
  rerunWorkflowRun,
  resumeWorkflowRun,
  stopWorkflowRun,
  WORKFLOW_ACTIVE_STATUSES,
  type WorkflowRunDto,
  type WorkflowStepRunDto,
} from '@tap/api/src/core/workflows'
import { useI18n } from '@tap/i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import StepTypeIcon from './components/StepTypeIcon.vue'
import {
  runStatusLabelKey,
  runStatusTagType,
  stepLabelKey,
  triggerLabelKey,
} from './constants'
import {
  formatDateTime,
  formatDuration,
  formatStepOutput,
  stepTimelineHeading,
  unmetTaskLabel,
} from './helpers'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const run = ref<WorkflowRunDto | null>(null)
const runId = computed(() => route.params.runId as string)

const isActive = computed(
  () => !!run.value && WORKFLOW_ACTIVE_STATUSES.includes(run.value.status),
)
const canStop = computed(() => isActive.value)
const canResume = computed(() => run.value?.status === 'FAILED')
const groupedSteps = computed(() => {
  const groups = new Map<string, WorkflowStepRunDto[]>()
  for (const step of run.value?.steps || []) {
    const list = groups.get(step.stepId) || []
    list.push(step)
    groups.set(step.stepId, list)
  }
  return [...groups.entries()].map(([stepId, attempts]) => ({
    stepId,
    attempts: attempts.sort((a, b) => a.attempt - b.attempt),
  }))
})
const currentStepTargets = computed(() => {
  const currentId = run.value?.currentStepId
  if (!currentId) return []
  const match = [...(run.value?.steps || [])]
    .reverse()
    .find((step) => step.stepId === currentId)
  return match?.targets || []
})

function groupHeading(group: { stepId: string; attempts: WorkflowStepRunDto[] }) {
  return stepTimelineHeading(group.attempts[0], group.stepId, (type) =>
    t(stepLabelKey(type)),
  )
}

function groupType(group: { attempts: WorkflowStepRunDto[] }) {
  return group.attempts[0]?.stepType || group.attempts.at(-1)?.stepType
}

function unmetName(taskId: string) {
  return unmetTaskLabel(taskId, currentStepTargets.value)
}

async function load() {
  if (!runId.value) return
  const silent = !!run.value
  if (!silent) loading.value = true
  try {
    run.value = await getWorkflowRun(runId.value)
  } finally {
    loading.value = false
  }
}

async function handleStop() {
  try {
    await ElMessageBox.confirm(
      t('packages_business_workflow_stop_confirm'),
      t('packages_business_important_reminder'),
    )
    await stopWorkflowRun(runId.value)
    ElMessage.success(t('public_message_operation_success'))
    await load()
  } catch {
    // dismissed
  }
}

async function handleResume() {
  await resumeWorkflowRun(runId.value)
  ElMessage.success(t('public_message_operation_success'))
  await load()
}

async function handleRerun() {
  const decision = await rerunWorkflowRun(runId.value)
  const nextId =
    decision?.decision === 'ACCEPTED' ? decision.runId : decision?.activeRunId
  if (decision?.decision === 'SUPPRESSED') {
    ElMessage.warning(t('packages_business_workflow_suppressed'))
  }
  if (nextId && nextId !== runId.value) {
    await router.replace({
      name: 'workflowRunDetail',
      params: { runId: nextId },
    })
  }
}

let timer: ReturnType<typeof setInterval> | null = null
watch(runId, async (id, prev) => {
  if (id && id !== prev) {
    run.value = null
    await load()
  }
})
onMounted(async () => {
  await load()
  timer = setInterval(() => {
    if (isActive.value) load()
  }, 1500)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <PageContainer mode="auto">
    <template #actions>
      <ElButton v-if="canStop" type="danger" @click="handleStop">
        {{ t('public_button_stop') }}
      </ElButton>
      <ElButton v-if="canResume" @click="handleResume">
        {{ t('packages_business_workflow_resume') }}
      </ElButton>
      <ElButton v-if="run && !isActive" type="primary" @click="handleRerun">
        {{ t('packages_business_workflow_rerun') }}
      </ElButton>
    </template>
    <div v-loading="loading" class="flex flex-column gap-4">
      <div v-if="run" class="flex flex-wrap gap-3 align-items-center">
        <ElTag :type="runStatusTagType(run.status)">
          {{ t(runStatusLabelKey(run.status)) }}
        </ElTag>
        <span>{{ run.workflowName }}</span>
        <span class="font-color-sslight">v{{ run.workflowVersion }}</span>
        <span>{{ t(triggerLabelKey(run.triggerType)) }}</span>
        <span>{{ formatDateTime(run.startedAt) }}</span>
        <span>{{ formatDuration(run.durationMs) }}</span>
      </div>
      <ElAlert
        v-if="run?.errorCode === 'Workflow.UnknownExternalResult'"
        type="warning"
        :closable="false"
        :title="t('packages_business_workflow_unknown_result_tip')"
      />
      <ElDescriptions v-if="run" :column="3" border>
        <ElDescriptionsItem :label="t('packages_business_workflow_run_id')">
          {{ run.id }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('packages_business_workflow_started_by')">
          {{ run.startedBy || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          :label="t('packages_business_workflow_resume_count')"
        >
          {{ run.resumeCount || 0 }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          :label="t('packages_business_workflow_wait_deadline')"
        >
          {{ formatDateTime(run.waitDeadline) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          :label="t('packages_business_workflow_last_resumed_by')"
        >
          {{ run.lastResumedBy || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem
          :label="t('packages_business_workflow_last_resumed_at')"
        >
          {{ formatDateTime(run.lastResumedAt) }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <div
        v-if="run?.waitProgress?.unmetTasks?.length"
        class="p-3 border rounded-lg"
      >
        <div class="fw-sub mb-2">
          {{ t('packages_business_workflow_wait_progress') }}
        </div>
        <ElTable :data="run.waitProgress.unmetTasks" size="small">
          <ElTableColumn :label="t('packages_business_workflow_task_id')">
            <template #default="{ row }">
              {{ unmetName(row.taskId) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="status" :label="t('public_status')" />
          <ElTableColumn
            prop="reason"
            :label="t('packages_business_workflow_reason')"
          />
        </ElTable>
      </div>
      <div>
        <div class="fw-sub mb-2">
          {{ t('packages_business_workflow_timeline') }}
        </div>
        <ElTimeline>
          <ElTimelineItem
            v-for="group in groupedSteps"
            :key="group.stepId"
            :type="
              group.attempts.at(-1)?.status === 'FAILED'
                ? 'danger'
                : group.attempts.at(-1)?.status === 'SUCCEEDED'
                  ? 'success'
                  : 'primary'
            "
          >
            <div class="flex align-items-start gap-2">
              <ElTooltip :content="group.stepId" placement="top">
                <span class="mt-1">
                  <StepTypeIcon
                    :type="groupType(group) || 'UNKNOWN'"
                    :size="16"
                  />
                </span>
              </ElTooltip>
              <div class="min-w-0">
                <div class="fw-sub">{{ groupHeading(group) }}</div>
              </div>
            </div>
            <div
              v-for="attempt in group.attempts"
              :key="attempt.id"
              class="mt-2 p-2 border rounded-lg"
            >
              <div class="flex gap-3 fs-7 flex-wrap">
                <span>#{{ attempt.attempt }}</span>
                <ElTag size="small" :type="runStatusTagType(attempt.status)">
                  {{ t(runStatusLabelKey(attempt.status)) }}
                </ElTag>
                <span>{{ formatDateTime(attempt.startedAt) }}</span>
                <span>{{ formatDuration(attempt.durationMs) }}</span>
              </div>
              <div
                v-if="attempt.targets?.length"
                class="flex flex-wrap gap-1 mt-2"
              >
                <ElTag
                  v-for="target in attempt.targets"
                  :key="`${target.kind}-${target.id || target.name}`"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ target.name || target.id }}
                </ElTag>
              </div>
              <div v-if="formatStepOutput(attempt)" class="mt-2">
                <div class="fs-7 color-[var(--el-text-color-secondary)]">
                  {{ t('packages_business_workflow_step_output') }}
                </div>
                <pre class="mt-1 mb-0 fs-7 overflow-auto">{{
                  formatStepOutput(attempt)
                }}</pre>
              </div>
              <div v-if="attempt.errorSummary" class="color-danger fs-7 mt-1">
                {{ attempt.errorSummary }}
              </div>
            </div>
          </ElTimelineItem>
        </ElTimeline>
      </div>
      <div v-if="run?.suppressedTriggers?.length">
        <div class="fw-sub mb-2">
          {{ t('packages_business_workflow_suppressed_triggers') }}
        </div>
        <ElTable :data="run.suppressedTriggers" size="small">
          <ElTableColumn
            prop="triggerType"
            :label="t('packages_business_workflow_trigger_type')"
          >
            <template #default="{ row }">
              {{ t(triggerLabelKey(row.triggerType)) }}
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('public_create_time')">
            <template #default="{ row }">
              {{ formatDateTime(row.triggerAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="reason"
            :label="t('packages_business_workflow_reason')"
          />
        </ElTable>
      </div>
    </div>
  </PageContainer>
</template>
