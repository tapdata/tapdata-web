<script setup lang="ts">
import type {
  DqlEventStatus,
  DqlEventSummary,
} from '@tap/api/src/core/dql-event'

const props = defineProps<{
  modelValue?: DqlEventStatus
  summary: DqlEventSummary
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value?: DqlEventStatus): void
}>()

const items: Array<{
  key?: DqlEventStatus
  label: string
  summaryKey: keyof DqlEventSummary
}> = [
  { label: '全部', summaryKey: 'total' },
  { key: 'PENDING', label: '待处理', summaryKey: 'pending' },
  { key: 'REPROCESSING', label: '处理中', summaryKey: 'reprocessing' },
  { key: 'RECOVERED', label: '已恢复', summaryKey: 'recovered' },
  { key: 'RECOVERY_FAILED', label: '恢复失败', summaryKey: 'recoveryFailed' },
  {
    key: 'NOT_REPROCESSABLE',
    label: '不可重处理',
    summaryKey: 'notReprocessable',
  },
]
</script>

<template>
  <div class="exception-summary-tabs" role="tablist" aria-label="异常事件状态">
    <button
      v-for="item in items"
      :key="item.key || 'all'"
      class="exception-summary-tab"
      :class="{ 'is-active': props.modelValue === item.key }"
      type="button"
      role="tab"
      :aria-selected="props.modelValue === item.key"
      @click="emit('update:modelValue', item.key)"
    >
      <span>{{ item.label }}</span
      ><strong>{{ props.summary[item.summaryKey] }}</strong>
    </button>
  </div>
</template>

<style scoped lang="scss">
.exception-summary-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.exception-summary-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  padding: 8px 12px;
  color: var(--text-slight);
  background: var(--bg-disable, #f7f8fa);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  strong {
    color: var(--text-dark);
    font-size: 16px;
    font-variant-numeric: tabular-nums;
  }
  &.is-active {
    color: var(--color-primary);
    background: rgba(43, 126, 255, 0.08);
    border-color: rgba(43, 126, 255, 0.2);
    strong {
      color: var(--color-primary);
    }
  }
}
</style>
