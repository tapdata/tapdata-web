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
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  padding: 0 2px;
  border-bottom: 1px solid #eaecf0;
}
.exception-summary-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  height: 38px;
  padding: 0 12px;
  color: #667085;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 6px 6px 0 0;
  cursor: pointer;

  &:hover {
    color: #344054;
    background: #f8fafc;
  }

  strong {
    display: inline-grid;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    color: #667085;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    line-height: 20px;
    background: #f2f4f7;
    border-radius: 999px;
    place-items: center;
  }

  &.is-active {
    color: #344054;
    border-bottom-color: var(--color-primary);

    strong {
      color: var(--color-primary);
      background: var(--el-color-primary-light-9);
    }
  }
}
</style>
