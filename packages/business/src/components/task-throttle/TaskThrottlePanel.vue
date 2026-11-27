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
    registerValidateHandler?: ((fn: (() => boolean) | null) => void) | null
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
    registerValidateHandler: null,
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
const draftBaseVersion = ref<number>(0)
const policyLoaded = ref(false)
const policyLoadError = ref(false)
let activeLoadSeq = 0
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

function validateField(
  phase: ThrottlePhase,
  field: 'bytesPerSec' | 'eventsPerSec',
) {
  const phaseDraft = draft.value?.[phase]
  if (!phaseDraft?.enabled) {
    clearPhaseErrors(phase, field)
    return
  }
  if (field === 'bytesPerSec' && !phaseDraft.bytesEnabled) {
    clearPhaseErrors(phase, field)
    return
  }
  if (field === 'eventsPerSec' && !phaseDraft.qpsEnabled) {
    clearPhaseErrors(phase, field)
    return
  }
  const singleFieldErrors = validateThrottleDraft(draft.value, [phase]).filter(
    (e) => e.phase === phase && e.field === field,
  )
  validationErrors.value = [
    ...validationErrors.value.filter(
      (e) => e.phase !== phase || e.field !== field,
    ),
    ...singleFieldErrors,
  ]
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
  const targetTaskId = resolvedTaskId.value
  const targetKind = normalizedKind.value
  if (!targetTaskId || !targetKind) return
  const seqSnapshot = activeLoadSeq
  try {
    const fresh = await getTaskThrottlePolicy(targetKind, targetTaskId, {
      skipErrorMessage: true,
      skipErrorHandler: true,
    })
    if (
      seqSnapshot !== activeLoadSeq ||
      resolvedTaskId.value !== targetTaskId ||
      normalizedKind.value !== targetKind
    ) {
      return
    }
    const wasDirty = dirty.value
    policyView.value = fresh
    policyLoaded.value = true
    policyLoadError.value = false
    if (!wasDirty) {
      draftBaseVersion.value = fresh?.desiredVersion ?? 0
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
  const seq = ++activeLoadSeq
  const targetTaskId = resolvedTaskId.value
  const targetKind = normalizedKind.value
  policyView.value = null
  draftBaseVersion.value = 0
  policyLoaded.value = false
  policyLoadError.value = false
  savedDraftSnapshot.value = createDefaultThrottleDraft()
  draft.value = createDefaultThrottleDraft()
  fetchedOverview.value = null
  validationErrors.value = []
  conflictBanner.value = ''
  saveFailed.value = false
  saveErrorMessage.value = ''
  if (!targetTaskId || !targetKind) {
    return
  }
  loading.value = true
  try {
    const view = await getTaskThrottlePolicy(targetKind, targetTaskId, {
      skipErrorMessage: true,
    })
    if (seq !== activeLoadSeq) return
    policyView.value = view
    draftBaseVersion.value = view?.desiredVersion ?? 0
    policyLoaded.value = true
    policyLoadError.value = false
    const nextDraft = policyViewToDraft(view)
    savedDraftSnapshot.value = nextDraft
    draft.value = policyViewToDraft(view)

    if (targetKind === 'logCollector' && !props.logCollectorOverview) {
      const overview = await getLogCollectorThrottleOverview(
        targetTaskId,
      ).catch(() => null)
      if (seq === activeLoadSeq) {
        fetchedOverview.value = overview
      }
    }
    ensurePendingPoll()
  } catch {
    if (seq === activeLoadSeq) {
      policyLoaded.value = false
      policyLoadError.value = true
    }
  } finally {
    if (seq === activeLoadSeq) {
      loading.value = false
    }
  }
}

function validateDraft(): ThrottleValidationError[] {
  const errs = validateThrottleDraft(draft.value, applicablePhases.value)
  validationErrors.value = errs
  return errs
}

function resetDraft() {
  activeLoadSeq++
  stopPendingPoll()
  if (policyView.value && policyLoaded.value) {
    draftBaseVersion.value = policyView.value.desiredVersion ?? 0
    savedDraftSnapshot.value = policyViewToDraft(policyView.value)
    draft.value = policyViewToDraft(policyView.value)
  } else {
    draftBaseVersion.value = 0
    savedDraftSnapshot.value = createDefaultThrottleDraft()
    draft.value = createDefaultThrottleDraft()
  }
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
  if (policyLoadError.value || (resolvedTaskId.value && !policyLoaded.value)) {
    const loadErrMsg = t(
      'packages_business_task_throttle_load_required_before_save',
    )
    saveFailed.value = true
    saveErrorMessage.value = loadErrMsg
    ElMessage.error(loadErrMsg)
    return false
  }

  const errs = validateDraft()
  if (errs.length > 0) {
    ElMessage.error(formatValidationError(errs[0]))
    return false
  }

  const expectedVersion = draftBaseVersion.value
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
    draftBaseVersion.value = updated?.desiredVersion ?? 0
    policyLoaded.value = true
    policyLoadError.value = false
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
        draftBaseVersion.value = conflict.latestView.desiredVersion ?? 0
        policyLoaded.value = true
        policyLoadError.value = false
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
  if (policyLoadError.value || (resolvedTaskId.value && !policyLoaded.value)) {
    if (dirty.value) {
      ElMessage.error(
        t('packages_business_task_throttle_load_required_before_save'),
      )
      return false
    }
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

function validateBeforeTaskSave(): boolean {
  if (!normalizedKind.value || !props.canEdit) {
    return true
  }
  const errs = validateDraft()
  if (errs.length > 0) {
    ElMessage.error(formatValidationError(errs[0]))
    return false
  }
  if (
    dirty.value &&
    (policyLoadError.value || (resolvedTaskId.value && !policyLoaded.value))
  ) {
    ElMessage.error(
      t('packages_business_task_throttle_load_required_before_save'),
    )
    return false
  }
  return true
}

onMounted(() => {
  props.registerSaveHandler?.(saveIfNeeded)
  props.registerValidateHandler?.(validateBeforeTaskSave)
})

onBeforeUnmount(() => {
  stopPendingPoll()
  props.registerSaveHandler?.(null)
  props.registerValidateHandler?.(null)
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
        <!-- 顶部规则说明 + 生效状态胶囊 -->
        <div class="throttle-top-bar">
          <span class="throttle-top-note">
            {{ t('packages_business_task_throttle_direction_note') }}
          </span>
          <el-tag
            :type="statusSummary.type"
            size="small"
            effect="light"
            class="throttle-status-tag"
          >
            {{ statusSummary.text }}
          </el-tag>
        </div>

        <!-- 运行中只读锁说明 -->
        <div
          v-if="props.runningMode && props.canEdit"
          class="throttle-banner throttle-banner--info"
        >
          <svg
            class="throttle-banner__icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <path
              d="M8 7.2v4M8 4.8h.01"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="throttle-banner__text">
            {{ t('packages_business_task_throttle_running_readonly_tip') }}
          </span>
        </div>

        <!-- CAS 版本冲突提醒 -->
        <div
          v-if="conflictBanner"
          class="throttle-banner throttle-banner--warning"
        >
          <svg
            class="throttle-banner__icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.14 2.86 1.65 12.2a1 1 0 0 0 .86 1.5h10.98a1 1 0 0 0 .86-1.5L8.86 2.86a1 1 0 0 0-1.72 0Z"
              stroke="currentColor"
              stroke-width="1.35"
            />
            <path
              d="M8 6.2v3.3M8 11.4h.01"
              stroke="currentColor"
              stroke-width="1.45"
              stroke-linecap="round"
            />
          </svg>
          <span class="throttle-banner__text">{{ conflictBanner }}</span>
        </div>

        <!-- 防双写停止门禁横幅 -->
        <div
          v-if="policyView?.stopGateStatus === 'WAITING_STOP_EVIDENCE'"
          class="throttle-banner throttle-banner--warning"
        >
          <svg
            class="throttle-banner__icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.14 2.86 1.65 12.2a1 1 0 0 0 .86 1.5h10.98a1 1 0 0 0 .86-1.5L8.86 2.86a1 1 0 0 0-1.72 0Z"
              stroke="currentColor"
              stroke-width="1.35"
            />
            <path
              d="M8 6.2v3.3M8 11.4h.01"
              stroke="currentColor"
              stroke-width="1.45"
              stroke-linecap="round"
            />
          </svg>
          <div class="throttle-banner__body">
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
        </div>

        <!-- 期望策略配置（按阶段卡片） -->
        <div
          v-for="phase in phaseList"
          :key="phase"
          class="throttle-phase-card"
          :class="{
            'is-active': isPhaseApplicable(phase) && draft[phase].enabled,
            'is-inactive': !isPhaseApplicable(phase),
          }"
        >
          <div class="throttle-phase-card__head">
            <div class="flex align-center gap-2">
              <span
                class="throttle-phase-dot"
                :class="{
                  'is-on': isPhaseApplicable(phase) && draft[phase].enabled,
                }"
              />
              <span class="throttle-phase-card__title">
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

          <div
            v-if="!isPhaseApplicable(phase)"
            class="fs-8 font-color-sslight mt-2"
          >
            {{ t('packages_business_task_throttle_not_applicable_tip') }}
          </div>

          <div
            v-else-if="draft[phase].enabled"
            class="throttle-phase-card__body"
          >
            <div v-if="getFieldError(phase, 'phase')" class="color-danger fs-8">
              {{ getFieldError(phase, 'phase') }}
            </div>

            <!-- 同步数据速率（MB/s） -->
            <div class="throttle-metric-group">
              <div class="throttle-metric-row">
                <el-checkbox
                  v-model="draft[phase].bytesEnabled"
                  :disabled="!props.canEdit"
                  class="throttle-metric-check"
                  @change="clearPhaseErrors(phase, 'bytesPerSec')"
                >
                  {{ t('packages_business_task_throttle_data_rate_short') }}
                </el-checkbox>
                <el-input
                  v-model="draft[phase].mbPerSecInput"
                  size="small"
                  class="throttle-metric-input"
                  :class="{
                    'is-field-error': Boolean(
                      getFieldError(phase, 'bytesPerSec'),
                    ),
                  }"
                  :disabled="!props.canEdit || !draft[phase].bytesEnabled"
                  :placeholder="
                    t('packages_business_task_throttle_data_rate_placeholder')
                  "
                  @input="clearPhaseErrors(phase, 'bytesPerSec')"
                  @blur="validateField(phase, 'bytesPerSec')"
                >
                  <template #append>MB/s</template>
                </el-input>
              </div>
              <div
                v-if="getFieldError(phase, 'bytesPerSec')"
                class="throttle-metric-error color-danger fs-8"
              >
                {{ getFieldError(phase, 'bytesPerSec') }}
              </div>
            </div>

            <!-- QPS（事件/s） -->
            <div class="throttle-metric-group">
              <div class="throttle-metric-row">
                <el-checkbox
                  v-model="draft[phase].qpsEnabled"
                  :disabled="!props.canEdit"
                  class="throttle-metric-check"
                  @change="clearPhaseErrors(phase, 'eventsPerSec')"
                >
                  {{ t('packages_business_task_throttle_qps_short') }}
                </el-checkbox>
                <el-input
                  v-model="draft[phase].eventsPerSecInput"
                  size="small"
                  class="throttle-metric-input"
                  :class="{
                    'is-field-error': Boolean(
                      getFieldError(phase, 'eventsPerSec'),
                    ),
                  }"
                  :disabled="!props.canEdit || !draft[phase].qpsEnabled"
                  :placeholder="
                    t('packages_business_task_throttle_qps_placeholder')
                  "
                  @input="clearPhaseErrors(phase, 'eventsPerSec')"
                  @blur="validateField(phase, 'eventsPerSec')"
                >
                  <template #append>/s</template>
                </el-input>
              </div>
              <div
                v-if="getFieldError(phase, 'eventsPerSec')"
                class="throttle-metric-error color-danger fs-8"
              >
                {{ getFieldError(phase, 'eventsPerSec') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 启用限速统一风险提示（AC-35） -->
        <div
          v-if="anyEnabledApplicable"
          class="throttle-banner throttle-banner--warning"
        >
          <svg
            class="throttle-banner__icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.14 2.86 1.65 12.2a1 1 0 0 0 .86 1.5h10.98a1 1 0 0 0 .86-1.5L8.86 2.86a1 1 0 0 0-1.72 0Z"
              stroke="currentColor"
              stroke-width="1.35"
            />
            <path
              d="M8 6.2v3.3M8 11.4h.01"
              stroke="currentColor"
              stroke-width="1.45"
              stroke-linecap="round"
            />
          </svg>
          <div class="throttle-banner__body">
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
        </div>

        <!-- 已应用上限对照摘要区（AC-10 / AC-16） -->
        <div v-if="resolvedTaskId" class="throttle-applied-card fs-8">
          <div class="throttle-applied-card__head">
            <span class="fw-sub font-color-dark">
              {{ t('packages_business_task_throttle_applied_section') }}
            </span>
            <span v-if="hasConfirmedApplied" class="throttle-version-pill">
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
            <div class="throttle-applied-card__rows">
              <div
                v-for="phase in applicablePhases"
                :key="`applied-${phase}`"
                class="throttle-applied-card__row"
              >
                <span class="font-color-light">{{ phaseLabel(phase) }}</span>
                <span class="fw-sub font-color-dark tabular-nums">
                  {{ formatAppliedPhaseSummary(phase) }}
                </span>
              </div>
              <div
                class="throttle-applied-card__row throttle-applied-card__time"
              >
                <span class="font-color-light">
                  {{ t('packages_business_task_throttle_applied_time_label') }}
                </span>
                <span class="font-color-normal tabular-nums">
                  {{ formatTime(policyView?.appliedAt) }}
                </span>
              </div>
            </div>
          </template>

          <div v-if="policyView?.lastApplyReason" class="color-danger mt-1">
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

<style lang="scss" scoped>
.task-throttle-panel {
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

.throttle-top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.throttle-top-note {
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
}

.throttle-status-tag {
  flex-shrink: 0;
}

.throttle-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;

  &--info {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;

    .throttle-banner__icon {
      color: #3b82f6;
    }
  }

  &--warning {
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;

    .throttle-banner__icon {
      color: #d97706;
    }
  }

  &__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__text,
  &__body {
    flex: 1;
    min-width: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
}

.throttle-phase-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #fafbfc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &.is-active {
    background-color: #ffffff;
    border-color: #d6e4ff;
  }

  &.is-inactive {
    background-color: #f8fafc;
    border-color: #ebeef5;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #e5e7eb;
  }
}

.throttle-phase-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #cbd5e1;
  flex-shrink: 0;

  &.is-on {
    background-color: #2c65ff;
  }
}

.throttle-metric-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.throttle-metric-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.throttle-metric-check {
  margin-right: 0;
  height: auto;

  :deep(.el-checkbox__label) {
    font-size: 12px;
    color: #475569;
    padding-left: 6px;
  }
}

.throttle-metric-input {
  :deep(.el-input__wrapper) {
    font-variant-numeric: tabular-nums;
  }

  :deep(.el-input-group__append) {
    min-width: 54px;
    padding: 0 8px;
    justify-content: center;
    font-size: 12px;
    color: #64748b;
    background-color: #f8fafc;
  }

  &.is-field-error {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}

.throttle-metric-error {
  padding-left: 122px;
  line-height: 1.4;
}

.throttle-applied-card {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #f8fafc;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #e2e8f0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    line-height: 1.4;
  }

  &__time {
    padding-top: 4px;
    border-top: 1px solid #f1f5f9;
  }
}

.throttle-version-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  background-color: #eef2ff;
  color: #3730a3;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
