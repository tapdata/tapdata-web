<script setup lang="ts">
import {
  batchUpdateTaskAlarm,
  type AlarmReceiver,
  type AlarmSettingVO,
  type AlarmRuleVO,
  type BatchUpdateTaskAlarmResult,
} from '@tap/api/src/core/alarm'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import AlarmReceiverSelector from '../../components/AlarmReceiverSelector.vue'

type DimensionAction = 'keep' | 'set' | 'clear'
type ReceiverAction = 'keep' | 'edit'
type ReceiverMode = 'APPEND' | 'REPLACE' | 'REMOVE'

type BatchAlarmTask = {
  id: string
  name?: string
  permissionActions?: string[]
}

type ResultDetail = {
  id: string
  name?: string
  code: string
  message?: string
}

type ThresholdItem = {
  key: string
  label: string
  open: boolean
  interval: number
}

const ALARM_SETTING_DEFS = [
  {
    key: 'TASK_STATUS_ERROR',
    label: 'packages_dag_migration_alarmpanel_renwuyunxingchu',
  },
  {
    key: 'TASK_FULL_COMPLETE',
    label: 'packages_dag_migration_alarmpanel_renwuquanliangwan',
  },
  {
    key: 'TASK_INCREMENT_START',
    label: 'packages_dag_migration_alarmpanel_renwuzengliangkai',
  },
  {
    key: 'TASK_INCREMENT_DELAY',
    label: 'packages_dag_migration_alarmpanel_renwuzengliangyan',
  },
  {
    key: 'TASK_INSPECT_DIFFERENCE',
    label: 'packages_dag_task_inspect_difference_alarm',
  },
  {
    key: 'TASK_RETRY_WARN',
    label: 'packages_dag_task_retry_alert',
  },
  {
    key: 'TASK_SOURCE_NO_INCREMENTAL_EVENT',
    label: 'packages_business_task_source_no_incremental_event',
  },
  {
    key: 'TASK_DDL_WARNING',
    label: 'packages_dag_migration_alarmpanel_renwufengxianddl',
  },
  {
    key: 'TASK_DATA_INTEGRITY_RISK',
    label: 'packages_dag_migration_alarmpanel_renwushujuwanzhengxing',
  },
]

const emit = defineEmits<{
  (event: 'success'): void
}>()

const { t } = useI18n()

const visible = ref(false)
const page = ref<'form' | 'result'>('form')
const saveLoading = ref(false)
const taskIds = ref<string[]>([])
const noEditTasks = ref<BatchAlarmTask[]>([])
const rulesAction = ref<DimensionAction>('keep')
const thresholdsAction = ref<DimensionAction>('keep')
const receiversAction = ref<ReceiverAction>('keep')
const receiverMode = ref<ReceiverMode>('APPEND')
const receivers = ref<AlarmReceiver[]>([])
const invalidReceivers = ref(false)
const thresholdItems = ref<ThresholdItem[]>([])
const delayMinutes = ref(5)
const delaySeconds = ref(60)
const delayEqualsFlag = ref(1)
const retryTimes = ref(10)
const onlyFailed = ref(false)
const resultDetails = ref<ResultDetail[]>([])
const resultCountOverride = ref<{
  succeeded: number
  failed: number
  skipped: number
} | null>(null)

const saveDisabled = computed(() => {
  if (!taskIds.value.length || saveLoading.value) return true
  const changingRules = rulesAction.value !== 'keep'
  const changingThresholds = thresholdsAction.value !== 'keep'
  const changingReceivers = receiversAction.value !== 'keep'
  if (!changingRules && !changingThresholds && !changingReceivers) return true
  if (changingReceivers && invalidReceivers.value) return true
  if (
    changingReceivers &&
    !receivers.value.length &&
    receiverMode.value !== 'REPLACE'
  ) {
    return true
  }
  return false
})

const failedDetails = computed(() =>
  resultDetails.value.filter((item) => isFailed(item.code)),
)

