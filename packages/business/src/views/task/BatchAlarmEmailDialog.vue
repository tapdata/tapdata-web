<script setup lang="ts">
import { batchUpdateTaskAlarm } from '@tap/api/src/core/alarm'
import { useI18n } from '@tap/i18n'
import { getSettingByKey } from '@tap/shared/src/settings'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

type EmailOption = {
  label: string
  value: string
}

type BatchAlarmTask = {
  id: string
  name?: string
  permissionActions?: string[]
}

const emit = defineEmits<{
  (event: 'success'): void
}>()

const { t } = useI18n()

const visible = ref(false)
const saveLoading = ref(false)
const taskIds = ref<string[]>([])
const noEditTasks = ref<BatchAlarmTask[]>([])
const emailReceivers = ref<string[]>([])
const emailOptions = ref<EmailOption[]>([])

const saveDisabled = computed(() => !taskIds.value.length)

function loadEmailReceivers() {
  const str = getSettingByKey('email.receivers')
  const receivers = str
    ? str
        .split(',')
        .map((email: string) => email.trim())
        .filter(Boolean)
    : []

  emailOptions.value = receivers.map((receiver: string) => ({
    label: receiver,
    value: receiver,
  }))
  emailReceivers.value = receivers
}

function open(tasks: BatchAlarmTask[]) {
  const editableTasks = tasks.filter((task) =>
    task.permissionActions?.includes('Edit'),
  )

  taskIds.value = editableTasks.map((task) => task.id)
  noEditTasks.value = tasks.filter(
    (task) => !task.permissionActions?.includes('Edit'),
  )
  loadEmailReceivers()
  visible.value = true
}

function close() {
  visible.value = false
}

async function save() {
  if (saveDisabled.value) return

  saveLoading.value = true
  try {
    await batchUpdateTaskAlarm({
      taskIds: taskIds.value,
      emailReceivers: emailReceivers.value,
    })
    ElMessage.success(t('public_message_save_ok'))
    visible.value = false
    emit('success')
  } catch (error) {
    console.error('Failed to batch update task alarm email receivers:', error)
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    saveLoading.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    :title="$t('packages_business_task_batch_alarm_email_title')"
    :model-value="visible"
    :append-to-body="true"
    width="520px"
    class="batch-alarm-email-dialog"
    :close-on-click-modal="false"
    @close="close"
  >
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
      <ElFormItem :label="$t('packages_business_task_batch_alarm_email_label')">
        <ElSelect
          v-model="emailReceivers"
          class="w-100"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="4"
          :placeholder="
            $t('packages_business_task_batch_alarm_email_placeholder')
          "
          :disabled="!emailOptions.length"
        >
          <template #prefix>
            <el-icon :size="16">
              <i-lucide-user />
            </el-icon>
          </template>
          <ElOption
            v-for="item in emailOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
        <div class="batch-alarm-email-tip w-100 rounded-xl">
          <el-icon :size="16" class="batch-alarm-email-tip-icon">
            <i-lucide-info />
          </el-icon>
          <span>
            {{ $t('packages_business_task_batch_alarm_email_overwrite_tip') }}
          </span>
        </div>
        <div v-if="!emailOptions.length" class="color-warning fs-7 mt-2">
          {{ $t('packages_business_task_batch_alarm_email_empty') }}
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="close">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton
        type="primary"
        :disabled="saveDisabled"
        :loading="saveLoading"
        @click="save"
      >
        {{ $t('public_button_save') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
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
