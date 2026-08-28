<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import Draggable from 'vuedraggable'
import {
  PALETTE_GROUPS,
  stepLabelKey,
  WORKFLOW_STEP_DRAG_GROUP,
} from '../constants'
import { createEmptyStep } from '../helpers'
import StepTypeIcon from './StepTypeIcon.vue'
import type {
  WorkflowStepSpec,
  WorkflowStepType,
} from '@tap/api/src/core/workflows'

defineOptions({ name: 'WorkflowStepPalette' })

defineProps<{
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: [type: WorkflowStepType]
}>()

const { t } = useI18n()

const paletteGroups = PALETTE_GROUPS.map((group) => ({
  key: group.key,
  items: group.types.map((type) => ({ type })),
}))

const paletteGroup = {
  name: WORKFLOW_STEP_DRAG_GROUP,
  pull: 'clone' as const,
  put: false,
}

function clonePaletteItem(item: { type: WorkflowStepType }): WorkflowStepSpec {
  return createEmptyStep(item.type)
}

function onAdd(type: WorkflowStepType) {
  emit('add', type)
}
</script>

<template>
  <div class="step-palette">
    <div class="palette-header">
      <div class="fw-sub font-color-dark">
        {{ t('packages_business_workflow_palette') }}
      </div>
      <div class="fs-7 font-color-sslight mt-1">
        {{ t('packages_business_workflow_palette_hint') }}
      </div>
    </div>
    <div
      v-for="group in paletteGroups"
      :key="group.key"
      class="palette-section"
    >
      <div class="palette-group-title">
        {{ t(`packages_business_workflow_palette_group_${group.key}`) }}
      </div>
      <Draggable
        class="palette-list"
        :list="group.items"
        :group="paletteGroup"
        :clone="clonePaletteItem"
        :sort="false"
        :disabled="readonly"
        :animation="180"
        :distance="6"
        item-key="type"
        ghost-class="palette-ghost"
        drag-class="palette-drag"
      >
        <template #item="{ element }">
          <div
            class="palette-item"
            :class="{ 'is-disabled': readonly }"
            :data-step-type="element.type"
            @click="!readonly && onAdd(element.type)"
          >
            <span class="type-icon-well">
              <StepTypeIcon :type="element.type" :size="14" />
            </span>
            <span class="ellipsis">{{ t(stepLabelKey(element.type)) }}</span>
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-palette {
  height: 100%;
}
.palette-header {
  padding: 4px 4px 12px;
}
.palette-section + .palette-section {
  margin-top: 10px;
}
.palette-group-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px 6px;
}
.palette-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  &:hover:not(.is-disabled) {
    background: var(--el-fill-color);
    color: var(--el-color-primary);
  }
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
}
.type-icon-well {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
  flex-shrink: 0;
}
:deep(.palette-ghost) {
  opacity: 0.45;
}
:deep(.palette-drag) {
  cursor: grabbing;
}
</style>
