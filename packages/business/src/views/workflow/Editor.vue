<script setup lang="ts">
import {
  createWorkflow,
  disableWorkflow,
  enableWorkflow,
  getWorkflow,
  getWorkflowCapabilities,
  getWorkflowErrorPayload,
  getWorkflowVariableSchema,
  getWorkflowVersions,
  updateWorkflow,
  validateWorkflowSpec,
  type WorkflowDefinitionDto,
  type WorkflowSpec,
  type WorkflowStepSpec,
  type WorkflowStepType,
  type WorkflowTaskCapability,
  type WorkflowValidationIssue,
  type WorkflowVariableSchemaItem,
  type WorkflowVersionDto,
} from '@tap/api/src/core/workflows'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import ContextTaskDialog from './components/ContextTaskDialog.vue'
import StepForm from './components/StepForm.vue'
import WorkflowStepList from './components/StepList.vue'
import WorkflowStepPalette from './components/StepPalette.vue'
import StepTypeIcon from './components/StepTypeIcon.vue'
import { stepLabelKey, triggerCardTitleKey, triggerLabelKey } from './constants'
import {
  canEditDefinition,
  canRunDefinition,
  canTestDefinition,
  cloneSpec,
  collectTaskIds,
  createEmptySpec,
  createEmptyStep,
  formatDateTime,
  issuesByStep,
  normalizeSpec,
} from './helpers'
import { useWorkflowActions } from './useWorkflowActions'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const {
  contextVisible,
  contextOptions,
  askContextThen,
  cancelContext,
  runOrTest,
} = useWorkflowActions()

const loading = ref(false)
const saving = ref(false)
const definition = ref<WorkflowDefinitionDto | null>(null)
const name = ref('')
const description = ref('')
const spec = ref<WorkflowSpec>(createEmptySpec())
const savedSnapshot = ref('')
const issues = ref<WorkflowValidationIssue[]>([])
const variables = ref<WorkflowVariableSchemaItem[]>([])
const capabilities = ref<Record<string, WorkflowTaskCapability>>({})
const selectedKind = ref<'trigger' | 'step'>('trigger')
const selectedStep = ref<WorkflowStepSpec | null>(null)
const versions = ref<WorkflowVersionDto[]>([])
const versionsVisible = ref(false)

const workflowId = computed(() => (route.params.id as string) || '')
const readonly = computed(
  () => !!definition.value && !canEditDefinition(definition.value),
)
const dirty = computed(
  () =>
    JSON.stringify({
      name: name.value,
      description: description.value,
      spec: spec.value,
    }) !== savedSnapshot.value,
)
const issueMap = computed(() => issuesByStep(issues.value))

function snapshot() {
  savedSnapshot.value = JSON.stringify({
    name: name.value,
    description: description.value,
    spec: spec.value,
  })
}

function applyDefinition(dto: WorkflowDefinitionDto) {
  definition.value = dto
  name.value = dto.name || ''
  description.value = dto.description || ''
  spec.value = normalizeSpec(
    dto.spec ? cloneSpec(dto.spec) : createEmptySpec(dto.name),
  )
  snapshot()
}

async function refreshCapabilities() {
  const ids = collectTaskIds(spec.value)
  if (!ids.length) {
    capabilities.value = {}
    return
  }
  const list = await getWorkflowCapabilities(ids)
  capabilities.value = Object.fromEntries(
    (list || []).map((item) => [item.taskId, item]),
  )
}

async function load() {
  loading.value = true
  try {
    const schema = await getWorkflowVariableSchema()
    variables.value = Array.isArray(schema)
      ? schema
      : (schema as { items?: WorkflowVariableSchemaItem[] } | null)?.items || []
    if (workflowId.value) {
      const dto = await getWorkflow(workflowId.value)
      applyDefinition(dto)
    } else {
      definition.value = null
      name.value = ''
      description.value = ''
      spec.value = createEmptySpec()
      snapshot()
    }
    selectedKind.value = 'trigger'
    selectedStep.value = null
    issues.value = []
    await refreshCapabilities()
  } finally {
    loading.value = false
  }
}

function currentSpec(): WorkflowSpec {
  return {
    ...spec.value,
    name: name.value,
    description: description.value,
  }
}

function applyIssues(list: WorkflowValidationIssue[] = []) {
  issues.value = list
}

async function handleValidate(showToast = true) {
  const result = await validateWorkflowSpec(currentSpec())
  applyIssues(result.issues || [])
  if (result.valid) {
    if (showToast)
      ElMessage.success(t('packages_business_workflow_validate_ok'))
    return true
  }
  ElMessage.warning(t('packages_business_workflow_validate_fail'))
  return false
}