const visibleDetails = computed(() =>
  onlyFailed.value ? failedDetails.value : resultDetails.value,
)

const resultCounts = computed(() => {
  if (resultCountOverride.value) return resultCountOverride.value
  return {
    succeeded: resultDetails.value.filter((item) => item.code === 'ok').length,
    skipped: resultDetails.value.filter((item) => isSkipped(item.code)).length,
    failed: failedDetails.value.length,
  }
})

const selectorRef = ref<{ receiverNames?: () => string } | null>(null)

const selectedCount = computed(
  () => taskIds.value.length + noEditTasks.value.length,
)

const overwriteCount = computed(() =>
  receiversAction.value === 'edit' && receiverMode.value === 'REPLACE'
    ? taskIds.value.length
    : 0,
)

const receiverSummary = computed(() => {
  const selected = receivers.value
  const names =
    (selected.length ? selectorRef.value?.receiverNames?.() : '') ||
    t('packages_business_task_batch_alarm_selected_objects')
  const count = taskIds.value.length
  const key =
    receiverMode.value === 'REPLACE'
      ? 'packages_business_task_batch_alarm_summary_replace'
      : receiverMode.value === 'REMOVE'
        ? 'packages_business_task_batch_alarm_summary_remove'
        : 'packages_business_task_batch_alarm_summary_append'
  return t(key, { count, names })
})

function onRulesSwitch(value: boolean | string | number) {
  rulesAction.value = value ? 'set' : 'keep'
}

function onThresholdsSwitch(value: boolean | string | number) {
  thresholdsAction.value = value ? 'set' : 'keep'
}

function onReceiversSwitch(value: boolean | string | number) {
  receiversAction.value = value ? 'edit' : 'keep'
  if (value) receiverMode.value = 'APPEND'
}

function createThresholdItems() {
  return ALARM_SETTING_DEFS.map((item) => ({
    key: item.key,
    label: item.label,
    open: true,
    interval: 300,
  }))
}

function resetForm() {
  page.value = 'form'
  rulesAction.value = 'keep'
  thresholdsAction.value = 'keep'
  receiversAction.value = 'keep'
  receiverMode.value = 'APPEND'
  receivers.value = []
  invalidReceivers.value = false
  thresholdItems.value = createThresholdItems()
  delayMinutes.value = 5
  delaySeconds.value = 60
  delayEqualsFlag.value = 1
  retryTimes.value = 10
  onlyFailed.value = false
  resultDetails.value = []
  resultCountOverride.value = null
}

function open(tasks: BatchAlarmTask[]) {
  const editableTasks = tasks.filter((task) =>
    task.permissionActions?.includes('Edit'),
  )
  taskIds.value = editableTasks.map((task) => task.id)
  noEditTasks.value = tasks.filter(
    (task) => !task.permissionActions?.includes('Edit'),
  )
  resetForm()
  visible.value = true
}

function close() {
  visible.value = false
}

function isSkipped(code: string) {
  return code === 'insufficient.permissions' || code === 'SYSTEM_DEFAULT'
}

function isFailed(code: string) {
  return code !== 'ok' && !isSkipped(code)
}

function resultLabel(code: string) {
  if (code === 'ok') return t('packages_business_task_batch_alarm_result_ok')
  if (isSkipped(code)) {
    return t('packages_business_task_batch_alarm_result_skipped')
  }
  return t('packages_business_task_batch_alarm_result_failed')
}

function cleanReceivers(list: AlarmReceiver[]) {
  return list
    .map((item) => {
      if (item.type === 'EMAIL') {
        const email = item.email?.trim()
        return email ? { type: 'EMAIL' as const, email } : null
      }
      return item.id ? { type: item.type, id: item.id } : null
    })
    .filter((item): item is AlarmReceiver => !!item)
}

function buildAlarmSettings() {
  return thresholdItems.value.map((item) => ({
    type: 'TASK',
    key: item.key,
    open: item.open,
    notify: item.open ? ['SYSTEM', 'EMAIL'] : [],
    interval: Math.max(1, Number(item.interval) || 1),
    unit: 'SECOND',
  })) as AlarmSettingVO[]
}

