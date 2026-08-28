<script setup lang="ts">
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'
import {
  INSPECT_DIFF_METHODS,
  INSPECT_STEP_TYPES,
  STEP_TYPES,
  stepLabelKey,
  TIMEZONES,
  TRIGGER_TYPES,
  triggerLabelKey,
  WEEKDAYS,
} from '../constants'
import {
  isEventTrigger,
  msToUnit,
  triggerContextIds,
  unitToMs,
} from '../helpers'
import { DEFAULT_ALARM_HTML, DEFAULT_ALARM_TITLE } from '../alarmTemplate'
import { DEFAULT_WEBHOOK_BODY, WEBHOOK_METHODS, WEBHOOK_TEMPLATE_VARIABLES } from '../webhookTemplate'
import ConditionForm from './ConditionForm.vue'
import AlarmTemplateDialog from './AlarmTemplateDialog.vue'
import ResourceSelect from './ResourceSelect.vue'
import type {
  WorkflowSpec,
  WorkflowStepSpec,
  WorkflowTaskCapability,
  WorkflowTriggerSpec,
  WorkflowVariableSchemaItem,
} from '@tap/api/src/core/workflows'

const props = defineProps<{
  kind: 'trigger' | 'step'
  disabled?: boolean
  variables?: WorkflowVariableSchemaItem[]
  capabilities?: Record<string, WorkflowTaskCapability>
  spec?: WorkflowSpec | null
}>()

const trigger = defineModel<WorkflowTriggerSpec>('trigger')
const step = defineModel<WorkflowStepSpec>('step')
const { t } = useI18n()
const alarmTemplateVisible = ref(false)
const webhookEditor = ref<{ insert: (text: string) => void; getValue: () => string } | null>(null)

function restoreAlarmTemplate() {
  if (!step.value) return
  step.value.alarmTitle = DEFAULT_ALARM_TITLE
  step.value.alarmMessage = DEFAULT_ALARM_HTML
}

function saveAlarmTemplate(payload: { title: string; content: string }) {
  if (!step.value) return
  step.value.alarmTitle = payload.title
  step.value.alarmMessage = payload.content
}

function variableToken(name: string) {
  return `{${name}}`
}

function iconOf(kind: string) {
  if (kind === 'clock') return IconLucideClock
  if (kind === 'hash') return IconLucideHash
  if (kind === 'alert') return IconLucideTriangleAlert
  return IconLucideFileText
}

function onWebhookEditorInit(editor: { insert: (text: string) => void; getValue: () => string }) {
  webhookEditor.value = editor
}

function insertWebhookVariable(name: string) {
  if (!step.value) return
  const token = variableToken(name)
  if (webhookEditor.value) {
    webhookEditor.value.insert(token)
    step.value.webhookBody = webhookEditor.value.getValue()
    return
  }
  step.value.webhookBody = `${step.value.webhookBody || ''}${token}`
}

function restoreWebhookBody() {
  if (!step.value) return
  step.value.webhookBody = DEFAULT_WEBHOOK_BODY
}

function onWebhookUrlChange(value: string | number | undefined) {
  if (!step.value) return
  const text = value == null ? '' : String(value)
  step.value.webhookUrl = text
  if (text) {
    step.value.webhookId = undefined
  }
}

const startStopDisabledIds = computed(() =>
  Object.values(props.capabilities || {})
    .filter((item) => !item.startStopSupported)
    .map((item) => item.taskId),
)

const waitCdcDisabledIds = computed(() =>
  Object.values(props.capabilities || {})
    .filter((item) => !item.cdcMilestoneSupported)
    .map((item) => item.taskId),
)

const delayDisabledIds = computed(() =>
  Object.values(props.capabilities || {})
    .filter((item) => !item.delayMetricSupported)
    .map((item) => item.taskId),
)

const triggerTaskDisabledIds = computed(() => {
  const type = trigger.value?.type
  if (type === 'INCREMENT_DELAY_BREACHED') return delayDisabledIds.value
  return Object.values(props.capabilities || {})
    .filter((item) => !item.triggerSupported)
    .map((item) => item.taskId)
})

const showRetry = computed(() => {
  const type = step.value?.type
  return !!type && !['CONDITION', 'IF_ELSE'].includes(type)
})