async function handleSave() {
  if (!name.value.trim()) {
    ElMessage.warning(t('packages_business_workflow_name_required'))
    return false
  }
  saving.value = true
  try {
    const payload = {
      name: name.value.trim(),
      description: description.value,
      spec: currentSpec(),
      expectedVersion: definition.value?.currentVersion,
      expectedDefinitionHash: definition.value?.currentDefinitionHash,
    }
    const valid = await handleValidate(false)
    if (!valid) return false
    const dto = definition.value?.id
      ? await updateWorkflow(definition.value.id, payload)
      : await createWorkflow(payload)
    applyDefinition(dto)
    if (!workflowId.value) {
      await router.replace({ name: 'workflowEdit', params: { id: dto.id } })
    }
    ElMessage.success(t('public_message_save_ok'))
    return true
  } catch (error) {
    const payload = getWorkflowErrorPayload(error)
    if (
      payload.code === 'Workflow.CompileError' &&
      Array.isArray(payload.data)
    ) {
      applyIssues(payload.data as WorkflowValidationIssue[])
    }
    return false
  } finally {
    saving.value = false
  }
}

async function handleEnable() {
  if (dirty.value && !(await handleSave())) return
  if (!definition.value?.id) return
  const dto = await enableWorkflow(definition.value.id)
  applyDefinition(dto)
  ElMessage.success(t('packages_business_workflow_enabled_ok'))
}

async function handleDisable() {
  if (!definition.value?.id) return
  const dto = await disableWorkflow(definition.value.id)
  applyDefinition(dto)
  ElMessage.success(t('public_message_operation_success'))
}

async function handleRun(mode: 'run' | 'test') {
  if (!definition.value?.id) {
    if (!(await handleSave())) return
  } else if (dirty.value && !(await handleSave())) {
    return
  }
  if (!definition.value) return
  const decision = await runOrTest(definition.value, mode)
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
}

async function openVersions() {
  if (!definition.value?.id) return
  const data = await getWorkflowVersions(definition.value.id)
  versions.value = Array.isArray(data) ? data : []
  versionsVisible.value = true
}

function selectTrigger() {
  selectedKind.value = 'trigger'
  selectedStep.value = null
}

function selectStep(step: WorkflowStepSpec) {
  selectedKind.value = 'step'
  selectedStep.value = step
}

function addStepFromPalette(type: WorkflowStepType) {
  if (readonly.value) return
  const step = createEmptyStep(type)
  spec.value.steps = [...(spec.value.steps || []), step]
  selectStep(step)
}

const refreshCapabilitiesDebounced = debounce(refreshCapabilities, 400)

watch(
  () => spec.value,
  () => {
    refreshCapabilitiesDebounced()
  },
  { deep: true },
)

watch(workflowId, () => {
  load()
})

onMounted(load)
onUnmounted(() => {
  refreshCapabilitiesDebounced.cancel()
})
</script>

