<script setup lang="ts">
import {
  extractTaskThrottleConflict,
  getLogCollectorThrottleOverview,
  getTaskThrottlePolicy,
  submitTaskThrottleStopEvidence,
  updateTaskThrottlePolicy,
  type LogCollectorThrottleOverviewView,
  type TaskThrottlePolicyView,
  type ThrottlePhase,
} from '@tap/api/src/core/task-throttle'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createDefaultThrottleDraft,
  draftToUpdateRequest,
  formatMbPerSec,
  getApplicableThrottlePhases,
  hasEnabledApplicablePhase,
  isDraftEqual,
  normalizeThrottleTaskKind,
  policyViewToDraft,
  validateThrottleDraft,
  type ThrottlePolicyDraft,
  type ThrottleValidationError,
} from './utils'

const props = withDefaults(
  defineProps<{
    taskId?: string | null
    taskKind?: string | null
    syncMode?: string | null
    taskStatus?: string | null
    canEdit?: boolean
    standalone?: boolean
    runningMode?: boolean
    logCollectorOverview?: LogCollectorThrottleOverviewView | null
    registerSaveHandler?:
      | ((fn: ((targetTaskId?: string) => Promise<boolean>) | null) => void)
      | null
  }>(),
  {
    taskId: '',
    taskKind: '',
    syncMode: 'initial_sync+cdc',
    taskStatus: '',
    canEdit: true,
    standalone: true,
    runningMode: false,
    logCollectorOverview: null,
    registerSaveHandler: null,
  },
)

const emit = defineEmits<{
  saved: [view: TaskThrottlePolicyView]
}>()

const { t } = useI18n()

const normalizedKind = computed(() => normalizeThrottleTaskKind(props.taskKind))
const resolvedTaskId = computed(() => {
  const id = props.taskId
  if (!id || typeof id !== 'string' || id.includes('{{')) return ''
  return id.trim()
})

const applicablePhases = computed(() =>
  getApplicableThrottlePhases(normalizedKind.value, props.syncMode),
)

const loading = ref(false)
const saving = ref(false)
const saveFailed = ref(false)
const saveErrorMessage = ref('')
const conflictBanner = ref('')

const policyView = ref<TaskThrottlePolicyView | null>(null)
const savedDraftSnapshot = ref<ThrottlePolicyDraft>(
  createDefaultThrottleDraft(),
)
const draft = ref<ThrottlePolicyDraft>(createDefaultThrottleDraft())
const validationErrors = ref<ThrottleValidationError[]>([])
const fetchedOverview = ref<LogCollectorThrottleOverviewView | null>(null)

const stopDialogVisible = ref(false)
const stopSubmitting = ref(false)
const stopForm = ref({
  evidenceRef: '',
  processExited: false,
  writeSettled: false,
  note: '',
})
const stopFormError = ref('')

let pendingTimer: ReturnType<typeof setInterval> | null = null

const effectiveOverview = computed(
  () => props.logCollectorOverview ?? fetchedOverview.value,
)

const anyEnabledApplicable = computed(() =>
  hasEnabledApplicablePhase(draft.value, applicablePhases.value),
)

const dirty = computed(
  () =>
    !isDraftEqual(
      draft.value,
      savedDraftSnapshot.value,
      applicablePhases.value,
    ),
)

const phaseList: ThrottlePhase[] = ['FULL', 'CDC']

function isPhaseApplicable(phase: ThrottlePhase): boolean {
  return applicablePhases.value.includes(phase)
}

function phaseLabel(phase: ThrottlePhase): string {
  return phase === 'FULL'
    ? t('packages_business_task_throttle_phase_full')
    : t('packages_business_task_throttle_phase_cdc')
}

function formatValidationError(err: ThrottleValidationError): string {
  const phase = phaseLabel(err.phase)
  switch (err.code) {
    case 'AT_LEAST_ONE_DIMENSION':
      return t('packages_business_task_throttle_err_at_least_one', { phase })
    case 'BYTES_REQUIRED':
      return t('packages_business_task_throttle_err_bytes_required', { phase })
    case 'BYTES_FORMAT':
      return t('packages_business_task_throttle_err_bytes_format', { phase })
    case 'BYTES_PRECISION':
      return t('packages_business_task_throttle_err_bytes_precision', { phase })
    case 'BYTES_RANGE':
      return t('packages_business_task_throttle_err_bytes_range', { phase })
    case 'QPS_REQUIRED':
      return t('packages_business_task_throttle_err_qps_required', { phase })
    case 'QPS_INTEGER':
      return t('packages_business_task_throttle_err_qps_integer', { phase })
    case 'QPS_RANGE':
      return t('packages_business_task_throttle_err_qps_range', { phase })
    default:
      return t('packages_business_task_throttle_save_failed')
  }
}