const showTriggerJoin = computed(() => {
  const current = trigger.value
  if (!current || !isEventTrigger(current.type)) return false
  return triggerContextIds(current).length > 1
})

const triggerJoin = computed({
  get: () => trigger.value?.join || 'ANY',
  set: (value: 'ALL' | 'ANY') => {
    if (trigger.value) trigger.value.join = value
  },
})

const intervalMinutes = computed({
  get: () => msToUnit(trigger.value?.intervalMs, 'm'),
  set: (v) => {
    if (trigger.value) trigger.value.intervalMs = unitToMs(v, 'm')
  },
})

const thresholdSeconds = computed({
  get: () => msToUnit(trigger.value?.thresholdMs, 's'),
  set: (v) => {
    if (trigger.value) trigger.value.thresholdMs = unitToMs(v, 's')
  },
})

const timeoutMinutes = computed({
  get: () => msToUnit(step.value?.timeoutMs, 'm'),
  set: (v) => {
    if (step.value) step.value.timeoutMs = unitToMs(v, 'm')
  },
})

const retrySeconds = computed({
  get: () => msToUnit(step.value?.retryIntervalMs, 's'),
  set: (v) => {
    if (step.value) step.value.retryIntervalMs = unitToMs(v, 's')
  },
})

const fireAt = computed({
  get: () =>
    trigger.value?.fireAtEpochMs
      ? new Date(trigger.value.fireAtEpochMs)
      : undefined,
  set: (v: Date | undefined) => {
    if (trigger.value) {
      trigger.value.fireAtEpochMs = v ? v.getTime() : undefined
    }
  },
})

const daysOfWeek = computed({
  get: () => trigger.value?.daysOfWeek || [],
  set: (value: number[]) => {
    if (trigger.value) trigger.value.daysOfWeek = value
  },
})

const waitDisabledIds = computed(() => {
  if (step.value?.predicate === 'CDC_ENTERED') return waitCdcDisabledIds.value
  if (step.value?.predicate === 'SNAPSHOT_DONE') {
    return Object.values(props.capabilities || {})
      .filter((item) => !item.snapshotMilestoneSupported)
      .map((item) => item.taskId)
  }
  return []
})

function onTriggerTypeChange() {
  if (!trigger.value) return
  const type = trigger.value.type
  if (type === 'SCHEDULE_DAILY' || type === 'SCHEDULE_WEEKLY') {
    trigger.value.timezone ||= 'Asia/Shanghai'
    trigger.value.hour ??= 2
    trigger.value.minute ??= 0
  }
  if (type === 'SCHEDULE_WEEKLY') {
    trigger.value.daysOfWeek ||= [1]
  }
  if (type === 'MANUAL' || type.startsWith('SCHEDULE_')) {
    trigger.value.taskIds = undefined
    trigger.value.inspectIds = undefined
    trigger.value.join = undefined
  } else if (isEventTrigger(type)) {
    trigger.value.join ||= 'ANY'
  }
}
</script>