<template>
  <PageContainer
    mode="full"
    header-class="px-6 py-3"
    content-class="flex-1 min-h-0 overflow-hidden px-6 pb-4"
  >
    <template #title>
      <ElInput
        v-model="name"
        class="editor-name-input"
        :disabled="readonly"
        :placeholder="t('packages_business_workflow_name_placeholder')"
      />
    </template>
    <template #left-actions>
      <ElInput
        v-model="description"
        class="editor-desc-input ml-3"
        :disabled="readonly"
        :placeholder="t('public_description')"
      />
      <ElTag
        v-if="definition"
        class="ml-3"
        :type="definition.enabled ? 'success' : 'info'"
        size="small"
      >
        {{
          definition.enabled
            ? t('public_button_enable')
            : t('public_button_disable')
        }}
      </ElTag>
      <span v-if="definition" class="ml-2 fs-7 font-color-sslight">
        v{{ definition.currentVersion }}
      </span>
    </template>
    <template #actions>
      <div class="editor-actions">
        <ElButton :disabled="!definition?.id" @click="openVersions">
          {{ t('public_version') }}
        </ElButton>
        <ElButton
          :loading="saving"
          :disabled="readonly"
          @click="() => handleValidate()"
        >
          {{ t('packages_business_workflow_validate') }}
        </ElButton>
        <ElDivider direction="vertical" />
        <ElButton
          type="primary"
          :loading="saving"
          :disabled="readonly"
          @click="handleSave"
        >
          {{ t('public_button_save') }}
        </ElButton>
        <ElButton v-if="definition?.enabled" @click="handleDisable">
          {{ t('public_button_disable') }}
        </ElButton>
        <ElButton v-else :disabled="!definition?.id" @click="handleEnable">
          {{ t('public_button_enable') }}
        </ElButton>
        <ElButton
          v-if="definition?.enabled"
          :disabled="!canRunDefinition(definition)"
          @click="handleRun('run')"
        >
          {{ t('packages_business_workflow_run') }}
        </ElButton>
        <ElButton
          v-else
          :disabled="!canTestDefinition(definition || { enabled: false })"
          @click="handleRun('test')"
        >
          {{ t('packages_business_workflow_test') }}
        </ElButton>
      </div>
    </template>

    <div v-loading="loading" class="workflow-editor">
      <ElAlert
        v-if="readonly"
        type="warning"
        :closable="false"
        class="mb-3"
        :title="
          definition?.hasActiveRun
            ? t('packages_business_workflow_locked_active')
            : t('packages_business_workflow_locked_enabled')
        "
      />
      <ElAlert
        v-if="issues.length"
        type="error"
        :closable="false"
        class="mb-3"
        :title="t('packages_business_workflow_validate_fail')"
      >
        <div v-for="(issue, index) in issues" :key="index" class="fs-7">
          {{ issue.errorCode }}
          <span v-if="issue.fieldPath"> · {{ issue.fieldPath }}</span>
        </div>
      </ElAlert>
      <div class="editor-grid bg-light rounded-xl">
        <div class="editor-palette overflow-auto">
          <WorkflowStepPalette :readonly="readonly" @add="addStepFromPalette" />
        </div>
        <div class="editor-flow overflow-auto">
          <div class="flow-rail">
            <div
              class="step-card"
              :class="{
                'is-active': selectedKind === 'trigger',
                'has-error': issueMap._trigger?.length,
              }"
              @click="selectTrigger"
            >
              <div class="flex align-items-center gap-2">
                <span class="type-icon-well">
                  <el-icon :size="14"><i-lucide-zap /></el-icon>
                </span>
                <div class="min-w-0">
                  <div class="fw-sub">
                    {{ t(triggerCardTitleKey(spec.trigger?.type)) }}
                  </div>
                  <div class="fs-7 font-color-sslight mt-1">
                    {{ t(triggerLabelKey(spec.trigger?.type || 'MANUAL')) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flow-connector" />
            <WorkflowStepList
              v-model:steps="spec.steps"
              :readonly="readonly"
              :selected-id="selectedKind === 'step' ? selectedStep?.stepId : ''"
              :issues-by-step="issueMap"
              @select="selectStep"
            />
          </div>
        </div>
        <div class="editor-config overflow-auto">
          <div class="config-header">
            <span class="type-icon-well">
              <el-icon v-if="selectedKind === 'trigger'" :size="14">
                <i-lucide-zap />
              </el-icon>
              <StepTypeIcon
                v-else-if="selectedStep"
                :type="selectedStep.type"
                :size="14"
              />
              <el-icon v-else :size="14"><i-lucide-settings /></el-icon>
            </span>
            <div class="min-w-0">
              <div class="fw-sub ellipsis">
                {{
                  selectedKind === 'trigger'
                    ? t(triggerCardTitleKey(spec.trigger?.type))
                    : selectedStep?.name ||
                      t('packages_business_workflow_step_config')
                }}
              </div>
              <div class="fs-7 font-color-sslight ellipsis">
                {{
                  selectedKind === 'trigger'
                    ? t(triggerLabelKey(spec.trigger?.type || 'MANUAL'))
                    : selectedStep
                      ? t(stepLabelKey(selectedStep.type))
                      : ''
                }}
              </div>
            </div>
          </div>
          <ElForm label-position="top" class="config-form">
            <StepForm
              v-if="selectedKind === 'trigger'"
              v-model:trigger="spec.trigger"
              kind="trigger"
              :disabled="readonly"
              :capabilities="capabilities"
              :variables="variables"
              :spec="spec"
            />
            <StepForm
              v-else-if="selectedStep"
              :key="selectedStep.stepId"
              v-model:step="selectedStep"
              kind="step"
              :disabled="readonly"
              :capabilities="capabilities"
              :variables="variables"
              :spec="spec"
            />
          </ElForm>
        </div>
      </div>
    </div>
    <ElDrawer
      v-model="versionsVisible"
      :title="t('packages_business_workflow_versions')"
      size="420px"
    >
      <div
        v-for="item in versions"
        :key="item.id"
        class="p-3 mb-2 border rounded-lg"
      >
        <div class="fw-sub">v{{ item.version }}</div>
        <div class="fs-7 font-color-sslight">
          {{ formatDateTime(item.createTime) }}
        </div>
      </div>
    </ElDrawer>
    <ContextTaskDialog
      v-model:visible="contextVisible"
      :options="contextOptions"
      @confirm="askContextThen"
      @closed="cancelContext"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.editor-name-input,
.editor-desc-input {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    background-color: var(--el-fill-color-light);
    &:hover,
    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-7) inset;
    }
  }
}
.editor-name-input {
  width: 260px;
  flex-shrink: 0;
}
.editor-desc-input {
  width: 220px;
  min-width: 140px;
  flex-shrink: 1;
}
.editor-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 16px;
  --btn-space: 0;
  :deep(.el-divider--vertical) {
    height: 16px;
    margin: 0 4px;
    border-color: var(--el-border-color);
  }
}
.workflow-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.editor-grid {
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr) minmax(320px, 360px);
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
.editor-palette,
.editor-flow,
.editor-config {
  min-height: 0;
}
.editor-palette {
  padding: 12px 10px 16px;
  border-right: 1px solid var(--el-border-color-lighter);
}
.editor-flow {
  padding: 20px 16px;
}
.editor-config {
  padding: 16px;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-lighter);
}
.flow-rail {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
.flow-connector {
  width: 2px;
  height: 12px;
  margin: 0 auto 8px;
  background: var(--el-border-color);
}
.config-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.config-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  :deep(.el-form-item__label) {
    margin-bottom: 4px;
  }
}
.step-card {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
  &.is-active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
  }
  &.has-error {
    border-color: var(--el-color-danger);
  }
}
.type-icon-well {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
  flex-shrink: 0;
}
</style>
