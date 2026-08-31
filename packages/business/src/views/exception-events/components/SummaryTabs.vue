<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { dqlEventStatusLabelKeys } from './event-status-presentation'
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
const { t } = useI18n()

const items: Array<{
  key?: DqlEventStatus
  labelKey: string
  summaryKey: keyof DqlEventSummary
}> = [
  {
    labelKey: 'packages_business_exception_events_status_all',
    summaryKey: 'total',
  },
  {
    key: 'PENDING',
    labelKey: dqlEventStatusLabelKeys.PENDING,
    summaryKey: 'pending',
  },
  {
    key: 'REPROCESSING',
    labelKey: dqlEventStatusLabelKeys.REPROCESSING,
    summaryKey: 'reprocessing',
  },
  {
    key: 'RECOVERED',
    labelKey: dqlEventStatusLabelKeys.RECOVERED,
    summaryKey: 'recovered',
  },
  {
    key: 'RECOVERY_FAILED',
    labelKey: dqlEventStatusLabelKeys.RECOVERY_FAILED,
    summaryKey: 'recoveryFailed',
  },
  {
    key: 'NOT_REPROCESSABLE',
    labelKey: dqlEventStatusLabelKeys.NOT_REPROCESSABLE,
    summaryKey: 'notReprocessable',
  },
]
</script>

<template>
  <div
    class="exception-summary-tabs"
    role="tablist"
    :aria-label="t('packages_business_exception_events_status')"
  >
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
      <span>{{ t(item.labelKey) }}</span
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