<template>
  <div v-if="kind === 'trigger' && trigger" class="flex flex-column gap-4">
    <ElFormItem :label="t('packages_business_workflow_trigger_type')">
      <ElSelect
        v-model="trigger.type"
        :disabled="disabled"
        class="w-100"
        @change="onTriggerTypeChange"
      >
        <ElOption
          v-for="type in TRIGGER_TYPES"
          :key="type"
          :label="t(triggerLabelKey(type))"
          :value="type"
        />
      </ElSelect>
    </ElFormItem>
    <template v-if="trigger.type === 'SCHEDULE_ONCE'">
      <ElFormItem :label="t('packages_business_workflow_fire_at')">
        <ElDatePicker
          v-model="fireAt"
          type="datetime"
          class="w-100"
          :disabled="disabled"
        />
      </ElFormItem>
    </template>
    <template v-if="trigger.type === 'SCHEDULE_INTERVAL'">
      <ElFormItem :label="t('packages_business_workflow_interval_minutes')">
        <ElInputNumber
          v-model="intervalMinutes"
          :min="1"
          :disabled="disabled"
          controls-position="right"
          class="w-100"
        />
      </ElFormItem>
    </template>
    <template
      v-if="
        trigger.type === 'SCHEDULE_DAILY' || trigger.type === 'SCHEDULE_WEEKLY'
      "
    >
      <ElFormItem :label="t('packages_business_workflow_timezone')">
        <ElSelect
          v-model="trigger.timezone"
          filterable
          :disabled="disabled"
          class="w-100"
        >
          <ElOption
            v-for="zone in TIMEZONES"
            :key="zone"
            :label="zone"
            :value="zone"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_clock')">
        <div class="flex gap-2">
          <ElInputNumber
            v-model="trigger.hour"
            :min="0"
            :max="23"
            :disabled="disabled"
            controls-position="right"
          />
          <ElInputNumber
            v-model="trigger.minute"
            :min="0"
            :max="59"
            :disabled="disabled"
            controls-position="right"
          />
        </div>
      </ElFormItem>
    </template>
    <ElFormItem
      v-if="trigger.type === 'SCHEDULE_WEEKLY'"
      :label="t('packages_business_workflow_days_of_week')"
    >
      <ElCheckboxGroup v-model="daysOfWeek" :disabled="disabled">
        <ElCheckbox v-for="day in WEEKDAYS" :key="day" :label="day">
          {{ t(`packages_business_workflow_weekday_${day}`) }}
        </ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
    <ElFormItem
      v-if="
        [
          'TASK_STARTED',
          'TASK_STOPPED',
          'TASK_ERROR',
          'SNAPSHOT_COMPLETED',
          'CDC_ENTERED',
          'INCREMENT_DELAY_BREACHED',
        ].includes(trigger.type)
      "
      :label="t('packages_business_workflow_tasks')"
    >
      <ResourceSelect
        v-model="trigger.taskIds"
        mode="task"
        :disabled="disabled"
        :disabled-ids="triggerTaskDisabledIds"
      />
    </ElFormItem>
    <ElFormItem
      v-if="trigger.type === 'INSPECT_DIFF_BREACHED'"
      :label="t('packages_business_workflow_inspects')"
    >
      <ResourceSelect
        v-model="trigger.inspectIds"
        mode="inspect"
        :disabled="disabled"
      />
    </ElFormItem>
    <ElFormItem
      v-if="showTriggerJoin"
      :label="t('packages_business_workflow_trigger_join')"
    >
      <ElRadioGroup v-model="triggerJoin" :disabled="disabled">
        <ElRadioButton label="ANY">{{
          t('packages_business_workflow_join_any')
        }}</ElRadioButton>
        <ElRadioButton label="ALL">{{
          t('packages_business_workflow_join_all')
        }}</ElRadioButton>
      </ElRadioGroup>
      <div class="fs-7 font-color-sslight mt-1">
        {{ t('packages_business_workflow_trigger_join_tip') }}
      </div>
    </ElFormItem>
    <ElFormItem
      v-if="trigger.type === 'INCREMENT_DELAY_BREACHED'"
      :label="t('packages_business_workflow_threshold_seconds')"
    >
      <ElInputNumber
        v-model="thresholdSeconds"
        :min="1"
        :disabled="disabled"
        controls-position="right"
        class="w-100"
      />
    </ElFormItem>
    <ElFormItem
      v-if="trigger.type === 'INSPECT_DIFF_BREACHED'"
      :label="t('packages_business_workflow_diff_threshold')"
    >
      <ElInputNumber
        v-model="trigger.thresholdCount"
        :min="1"
        :disabled="disabled"
        controls-position="right"
        class="w-100"
      />
    </ElFormItem>
  </div>

  <div v-else-if="kind === 'step' && step" class="flex flex-column gap-4">
    <ElFormItem :label="t('packages_business_workflow_step_type')">
      <ElSelect v-model="step.type" disabled class="w-100">
        <ElOption
          v-for="type in STEP_TYPES"
          :key="type"
          :label="t(stepLabelKey(type))"
          :value="type"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem :label="t('public_name')">
      <ElInput v-model="step.name" :disabled="disabled" />
    </ElFormItem>
    <ElFormItem
      v-if="['TASK_START', 'TASK_STOP', 'WAIT'].includes(step.type)"
      :label="t('packages_business_workflow_tasks')"
    >
      <ResourceSelect
        v-model="step.taskIds"
        mode="task"
        :disabled="disabled"
        :disabled-ids="
          step.type === 'WAIT' ? waitDisabledIds : startStopDisabledIds
        "
      />
    </ElFormItem>
    <template v-if="INSPECT_STEP_TYPES.includes(step.type)">
      <ElAlert
        v-if="step.type === 'INSPECT_DIFF'"
        type="info"
        :closable="false"
        :title="t('packages_business_workflow_inspect_diff_tip')"
        class="mb-1"
      />
      <ElAlert
        v-else-if="step.type === 'INSPECT_REPAIR'"
        type="info"
        :closable="false"
        :title="t('packages_business_workflow_inspect_repair_tip')"
        class="mb-1"
      />
      <ElFormItem :label="t('packages_business_workflow_inspects')">
        <ResourceSelect
          v-model="step.inspectIds"
          mode="inspect"
          :disabled="disabled"
          :inspect-methods="
            step.type === 'INSPECT_DIFF' ? [...INSPECT_DIFF_METHODS] : undefined
          "
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_timeout_minutes')">
        <ElInputNumber
          v-model="timeoutMinutes"
          :min="1"
          :disabled="disabled"
          controls-position="right"
          class="w-100"
        />
      </ElFormItem>
    </template>
    <template v-if="step.type === 'WAIT'">
      <ElFormItem :label="t('packages_business_workflow_predicate')">
        <ElSelect v-model="step.predicate" :disabled="disabled" class="w-100">
          <ElOption
            :label="t('packages_business_workflow_predicate_RUNNING')"
            value="RUNNING"
          />
          <ElOption
            :label="t('packages_business_workflow_predicate_SNAPSHOT_DONE')"
            value="SNAPSHOT_DONE"
          />
          <ElOption
            :label="t('packages_business_workflow_predicate_CDC_ENTERED')"
            value="CDC_ENTERED"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_join')">
        <ElRadioGroup v-model="step.join" :disabled="disabled">
          <ElRadioButton label="ALL">{{
            t('packages_business_workflow_join_all')
          }}</ElRadioButton>
          <ElRadioButton label="ANY">{{
            t('packages_business_workflow_join_any')
          }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_timeout_minutes')">
        <ElInputNumber
          v-model="timeoutMinutes"
          :min="1"
          :disabled="disabled"
          controls-position="right"
          class="w-100"
        />
      </ElFormItem>
    </template>
    <ConditionForm
      v-if="step && (step.type === 'CONDITION' || step.type === 'IF_ELSE')"
      v-model:logic="step.logic"
      v-model:conditions="step.conditions"
      :disabled="disabled"
      :variables="props.variables"
      :spec="props.spec"
      :current-step-id="step.stepId"
    />
    <template v-if="step.type === 'ALARM'">
      <ElAlert
        type="info"
        :closable="false"
        :title="t('packages_business_workflow_alarm_email_hint')"
        class="mb-1"
      />
      <ElFormItem :label="t('packages_business_workflow_alarm_title')">
        <ElInput v-model="step.alarmTitle" :disabled="disabled" />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_alarm_message')">
        <div class="flex gap-2">
          <ElButton
            type="primary"
            plain
            :disabled="disabled"
            @click="alarmTemplateVisible = true"
          >
            {{ t('packages_business_workflow_alarm_edit_template') }}
          </ElButton>
          <ElButton :disabled="disabled" @click="restoreAlarmTemplate">
            {{ t('packages_business_workflow_alarm_restore_template') }}
          </ElButton>
        </div>
      </ElFormItem>
      <AlarmTemplateDialog
        v-model="alarmTemplateVisible"
        :title="step.alarmTitle"
        :content="step.alarmMessage"
        :disabled="disabled"
        @save="saveAlarmTemplate"
      />
    </template>
    <template v-if="step.type === 'WEBHOOK'">
      <ElAlert
        type="info"
        :closable="false"
        :title="t('packages_business_workflow_webhook_hint')"
        class="mb-1"
      />
      <ElAlert
        v-if="step.webhookId && !step.webhookUrl"
        type="warning"
        :closable="false"
        :title="t('packages_business_workflow_webhook_legacy_hint')"
        class="mb-1"
      />
      <ElFormItem :label="t('packages_business_workflow_webhook_url')">
        <ElInput
          :model-value="step.webhookUrl"
          :disabled="disabled"
          placeholder="https://example.com/hook"
          @update:model-value="onWebhookUrlChange"
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_webhook_method')">
        <ElSelect
          v-model="step.webhookMethod"
          :disabled="disabled"
          class="w-100"
        >
          <ElOption
            v-for="method in WEBHOOK_METHODS"
            :key="method"
            :label="method"
            :value="method"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_webhook_token')">
        <ElInput
          v-model="step.webhookToken"
          type="password"
          show-password
          :disabled="disabled"
          :placeholder="t('packages_business_workflow_webhook_token_placeholder')"
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_webhook_body')">
        <div class="flex justify-end mb-1">
          <ElButton
            text
            type="primary"
            :disabled="disabled"
            @click="restoreWebhookBody"
          >
            {{ t('packages_business_workflow_alarm_restore_template') }}
          </ElButton>
        </div>
        <VCodeEditor
          :value="step.webhookBody"
          lang="json"
          height="220"
          :options="{ readOnly: disabled, useWrapMode: true }"
          @init="onWebhookEditorInit"
          @update:value="step.webhookBody = $event"
        />
      </ElFormItem>
      <ElFormItem>
        <template #label>
          <div class="flex flex-column">
            <span>{{ t('packages_business_available_variables') }}</span>
            <span class="fs-8 font-color-light">
              {{ t('packages_business_click_variable_name_insert_template') }}
            </span>
          </div>
        </template>
        <div class="variables flex flex-wrap gap-3">
          <span
            v-for="variable in WEBHOOK_TEMPLATE_VARIABLES"
            :key="variable.name"
            class="variable-chip rounded-xl border px-3 py-2 flex align-center gap-3 hover:bg-light cursor-pointer"
            @mousedown.prevent="insertWebhookVariable(variable.name)"
          >
            <el-icon :size="18">
              <component :is="iconOf(variable.icon)" />
            </el-icon>
            <div class="flex flex-column lh-base">
              <span class="font-color-dark">{{ variableToken(variable.name) }}</span>
              <span class="font-color-light fs-8">{{ t(variable.labelKey) }}</span>
            </div>
          </span>
        </div>
      </ElFormItem>
    </template>
    <template v-if="step.type === 'JAVASCRIPT'">
      <ElAlert
        type="warning"
        :closable="false"
        :title="t('packages_business_workflow_js_retry_tip')"
        class="mb-1"
      />
      <ElFormItem :label="t('packages_business_workflow_script')">
        <VCodeEditor
          :value="step.script"
          lang="javascript"
          height="240"
          :options="{ readOnly: disabled }"
          @update:value="step.script = $event"
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_connections')">
        <ResourceSelect
          v-model="step.connectionIds"
          mode="connection"
          :disabled="disabled"
        />
      </ElFormItem>
    </template>
    <template v-if="showRetry">
      <ElDivider content-position="left">{{
        t('packages_business_workflow_retry_policy')
      }}</ElDivider>
      <ElFormItem :label="t('packages_business_workflow_max_retries')">
        <ElInputNumber
          v-model="step.maxRetries"
          :min="0"
          :disabled="disabled"
          controls-position="right"
          class="w-100"
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_retry_seconds')">
        <ElInputNumber
          v-model="retrySeconds"
          :min="1"
          :disabled="disabled"
          controls-position="right"
          class="w-100"
        />
      </ElFormItem>
      <ElFormItem :label="t('packages_business_workflow_exhausted')">
        <ElRadioGroup v-model="step.exhaustedPolicy" :disabled="disabled">
          <ElRadioButton label="STOP_WORKFLOW">{{
            t('packages_business_workflow_exhausted_stop')
          }}</ElRadioButton>
          <ElRadioButton label="SKIP">{{
            t('packages_business_workflow_exhausted_skip')
          }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
    </template>
  </div>
</template>

<style scoped>
.variable-chip {
  user-select: none;
}
</style>