function getFieldError(
  phase: ThrottlePhase,
  field: 'phase' | 'bytesPerSec' | 'eventsPerSec',
): string {
  const found = validationErrors.value.find(
    (e) => e.phase === phase && e.field === field,
  )
  return found ? formatValidationError(found) : ''
}

function clearPhaseErrors(
  phase: ThrottlePhase,
  field?: 'phase' | 'bytesPerSec' | 'eventsPerSec',
) {
  validationErrors.value = validationErrors.value.filter(
    (e) =>
      e.phase !== phase || (field && e.field !== field && e.field !== 'phase'),
  )
  saveFailed.value = false
  saveErrorMessage.value = ''
}

function stopPendingPoll() {
  if (pendingTimer) {
    clearInterval(pendingTimer)
    pendingTimer = null
  }
}

function ensurePendingPoll() {
  if (
    resolvedTaskId.value &&
    normalizedKind.value &&
    policyView.value?.applyStatus === 'PENDING' &&
    props.taskStatus === 'running'
  ) {
    if (!pendingTimer) {
      pendingTimer = setInterval(() => {
        pollPolicyStatusOnly()
      }, 5000)
    }
  } else {
    stopPendingPoll()
  }
}

async function pollPolicyStatusOnly() {
  if (!resolvedTaskId.value || !normalizedKind.value) return
  try {
    const fresh = await getTaskThrottlePolicy(
      normalizedKind.value,
      resolvedTaskId.value,
      { skipErrorMessage: true, skipErrorHandler: true },
    )
    const wasDirty = dirty.value
    policyView.value = fresh
    if (!wasDirty) {
      savedDraftSnapshot.value = policyViewToDraft(fresh)
      draft.value = policyViewToDraft(fresh)
    }
    ensurePendingPoll()
  } catch {
    // Keep silent on background poll
  }
}

async function reload() {
  stopPendingPoll()
  if (!resolvedTaskId.value || !normalizedKind.value) {
    policyView.value = null
    savedDraftSnapshot.value = createDefaultThrottleDraft()
    draft.value = createDefaultThrottleDraft()
    fetchedOverview.value = null
    return
  }
  loading.value = true
  try {
    const view = await getTaskThrottlePolicy(
      normalizedKind.value,
      resolvedTaskId.value,
      { skipErrorMessage: true },
    )
    policyView.value = view
    const nextDraft = policyViewToDraft(view)
    savedDraftSnapshot.value = nextDraft
    draft.value = policyViewToDraft(view)
    validationErrors.value = []
    conflictBanner.value = ''
    saveFailed.value = false
    saveErrorMessage.value = ''

    if (
      normalizedKind.value === 'logCollector' &&
      !props.logCollectorOverview
    ) {
      fetchedOverview.value = await getLogCollectorThrottleOverview(
        resolvedTaskId.value,
      ).catch(() => null)
    }
    ensurePendingPoll()
  } catch {
    // Leave existing draft usable if initial policy read fails
  } finally {
    loading.value = false
  }
}

function validateDraft(): ThrottleValidationError[] {
  const errs = validateThrottleDraft(draft.value, applicablePhases.value)
  validationErrors.value = errs
  return errs
}

function resetDraft() {
  draft.value = policyView.value
    ? policyViewToDraft(policyView.value)
    : createDefaultThrottleDraft()
  validationErrors.value = []
  saveFailed.value = false
  saveErrorMessage.value = ''
  conflictBanner.value = ''
}

