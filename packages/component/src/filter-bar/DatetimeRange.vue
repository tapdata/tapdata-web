<script setup lang="tsx">
import { CloseIcon } from '../CloseIcon'

const props = withDefaults(
  defineProps<{
    label: string
    width?: string
  }>(),
  {
    width: '380px',
  },
)

const model = defineModel<string[]>({
  required: true,
})

const prefixIcon = () => {
  return props.label ? (
    <span class="filter-item-datetime-range__label">{props.label}</span>
  ) : null
}

const clearIcon = () => {
  return (
    <span class="filter-item-datetime-range__clear-icon">
      <el-icon>
        <i-lucide-calendar-days class="filter-item-datetime-range__clear-icon__calendar" />
        <CloseIcon class="filter-item-datetime-range__clear-icon__close" />
      </el-icon>
    </span>
  )
}
</script>

<template>
  <el-date-picker
    v-model="model"
    class="filter-item-datetime-range"
    type="datetimerange"
    value-format="x"
    :prefix-icon="prefixIcon"
    :clear-icon="clearIcon"
    :style="{ width: props.width }"
  />
</template>

<style lang="scss">
.filter-item-datetime-range {
  &__label {
    margin-right: 6px;
    white-space: nowrap;
    color: var(--el-text-color-caption);
  }

  .el-range__icon {
    width: auto;
  }

  .el-range-input {
    text-align: left;
    flex: 1;
  }

  .el-range-separator {
    flex: unset;
    padding: 0 16px;
  }

  .el-range__close-icon {
    visibility: visible !important;
    margin-left: 6px;
    opacity: 1 !important;

    &.el-range__close-icon--hidden {
      .filter-item-datetime-range__clear-icon__close {
        display: none;
      }
    }

    &:not(.el-range__close-icon--hidden) {
      .filter-item-datetime-range__clear-icon__calendar {
        display: none;
      }
    }
  }
}
</style>
