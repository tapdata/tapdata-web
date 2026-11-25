<script setup lang="ts">
import type { TaskThrottleLiveStatusView } from '@tap/api/src/core/task-throttle'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'
import { resolveThrottleBadgeState } from './utils'

const props = withDefaults(
  defineProps<{
    taskStatus?: string | null
    liveStatus?: TaskThrottleLiveStatusView | null
    compact?: boolean
  }>(),
  {
    taskStatus: '',
    liveStatus: null,
    compact: false,
  },
)

const { t } = useI18n()
const hovered = ref(false)
const focused = ref(false)

const badgeState = computed(() =>
  resolveThrottleBadgeState(props.taskStatus, props.liveStatus),
)

const popoverVisible = computed(() => hovered.value || focused.value)

const phaseLineTexts = computed(() => {
  return badgeState.value.phaseLines.map((line) => {
    const phaseLabel =
      line.phase === 'FULL'
        ? t('packages_business_task_throttle_phase_full')
        : t('packages_business_task_throttle_phase_cdc')
    const rules = line.dimensions
      .map((dim) =>
        dim === 'BYTES'
          ? t('packages_business_task_throttle_rule_bytes')
          : t('packages_business_task_throttle_rule_qps'),
      )
      .join(' / ')
    return t('packages_business_task_throttle_phase_rule_line', {
      phase: phaseLabel,
      rules,
    })
  })
})
</script>

<template>
  <el-popover
    v-if="badgeState.state !== 'none'"
    :visible="popoverVisible"
    placement="top"
    :width="260"
    :show-after="0"
    :hide-after="0"
  >
    <template #reference>
      <span
        tabindex="0"
        role="status"
        class="task-throttle-badge inline-flex align-center cursor-default"
        :class="{ 'is-compact': compact }"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        @focus="focused = true"
        @blur="focused = false"
        @click.stop.prevent
      >
        <el-tag
          v-if="badgeState.state === 'active'"
          size="small"
          type="warning"
          effect="light"
          round
        >
          {{ t('packages_business_task_throttle_badge_active') }}
        </el-tag>
        <el-tag v-else size="small" type="info" effect="plain" round>
          {{ t('packages_business_task_throttle_badge_unknown') }}
        </el-tag>
      </span>
    </template>
    <div
      v-if="badgeState.state === 'active'"
      class="flex flex-column gap-1 fs-8"
    >
      <div v-for="(lineText, idx) in phaseLineTexts" :key="idx">
        {{ lineText }}
      </div>
    </div>
    <div v-else class="fs-8">
      {{ t('packages_business_task_throttle_badge_unknown_tip') }}
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.task-throttle-badge {
  outline: none;
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
    border-radius: 999px;
  }
  &.is-compact :deep(.el-tag) {
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
  }
}
</style>