async function savePolicy(
  targetTaskId?: string,
  options?: { silentSuccess?: boolean },
): Promise<boolean> {
  const taskId = (targetTaskId || resolvedTaskId.value || '').trim()
  const kind = normalizedKind.value
  if (!kind || !taskId) {
    return false
  }
  if (!props.canEdit) {
    return true
  }

  const errs = validateDraft()
  if (errs.length > 0) {
    ElMessage.error(formatValidationError(errs[0]))
    return false
  }

  const expectedVersion = policyView.value?.desiredVersion ?? 0
  const payload = draftToUpdateRequest(
    draft.value,
    applicablePhases.value,
    expectedVersion,
  )

  saving.value = true
  conflictBanner.value = ''
  saveErrorMessage.value = ''
  try {
    const updated = await updateTaskThrottlePolicy(kind, taskId, payload)
    policyView.value = updated
    savedDraftSnapshot.value = policyViewToDraft(updated)
    draft.value = policyViewToDraft(updated)
    saveFailed.value = false
    ensurePendingPoll()
    emit('saved', updated)
    if (!options?.silentSuccess) {
      ElMessage.success(
        t('packages_business_task_throttle_save_success', {
          version: updated.desiredVersion,
        }),
      )
    }
    return true
  } catch (error: any) {
    const conflict = extractTaskThrottleConflict(error)
    if (conflict) {
      conflictBanner.value = t('packages_business_task_throttle_conflict_msg', {
        version: conflict.latestVersion,
      })
      if (conflict.latestView) {
        policyView.value = conflict.latestView
        savedDraftSnapshot.value = policyViewToDraft(conflict.latestView)
        draft.value = policyViewToDraft(conflict.latestView)
      }
      ElMessage.warning(conflictBanner.value)
      return false
    }

    saveFailed.value = true
    const serverMsg =
      error?.response?.data?.message ||
      error?.message ||
      t('packages_business_task_throttle_save_failed')
    saveErrorMessage.value = serverMsg
    ElMessage.error(serverMsg)
    return false
  } finally {
    saving.value = false
  }
}

async function saveIfNeeded(targetTaskId?: string): Promise<boolean> {
  if (!normalizedKind.value || !props.canEdit) {
    return true
  }
  const errs = validateDraft()
  if (errs.length > 0) {
    ElMessage.error(formatValidationError(errs[0]))
    return false
  }
  if (!dirty.value && !saveFailed.value) {
    return true
  }
  const taskId = (targetTaskId || resolvedTaskId.value || '').trim()
  if (!taskId) {
    return true
  }
  return await savePolicy(taskId, { silentSuccess: true })
}

function hasDirtyChanges(): boolean {
  return dirty.value
}

function hasEnabledPolicy(): boolean {
  return anyEnabledApplicable.value
}

const statusSummary = computed(() => {
  const status = policyView.value?.applyStatus
  const isRunning = String(props.taskStatus || '').toLowerCase() === 'running'
  if (!isRunning && anyEnabledApplicable.value && status !== 'APPLIED') {
    return {
      type: 'info' as const,
      text: t('packages_business_task_throttle_apply_on_start'),
    }
  }
  switch (status) {
    case 'APPLIED':
      return {
        type: 'success' as const,
        text: t('packages_business_task_throttle_status_applied'),
      }
    case 'PENDING':
      return {
        type: 'warning' as const,
        text: t('packages_business_task_throttle_status_pending'),
      }
    case 'FAILED':
      return {
        type: 'danger' as const,
        text: t('packages_business_task_throttle_status_failed'),
      }
    case 'WAITING_COMPATIBLE_AGENT':
      return {
        type: 'warning' as const,
        text: t('packages_business_task_throttle_status_waiting_agent'),
      }
    default:
      if (anyEnabledApplicable.value) {
        return {
          type: 'info' as const,
          text: t('packages_business_task_throttle_apply_on_start'),
        }
      }
      return {
        type: 'info' as const,
        text: t('packages_business_task_throttle_status_none'),
      }
  }
})

const hasConfirmedApplied = computed(() => {
  return Boolean(
    policyView.value &&
      policyView.value.appliedVersion > 0 &&
      policyView.value.appliedPhases,
  )
})

function formatAppliedPhaseSummary(phase: ThrottlePhase): string {
  const limit = policyView.value?.appliedPhases?.[phase]
  if (!limit || !limit.enabled) {
    return t('packages_business_task_throttle_phase_summary_off')
  }
  const parts: string[] = []
  if (limit.bytesPerSec && limit.bytesPerSec > 0) {
    parts.push(`${formatMbPerSec(limit.bytesPerSec)} MB/s`)
  }
  if (limit.eventsPerSec && limit.eventsPerSec > 0) {
    parts.push(`${limit.eventsPerSec} QPS`)
  }
  return (
    parts.join(' / ') || t('packages_business_task_throttle_phase_summary_off')
  )
}

