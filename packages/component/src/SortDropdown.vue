<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'

type SortField = 'name' | 'priority' | 'createdTime'
type SortOrder = 'asc' | 'desc'

interface Props {
  sortField?: SortField
  sortOrder?: SortOrder
  isTask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sortField: 'name',
  sortOrder: 'asc',
  isTask: false,
})

const emit = defineEmits<{
  'update:sortField': [value: SortField]
  'update:sortOrder': [value: SortOrder]
}>()

const { t } = useI18n()

const sortFieldOptions: { value: SortField; labelKey: string }[] = [
  { value: 'name', labelKey: 'packages_component_sort_by_name' },
  { value: 'priority', labelKey: 'packages_component_sort_by_priority' },
  { value: 'createdTime', labelKey: 'packages_component_sort_by_created_time' },
]

if (!props.isTask) {
  sortFieldOptions.splice(1, 1)
}

const sortOrderOptions: { value: SortOrder; labelKey: string }[] = [
  { value: 'asc', labelKey: 'packages_component_sort_order_asc' },
  { value: 'desc', labelKey: 'packages_component_sort_order_desc' },
]

const currentSortIcon = computed(() => {
  // i-lucide-arrow-down-a-z
  return props.sortOrder === 'asc' ? IconLucideArrowDownAZ : IconLucideArrowUpZA
})

const handleSelectField = (field: SortField) => {
  emit('update:sortField', field)
}

const handleSelectOrder = (order: SortOrder) => {
  emit('update:sortOrder', order)
}
</script>

<template>
  <el-popover
    placement="bottom-start"
    :width="160"
    trigger="click"
    popper-class="sort-dropdown-popover p-1"
  >
    <template #reference>
      <el-button text>
        <template #icon>
          <el-icon><component :is="currentSortIcon" /></el-icon>
        </template>
      </el-button>
    </template>

    <div class="sort-dropdown-content">
      <!-- Sort By Section -->
      <div class="sort-section">
        <div class="sort-section-title px-2 py-1.5">
          {{ t('packages_component_sort_by') }}
        </div>
        <div
          v-for="option in sortFieldOptions"
          :key="option.value"
          class="sort-option rounded-lg"
          :class="{ active: sortField === option.value }"
          @click="handleSelectField(option.value)"
        >
          <span class="sort-option-indicator">
            <span v-if="sortField === option.value" class="dot" />
          </span>
          <span>{{ t(option.labelKey) }}</span>
        </div>
      </div>

      <div class="px-1">
        <el-divider class="my-2" />
      </div>

      <!-- Sort Order Section -->
      <div class="sort-section">
        <div class="sort-section-title px-2 py-1.5">
          {{ t('packages_component_sort_order') }}
        </div>
        <div
          v-for="option in sortOrderOptions"
          :key="option.value"
          class="sort-option rounded-lg"
          :class="{ active: sortOrder === option.value }"
          @click="handleSelectOrder(option.value)"
        >
          <span class="sort-option-indicator">
            <span v-if="sortOrder === option.value" class="dot" />
          </span>
          <span>{{ t(option.labelKey) }}</span>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.sort-dropdown-content {
  .sort-section {
    .sort-section-title {
      color: var(--el-text-color-placeholder);
      padding: 0 4px;
    }

    .sort-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--fill-hover);
      }

      &.active {
        color: var(--el-color-primary);
      }

      .sort-option-indicator {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
