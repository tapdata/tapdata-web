<script setup lang="ts">
import type { DqlEventStatus } from '@tap/api/src/core/dql-event'

defineProps<{ status: DqlEventStatus }>()

const config = {
  PENDING: { label: '待处理', type: 'warning' },
  REPROCESSING: { label: '处理中', type: 'primary' },
  RECOVERED: { label: '已恢复', type: 'success' },
  RECOVERY_FAILED: { label: '恢复失败', type: 'danger' },
  NOT_REPROCESSABLE: { label: '不可重处理', type: 'info' },
} as const
</script>

<template>
  <el-tag
    class="exception-status-tag"
    :type="config[status].type"
    effect="light"
    disable-transitions
  >
    <el-icon
      :class="{ 'is-loading': status === 'REPROCESSING' }"
      class="exception-status-tag__icon"
      :size="14"
    >
      <i-lucide-circle-alert v-if="status === 'PENDING'" />
      <i-lucide-loader-circle v-else-if="status === 'REPROCESSING'" />
      <i-lucide-circle-check v-else-if="status === 'RECOVERED'" />
      <i-lucide-circle-x v-else-if="status === 'RECOVERY_FAILED'" />
      <i-lucide-ban v-else />
    </el-icon>
    <span>{{ config[status].label }}</span>
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