function formatTime(ts?: number | null): string {
  return ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function openStopEvidenceDialog() {
  stopForm.value = {
    evidenceRef: '',
    processExited: false,
    writeSettled: false,
    note: '',
  }
  stopFormError.value = ''
  stopDialogVisible.value = true
}

async function submitStopEvidence() {
  if (!resolvedTaskId.value || !normalizedKind.value) return
  if (
    !stopForm.value.evidenceRef.trim() ||
    !stopForm.value.processExited ||
    !stopForm.value.writeSettled
  ) {
    stopFormError.value = t(
      'packages_business_task_throttle_stop_gate_validation_err',
    )
    return
  }
  stopFormError.value = ''
  stopSubmitting.value = true
  try {
    await submitTaskThrottleStopEvidence(
      normalizedKind.value,
      resolvedTaskId.value,
      {
        oldAgentId: policyView.value?.currentAgentId || undefined,
        oldRunEpoch: policyView.value?.currentRunEpoch ?? 0,
        evidenceRef: stopForm.value.evidenceRef.trim(),
        processExited: stopForm.value.processExited,
        writeSettled: stopForm.value.writeSettled,
        note: stopForm.value.note.trim() || undefined,
      },
    )
    stopDialogVisible.value = false
    ElMessage.success(t('packages_business_task_throttle_stop_gate_success'))
    await reload()
  } finally {
    stopSubmitting.value = false
  }
}

watch(
  () => [resolvedTaskId.value, normalizedKind.value],
  () => {
    reload()
  },
  { immediate: true },
)

watch(
  () => [props.taskStatus, policyView.value?.applyStatus],
  () => {
    ensurePendingPoll()
  },
)

onMounted(() => {
  props.registerSaveHandler?.(saveIfNeeded)
})

onBeforeUnmount(() => {
  stopPendingPoll()
  props.registerSaveHandler?.(null)
})

defineExpose({
  hasDirtyChanges,
  hasEnabledPolicy,
  validateDraft,
  savePolicy,
  saveIfNeeded,
  reload,
  resetDraft,
})
</script>

<template>
  <div v-if="normalizedKind" v-loading="loading" class="task-throttle-panel">
    <el-form :disabled="!props.canEdit" @submit.prevent>
      <div class="flex flex-column gap-3">
        <div class="flex justify-content-between align-center flex-wrap gap-2">
          <span class="fs-8 font-color-light">
            {{ t('packages_business_task_throttle_direction_note') }}
          </span>
          <el-tag :type="statusSummary.type" size="small" effect="light">
            {{ statusSummary.text }}
          </el-tag>
        </div>

        <el-alert
          v-if="props.runningMode && props.canEdit"
          type="info"
          :closable="false"
          show-icon
        >
          <span class="fs-8">
            {{ t('packages_business_task_throttle_running_readonly_tip') }}
          </span>
        </el-alert>

        <el-alert
          v-if="conflictBanner"
          type="warning"
          :closable="false"
          show-icon
        >
          <span class="fs-8">{{ conflictBanner }}</span>
        </el-alert>

        <el-alert
          v-if="policyView?.stopGateStatus === 'WAITING_STOP_EVIDENCE'"
          type="warning"
          :closable="false"
          show-icon
        >
          <div class="flex flex-column gap-1 fs-8">
            <div class="fw-sub">
              {{ t('packages_business_task_throttle_stop_gate_title') }}
            </div>
            <div>
              {{
                t('packages_business_task_throttle_stop_gate_meta', {
                  agent: policyView.currentAgentId || '-',
                  epoch: policyView.currentRunEpoch ?? 0,
                })
              }}
            </div>
            <div v-if="policyView.stopGateReason">
              {{ policyView.stopGateReason }}
            </div>
            <div v-if="props.canEdit && resolvedTaskId" class="mt-1">
              <el-button
                size="small"
                type="warning"
                plain
                @click="openStopEvidenceDialog"
              >
                {{ t('packages_business_task_throttle_stop_gate_submit_btn') }}
              </el-button>
            </div>
          </div>
        </el-alert>

        <!-- 期望策略配置（按阶段） -->
        <div
          v-for="phase in phaseList"
          :key="phase"
          class="p-3 rounded-lg border bg-light flex flex-column gap-2"
        >
          <div class="flex justify-content-between align-center gap-2">
            <div class="flex align-center gap-2">
              <span class="fw-sub fs-7 font-color-dark">
                {{ phaseLabel(phase) }}
              </span>
              <el-tag
                v-if="!isPhaseApplicable(phase)"
                size="small"
                type="info"
                effect="plain"
              >
                {{ t('packages_business_task_throttle_not_applicable') }}
              </el-tag>
            </div>
            <el-switch
              v-model="draft[phase].enabled"
              :disabled="!props.canEdit || !isPhaseApplicable(phase)"
              @change="clearPhaseErrors(phase)"
            />
          </div>

          <div v-if="!isPhaseApplicable(phase)" class="fs-8 font-color-sslight">
            {{ t('packages_business_task_throttle_not_applicable_tip') }}
          </div>

          <div
            v-else-if="draft[phase].enabled"
            class="flex flex-column gap-3 mt-1 pt-2 border-top"
          >
            <div v-if="getFieldError(phase, 'phase')" class="color-danger fs-8">
              {{ getFieldError(phase, 'phase') }}
            </div>

            <!-- 同步数据速率（MB/s） -->
            <div class="flex flex-column gap-1">
              <div class="flex justify-content-between align-center gap-2">
                <span class="fs-8 font-color-normal">
                  {{ t('packages_business_task_throttle_data_rate_label') }}
                </span>
                <el-switch
                  v-model="draft[phase].bytesEnabled"
                  size="small"
                  :disabled="!props.canEdit"
                  @change="clearPhaseErrors(phase, 'bytesPerSec')"
                />
              </div>
              <el-input
                v-if="draft[phase].bytesEnabled"
                v-model="draft[phase].mbPerSecInput"
                size="small"
                :disabled="!props.canEdit"
                :placeholder="
                  t('packages_business_task_throttle_data_rate_placeholder')
                "
                @input="clearPhaseErrors(phase, 'bytesPerSec')"
              >
                <template #append>MB/s</template>
              </el-input>
              <div
                v-if="getFieldError(phase, 'bytesPerSec')"
                class="color-danger fs-8"
              >
                {{ getFieldError(phase, 'bytesPerSec') }}
              </div>
            </div>

            <!-- QPS（事件/s） -->
            <div class="flex flex-column gap-1">
              <div class="flex justify-content-between align-center gap-2">
                <span class="fs-8 font-color-normal">
                  {{ t('packages_business_task_throttle_qps_label') }}
                </span>
                <el-switch
                  v-model="draft[phase].qpsEnabled"
                  size="small"
                  :disabled="!props.canEdit"
                  @change="clearPhaseErrors(phase, 'eventsPerSec')"
                />
              </div>
              <el-input
                v-if="draft[phase].qpsEnabled"
                v-model="draft[phase].eventsPerSecInput"
                size="small"
                :disabled="!props.canEdit"
                :placeholder="
                  t('packages_business_task_throttle_qps_placeholder')
                "
                @input="clearPhaseErrors(phase, 'eventsPerSec')"
              >
                <template #append>/s</template>
              </el-input>
              <div
                v-if="getFieldError(phase, 'eventsPerSec')"
                class="color-danger fs-8"
              >
                {{ getFieldError(phase, 'eventsPerSec') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 启用限速统一风险提示（AC-35） -->
        <el-alert
          v-if="anyEnabledApplicable"
          type="warning"
          :closable="false"
          show-icon
        >
          <div class="flex flex-column gap-1 fs-8">
            <div>{{ t('packages_business_task_throttle_risk_notice') }}</div>
            <div v-if="normalizedKind === 'logCollector'">
              {{
                t('packages_business_task_throttle_logcollector_risk_notice')
              }}
            </div>
            <div
              v-if="normalizedKind === 'logCollector' && effectiveOverview"
              class="fw-sub"
            >
              {{
                t('packages_business_task_throttle_logcollector_deps_summary', {
                  total: effectiveOverview.totalConsumerCount,
                  visible: effectiveOverview.visibleConsumers?.length || 0,
                  days: effectiveOverview.storageTimeDays,
                })
              }}
            </div>
          </div>
        </el-alert>

        <!-- 已应用上限对照摘要区（AC-10 / AC-16） -->
        <div
          v-if="resolvedTaskId"
          class="p-3 rounded-lg border bg-subtle flex flex-column gap-1 fs-8"
        >
          <div class="flex justify-content-between align-center">
            <span class="fw-sub font-color-dark">
              {{ t('packages_business_task_throttle_applied_section') }}
            </span>
            <span v-if="hasConfirmedApplied" class="font-color-light">
              {{
                t('packages_business_task_throttle_version_label', {
                  version: policyView?.appliedVersion,
                })
              }}
            </span>
            <span v-else class="font-color-sslight">
              {{ t('packages_business_task_throttle_not_applied_yet') }}
            </span>
          </div>

          <template v-if="hasConfirmedApplied">
            <div
              v-for="phase in applicablePhases"
              :key="`applied-${phase}`"
              class="flex justify-content-between font-color-normal"
            >
              <span>{{ phaseLabel(phase) }}</span>
              <span class="fw-sub">{{ formatAppliedPhaseSummary(phase) }}</span>
            </div>
            <div class="font-color-light">
              {{
                t('packages_business_task_throttle_applied_time', {
                  time: formatTime(policyView?.appliedAt),
                })
              }}
            </div>
          </template>

          <div v-if="policyView?.lastApplyReason" class="color-danger">
            {{
              t('packages_business_task_throttle_apply_reason', {
                reason: policyView.lastApplyReason,
              })
            }}
          </div>
        </div>

        <div v-if="saveErrorMessage" class="color-danger fs-8">
          {{ saveErrorMessage }}
        </div>

        <!-- 独立操作栏（已存在任务或在线调速） -->
        <div
          v-if="props.standalone && resolvedTaskId && props.canEdit"
          class="flex justify-content-end align-center gap-2 pt-1"
        >
          <el-button
            v-if="dirty || saveFailed"
            size="small"
            :disabled="saving"
            @click="resetDraft"
          >
            {{ t('packages_business_task_throttle_cancel_btn') }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            :loading="saving"
            :disabled="!dirty && !saveFailed"
            @click="savePolicy()"
          >
            {{
              saveFailed
                ? t('packages_business_task_throttle_retry_save_btn')
                : t('packages_business_task_throttle_save_btn')
            }}
          </el-button>
        </div>
      </div>
    </el-form>

    <el-dialog
      v-model="stopDialogVisible"
      :title="t('packages_business_task_throttle_stop_gate_dialog_title')"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="flex flex-column gap-3">
        <div class="fs-8 font-color-light">
          {{
            t('packages_business_task_throttle_stop_gate_meta', {
              agent: policyView?.currentAgentId || '-',
              epoch: policyView?.currentRunEpoch ?? 0,
            })
          }}
        </div>
        <div>
          <div class="fs-8 fw-sub mb-1">
            {{ t('packages_business_task_throttle_stop_gate_evidence_ref') }}
          </div>
          <el-input
            v-model="stopForm.evidenceRef"
            :placeholder="
              t(
                'packages_business_task_throttle_stop_gate_evidence_ref_placeholder',
              )
            "
          />
        </div>
        <el-checkbox v-model="stopForm.processExited">
          {{ t('packages_business_task_throttle_stop_gate_process_exited') }}
        </el-checkbox>
        <el-checkbox v-model="stopForm.writeSettled">
          {{ t('packages_business_task_throttle_stop_gate_write_settled') }}
        </el-checkbox>
        <div>
          <div class="fs-8 fw-sub mb-1">
            {{ t('packages_business_task_throttle_stop_gate_note') }}
          </div>
          <el-input v-model="stopForm.note" type="textarea" :rows="2" />
        </div>
        <div v-if="stopFormError" class="color-danger fs-8">
          {{ stopFormError }}
        </div>
      </div>
      <template #footer>
        <el-button @click="stopDialogVisible = false">
          {{ t('public_button_cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="stopSubmitting"
          @click="submitStopEvidence"
        >
          {{ t('packages_business_task_throttle_stop_gate_submit_btn') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