function buildAlarmRules() {
  const minutes = Math.max(1, Number(delayMinutes.value) || 1)
  const seconds = Math.max(0, Number(delaySeconds.value) || 0)
  // The task alarm form stores "continuous minutes" as point = minutes * 12.
  return [
    {
      key: 'TASK_INCREMENT_DELAY',
      point: Math.max(1, Math.ceil(minutes * 12)),
      equalsFlag: delayEqualsFlag.value,
      ms: seconds * 1000,
    },
    {
      key: 'TASK_RETRY_WARN',
      point: 12,
      equalsFlag: 0,
      ms: 1000,
      times: Math.max(1, Number(retryTimes.value) || 1),
    },
  ] as AlarmRuleVO[]
}

// 规则写入 alarmSettings，阈值写入 alarmRules。不修改的维度不能传空数组。
function buildPayload(ids: string[]) {
  const payload: {
    taskIds: string[]
    alarmSettings?: AlarmSettingVO[] | null
    alarmRules?: AlarmRuleVO[] | null
    alarmReceivers?: AlarmReceiver[] | null
    receiverMode?: ReceiverMode
  } = {
    taskIds: ids,
  }
  if (rulesAction.value === 'clear') payload.alarmSettings = []
  if (rulesAction.value === 'set') payload.alarmSettings = buildAlarmSettings()
  if (thresholdsAction.value === 'clear') payload.alarmRules = []
  if (thresholdsAction.value === 'set') payload.alarmRules = buildAlarmRules()
  if (receiversAction.value === 'edit') {
    payload.alarmReceivers = cleanReceivers(receivers.value)
    payload.receiverMode = receiverMode.value
  }
  return payload
}

function permissionDetails(): ResultDetail[] {
  return noEditTasks.value.map((task) => ({
    id: task.id,
    name: task.name || task.id,
    code: 'insufficient.permissions',
    message: t('packages_business_task_batch_alarm_no_edit_result'),
  }))
}

function countValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function showResult(data?: BatchUpdateTaskAlarmResult) {
  const details = Array.isArray(data?.details) ? data.details : []
  const extras = permissionDetails().filter(
    (task) => !details.some((item) => item.id === task.id),
  )
  resultDetails.value = [...details, ...extras]
  const succeeded = countValue(data?.succeeded)
  const failed = countValue(data?.failed)
  const skipped = countValue(data?.skipped)
  resultCountOverride.value =
    details.length || succeeded == null || failed == null || skipped == null
      ? null
      : {
          succeeded,
          failed,
          skipped: skipped + extras.length,
        }
  page.value = 'result'
}

async function submit(ids: string[]) {
  if (!ids.length) return
  saveLoading.value = true
  try {
    const data = await batchUpdateTaskAlarm(buildPayload(ids))
    showResult(data)
    emit('success')
  } catch (error) {
    console.error(error)
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    saveLoading.value = false
  }
}

async function save() {
  if (saveDisabled.value) return
  await submit(taskIds.value)
}

