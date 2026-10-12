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
    <ElAlert
      v-if="isBlocked"
      type="warning"
      :closable="false"
      show-icon
      class="mb-2"
    >
      <span>{{ t('packages_business_system_alarm_email_disabled_hint') }}</span>
      <RouterLink
        v-if="hasPermission('v2_alarm_settings_menu')"
        :to="{ name: 'alarmSetting' }"
        target="_blank"
        rel="noopener noreferrer"
        class="ml-2"
      >
        {{ t('packages_business_system_alarm_open_settings') }}
      </RouterLink>
      <span v-else class="ml-2">
        {{ t('packages_business_system_alarm_contact_admin') }}
      </span>
    </ElAlert>
    <ElAlert
      v-if="showRetry"
      type="info"
      :closable="false"
      show-icon
      class="mb-2"
    >
      <span>{{ t('packages_business_system_alarm_status_load_failed') }}</span>
      <ElButton link type="primary" :disabled="retryDisabled" @click="retry">
        {{ t('packages_business_system_alarm_retry') }}
      </ElButton>
    </ElAlert>
  </div>
</template>

<style scoped>
.system-alarm-dependency-notice {
  width: 100%;
}
</style>
