<script setup lang="ts">
import { Notify } from '@tap/api/src/core/alarm'
import { useI18n } from '@tap/i18n'
import { computed, inject } from 'vue'
import { systemAlarmStatusKey } from '../composables/useSystemAlarmStatus'

const props = withDefaults(
  defineProps<{
    alarmKey: string
    taskOpen?: boolean
    taskNotify?: string[]
    showRetry?: boolean
  }>(),
  {
    taskOpen: false,
    taskNotify: () => [],
    showRetry: false,
  },
)

const { t } = useI18n()
const context = inject(systemAlarmStatusKey)
const hasPermission = inject<(code: string) => boolean>(
  'hasPermissionByCode',
  () => false,
)

const isBlocked = computed(() => {
  const result = context?.status.value
  if (
    result?.supported !== true ||
    !props.taskOpen ||
    !Array.isArray(props.taskNotify) ||
    !props.taskNotify.includes(Notify.Email)
  ) {
    return false
  }

  const setting = result.items?.find((item) => item.key === props.alarmKey)
  return !setting?.open || !setting.channels?.includes(Notify.Email)
})

const showRetry = computed(() => props.showRetry && !!context?.error.value)
const retryDisabled = computed(() => !!context?.loading.value)

function retry() {
  context?.retry()
}
</script>

<template>
  <div class="system-alarm-dependency-notice" aria-live="polite">
    <div
      v-if="isBlocked"
      class="system-alarm-dependency-notice__alert is-warning"
      role="alert"
    >
      <el-icon
        :size="16"
        class="system-alarm-dependency-notice__icon"
        aria-hidden="true"
      >
        <i-lucide-circle-alert />
      </el-icon>
      <div class="system-alarm-dependency-notice__content">
        <span>{{
          t('packages_business_system_alarm_email_disabled_hint')
        }}</span>
        <RouterLink
          v-if="hasPermission('v2_alarm_settings_menu')"
          :to="{ name: 'alarmSetting' }"
          target="_blank"
          rel="noopener noreferrer"
          class="system-alarm-dependency-notice__link"
        >
          {{ t('packages_business_system_alarm_open_settings') }}
        </RouterLink>
        <span v-else class="system-alarm-dependency-notice__detail">
          {{ t('packages_business_system_alarm_contact_admin') }}
        </span>
      </div>
    </div>
    <div
      v-if="showRetry"
      class="system-alarm-dependency-notice__alert is-info"
      role="status"
    >
      <el-icon
        :size="16"
        class="system-alarm-dependency-notice__icon"
        aria-hidden="true"
      >
        <i-lucide-info />
      </el-icon>
      <div class="system-alarm-dependency-notice__content">
        <span>{{
          t('packages_business_system_alarm_status_load_failed')
        }}</span>
        <button
          type="button"
          class="system-alarm-dependency-notice__link"
          :disabled="retryDisabled"
          @click="retry"
        >
          {{ t('packages_business_system_alarm_retry') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-alarm-dependency-notice {
  width: 100%;
  color: var(--el-text-color-primary);
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 20px;
}

.system-alarm-dependency-notice__alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--el-border-radius-large);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.system-alarm-dependency-notice__alert
  + .system-alarm-dependency-notice__alert {
  margin-top: 8px;
}

.system-alarm-dependency-notice__alert:first-child {
  margin-top: 8px;
}

.system-alarm-dependency-notice__alert.is-warning {
  background-color: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-8);
}

.system-alarm-dependency-notice__alert.is-info {
  background-color: var(--el-color-info-light-9);
  border-color: var(--el-color-info-light-8);
}

.system-alarm-dependency-notice__icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--el-color-warning);
}

.is-info .system-alarm-dependency-notice__icon {
  color: var(--el-color-info);
}

.system-alarm-dependency-notice__content {
  min-width: 0;
  flex: 1;
  font-size: 14px;
  line-height: 20px;
}

.system-alarm-dependency-notice__link {
  display: inline;
  margin-left: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  font: inherit;
  font-weight: 500;
  line-height: inherit;
  text-decoration: none;
  cursor: pointer;
}

.system-alarm-dependency-notice__link:hover {
  text-decoration: underline;
}

.system-alarm-dependency-notice__link:visited {
  color: var(--el-color-primary);
}

.system-alarm-dependency-notice__link:focus-visible {
  border-radius: 2px;
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.system-alarm-dependency-notice__link:disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.system-alarm-dependency-notice__detail {
  margin-left: 6px;
  font-weight: 500;
}
</style>