async function retryFailed() {
  const ids = failedDetails.value.map((item) => item.id)
  if (!ids.length) return
  await submit(ids)
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    :title="
      page === 'result'
        ? $t('packages_business_task_batch_alarm_result_title')
        : $t('packages_business_task_batch_alarm_email_title')
    "
    :model-value="visible"
    :append-to-body="true"
    width="760px"
    class="batch-alarm-email-dialog"
    :close-on-click-modal="false"
    @close="close"
  >
    <div v-if="page === 'form'" class="batch-alarm-dialog-body">
      <div class="batch-alarm-selected">
        {{
          $t('packages_business_task_batch_alarm_selected', {
            count: selectedCount,
          })
        }}
      </div>
      <ElAlert
        v-if="noEditTasks.length"
        class="batch-alarm-email-permission-alert align-items-start"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #icon>
          <el-icon :size="20">
            <i-lucide-triangle-alert />
          </el-icon>
        </template>
        <template #title>
          <span class="fs-7 lh-sm">
            {{
              $t(
                'packages_business_task_batch_alarm_email_no_edit_permission_tip',
                {
                  count: noEditTasks.length,
                },
              )
            }}
          </span>
        </template>
        <div class="batch-alarm-email-no-permission-list">
          <ElTag
            v-for="task in noEditTasks"
            :key="task.id"
            type="warning"
            effect="plain"
            class="batch-alarm-email-no-permission-item wrap-tag rounded-lg"
            :title="task.name || task.id"
          >
            {{ task.name || task.id }}
          </ElTag>
        </div>
      </ElAlert>

      <ElForm label-position="top">
        <ElFormItem class="batch-alarm-card">
          <div class="batch-alarm-card-head">
            <span>{{ $t('packages_business_task_batch_alarm_rules') }}</span>
            <span class="batch-alarm-card-switch">
              {{
                rulesAction === 'keep'
                  ? $t('packages_business_task_batch_alarm_keep')
                  : $t('packages_business_task_batch_alarm_edit')
              }}
              <ElSwitch
                :model-value="rulesAction !== 'keep'"
                @change="onRulesSwitch"
              />
            </span>
          </div>
          <div v-if="rulesAction !== 'keep'" class="batch-alarm-hint">
            {{ $t('packages_business_task_batch_alarm_rules_hint') }}
          </div>
          <div v-if="rulesAction === 'set'" class="batch-alarm-editor">
            <div
              v-for="item in thresholdItems"
              :key="item.key"
              class="batch-alarm-setting-row"
            >
              <ElSwitch v-model="item.open" />
              <span class="batch-alarm-setting-label">{{
                $t(item.label)
              }}</span>
              <ElInputNumber
                v-model="item.interval"
                :min="1"
                :precision="0"
                controls-position="right"
                :disabled="!item.open"
              />
              <span class="batch-alarm-setting-unit">
                {{ $t('packages_business_task_batch_alarm_interval') }}
              </span>
            </div>
            <div class="batch-alarm-email-tip">
              <el-icon :size="16" class="batch-alarm-email-tip-icon">
                <i-lucide-info />
              </el-icon>
              <span>
                {{ $t('packages_business_task_batch_alarm_rules_overwrite') }}
              </span>
            </div>
          </div>
          <div v-else-if="rulesAction === 'clear'" class="color-warning fs-7">
            {{ $t('packages_business_task_batch_alarm_rules_clear') }}
          </div>
          <ElButton
            v-if="rulesAction !== 'keep'"
            text
            type="primary"
            @click="rulesAction = rulesAction === 'clear' ? 'set' : 'clear'"
          >
            {{
              rulesAction === 'clear'
                ? $t('packages_business_task_batch_alarm_set')
                : $t('packages_business_task_batch_alarm_clear')
            }}
          </ElButton>
        </ElFormItem>

        <ElFormItem class="batch-alarm-card">
          <div class="batch-alarm-card-head">
            <span>{{
              $t('packages_business_task_batch_alarm_thresholds')
            }}</span>
            <span class="batch-alarm-card-switch">
              {{
                thresholdsAction === 'keep'
                  ? $t('packages_business_task_batch_alarm_keep')
                  : $t('packages_business_task_batch_alarm_edit')
              }}
              <ElSwitch
                :model-value="thresholdsAction !== 'keep'"
                @change="onThresholdsSwitch"
              />
            </span>
          </div>
          <div v-if="thresholdsAction !== 'keep'" class="batch-alarm-hint">
            {{ $t('packages_business_task_batch_alarm_thresholds_hint') }}
          </div>
          <div v-if="thresholdsAction === 'set'" class="batch-alarm-editor">
            <div class="batch-alarm-threshold-row">
              <span>{{
                $t('packages_dag_migration_alarmpanel_renwuzengliangyan')
              }}</span>
              <span>{{ $t('packages_dag_migration_alarmpanel_lianxu') }}</span>
              <ElInputNumber
                v-model="delayMinutes"
                :min="1"
                :precision="0"
                controls-position="right"
              />
              <span>{{ $t('public_time_m') }}</span>
              <ElSelect v-model="delayEqualsFlag" class="batch-alarm-operator">
                <ElOption label=">=" :value="1" />
                <ElOption label="<=" :value="-1" />
              </ElSelect>
              <ElInputNumber
                v-model="delaySeconds"
                :min="0"
                :precision="0"
                controls-position="right"
              />
              <span>{{ $t('public_time_s') }}</span>
            </div>
            <div class="batch-alarm-threshold-row">
              <span>{{ $t('packages_dag_task_retry_alert') }}</span>
              <ElInputNumber
                v-model="retryTimes"
                :min="1"
                :precision="0"
                controls-position="right"
              />
            </div>
            <div class="batch-alarm-hint">
              {{
                $t('packages_dag_task_retry_alert_desc', { count: retryTimes })
              }}
            </div>
            <div class="batch-alarm-email-tip">
              <el-icon :size="16" class="batch-alarm-email-tip-icon">
                <i-lucide-info />
              </el-icon>
              <span>
                {{
                  $t('packages_business_task_batch_alarm_thresholds_overwrite')
                }}
              </span>
            </div>
          </div>
          <div
            v-else-if="thresholdsAction === 'clear'"
            class="color-warning fs-7"
          >
            {{ $t('packages_business_task_batch_alarm_thresholds_clear') }}
          </div>
          <ElButton
            v-if="thresholdsAction !== 'keep'"
            text
            type="primary"
            @click="
              thresholdsAction = thresholdsAction === 'clear' ? 'set' : 'clear'
            "
          >
            {{
              thresholdsAction === 'clear'
                ? $t('packages_business_task_batch_alarm_set')
                : $t('packages_business_task_batch_alarm_clear')
            }}
          </ElButton>
        </ElFormItem>

        <ElFormItem class="batch-alarm-card">
          <div class="batch-alarm-card-head">
            <span>{{
              $t('packages_business_task_batch_alarm_receivers')
            }}</span>
            <span class="batch-alarm-card-switch">
              {{
                receiversAction === 'keep'
                  ? $t('packages_business_task_batch_alarm_keep')
                  : $t('packages_business_task_batch_alarm_edit')
              }}
              <ElSwitch
                :model-value="receiversAction === 'edit'"
                @change="onReceiversSwitch"
              />
            </span>
          </div>
          <div v-if="receiversAction === 'edit'" class="batch-alarm-editor">
            <div class="mb-2">
              {{ $t('packages_business_task_batch_alarm_mode') }}
            </div>
            <div class="batch-alarm-modes">
              <button
                v-for="mode in ['APPEND', 'REPLACE', 'REMOVE']"
                :key="mode"
                type="button"
                :class="{ 'is-active': receiverMode === mode }"
                @click="receiverMode = mode"
              >
                {{
                  mode === 'APPEND'
                    ? $t(
                        'packages_business_task_batch_alarm_mode_append_recommend',
                      )
                    : $t(
                        `packages_business_task_batch_alarm_mode_${mode.toLowerCase()}`,
                      )
                }}
              </button>
            </div>
            <AlarmReceiverSelector
              ref="selectorRef"
              v-model="receivers"
              class="mt-3"
              :task-ids="taskIds"
              @invalid-change="invalidReceivers = $event"
            />
            <div
              class="batch-alarm-summary"
              :class="{ 'is-replace': receiverMode === 'REPLACE' }"
            >
              {{ receiverSummary }}
            </div>
          </div>
        </ElFormItem>
      </ElForm>
      <div class="batch-alarm-stats">
        <div>
          <span>{{
            $t('packages_business_task_batch_alarm_stat_change')
          }}</span>
          <strong>{{ taskIds.length }}</strong>
        </div>
        <div>
          <span>{{
            $t('packages_business_task_batch_alarm_stat_permission')
          }}</span>
          <strong>{{ noEditTasks.length }}</strong>
        </div>
        <div>
          <span>{{
            $t('packages_business_task_batch_alarm_stat_overwrite')
          }}</span>
          <strong>{{ overwriteCount }}</strong>
        </div>
      </div>
    </div>

    <div v-else class="batch-alarm-dialog-body">
      <div class="batch-alarm-result-summary">
        {{
          $t('packages_business_task_batch_alarm_result_summary', resultCounts)
        }}
      </div>
      <ElCheckbox v-model="onlyFailed" class="mb-3">
        {{ $t('packages_business_task_batch_alarm_only_failed') }}
      </ElCheckbox>
      <ElTable :data="visibleDetails" max-height="360">
        <ElTableColumn
          prop="name"
          min-width="180"
          :label="$t('packages_business_task_batch_alarm_col_task')"
        >
          <template #default="{ row }">
            {{ row.name || row.id }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          min-width="100"
          :label="$t('packages_business_task_batch_alarm_col_result')"
        >
          <template #default="{ row }">
            {{ resultLabel(row.code) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          min-width="220"
          prop="message"
          :label="$t('packages_business_task_batch_alarm_col_message')"
        >
          <template #default="{ row }">
            {{ row.message || row.code }}
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <template #footer>
      <template v-if="page === 'form'">
        <ElButton @click="close">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton
          type="primary"
          :disabled="saveDisabled"
          :loading="saveLoading"
          @click="save"
        >
          {{ $t('packages_business_task_batch_alarm_confirm') }}
        </ElButton>
      </template>
      <template v-else>
        <ElButton @click="page = 'form'">
          {{ $t('packages_business_task_batch_alarm_back') }}
        </ElButton>
        <ElButton
          type="primary"
          :disabled="!failedDetails.length"
          :loading="saveLoading"
          @click="retryFailed"
        >
          {{ $t('packages_business_task_batch_alarm_retry_failed') }}
        </ElButton>
      </template>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
.batch-alarm-dialog-body {
  max-height: 62vh;
  overflow: auto;
  padding-right: 4px;
}

.batch-alarm-selected {
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.batch-alarm-card {
  margin-bottom: 12px;
  padding: 12px 14px 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.batch-alarm-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-bottom: 8px;
  font-weight: 600;
}

.batch-alarm-card-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 400;
}

.batch-alarm-modes {
  display: flex;
  gap: 8px;
}

.batch-alarm-modes button {
  padding: 4px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.batch-alarm-modes button.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.batch-alarm-summary {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fdf6ec;
  color: #b88230;
  font-size: 13px;
  line-height: 1.6;
}

.batch-alarm-summary.is-replace {
  background: #fef0f0;
  color: var(--el-color-danger);
}

.batch-alarm-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.batch-alarm-stats div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.batch-alarm-stats strong {
  color: var(--el-text-color-primary);
  font-size: 20px;
}

.batch-alarm-hint {
  width: 100%;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.batch-alarm-editor {
  width: 100%;
  margin-top: 10px;
}

.batch-alarm-setting-row,
.batch-alarm-threshold-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.batch-alarm-setting-label {
  flex: 1;
  min-width: 160px;
}

.batch-alarm-setting-unit {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.batch-alarm-operator {
  width: 88px;
}

.batch-alarm-result-summary {
  margin-bottom: 12px;
  font-weight: 600;
}

.batch-alarm-email-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.batch-alarm-email-tip-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--el-text-color-placeholder);
}

.batch-alarm-email-permission-alert {
  margin-bottom: 12px;
}

.batch-alarm-email-no-permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.batch-alarm-email-no-permission-item {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wrap-tag {
  height: auto;
  white-space: normal;
  line-height: 1.5;
  padding: 4px 8px;
}

.wrap-tag .el-tag__content {
  white-space: normal;
}
</style>
