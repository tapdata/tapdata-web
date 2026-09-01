<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { dlqEventStatusLabelKeys } from './event-status-presentation'
import type { DlqEventStatus } from '@tap/api/src/core/dlq-event'

const props = defineProps<{ status: DlqEventStatus }>()
const { t } = useI18n()

const config = {
  PENDING: { type: 'warning' },
  REPROCESSING: { type: 'primary' },
  RECOVERED: { type: 'success' },
  RECOVERY_FAILED: { type: 'danger' },
  NOT_REPROCESSABLE: { type: 'info' },
} as const
</script>

<template>
  <el-tag
    class="exception-status-tag"
    :type="config[props.status].type"
    effect="light"
    disable-transitions
  >
    <el-icon
      :class="{ 'is-loading': props.status === 'REPROCESSING' }"
      class="exception-status-tag__icon"
      :size="14"
    >
      <i-lucide-circle-alert v-if="props.status === 'PENDING'" />
      <i-lucide-loader-circle v-else-if="props.status === 'REPROCESSING'" />
      <i-lucide-circle-check v-else-if="props.status === 'RECOVERED'" />
      <i-lucide-circle-x v-else-if="props.status === 'RECOVERY_FAILED'" />
      <i-lucide-ban v-else />
    </el-icon>
    <span>{{ t(dlqEventStatusLabelKeys[props.status]) }}</span>
  </el-tag>
</template>

<style scoped lang="scss">
.exception-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 8px;
  line-height: 1;
  vertical-align: middle;

  &__icon {
    flex: none;
    margin-right: 4px;
  }

  span {
    line-height: 1;
    white-space: nowrap;
  }
}
</style>
