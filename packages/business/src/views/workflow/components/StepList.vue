<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'
import Draggable from 'vuedraggable'
import {
  NESTABLE_STEP_TYPES,
  STEP_TYPES,
  stepLabelKey,
  WORKFLOW_STEP_DRAG_GROUP,
} from '../constants'
import { createEmptyStep } from '../helpers'
import StepTypeIcon from './StepTypeIcon.vue'
import type {
  WorkflowStepSpec,
  WorkflowStepType,
  WorkflowValidationIssue,
} from '@tap/api/src/core/workflows'

defineOptions({ name: 'WorkflowStepList' })

const props = defineProps<{
  nested?: boolean
  readonly?: boolean
  selectedId?: string | null
  issuesByStep?: Record<string, WorkflowValidationIssue[]>
}>()

const steps = defineModel<WorkflowStepSpec[]>('steps', { default: () => [] })
const { t } = useI18n()

const emit = defineEmits<{
  select: [step: WorkflowStepSpec]
}>()

const addableTypes = props.nested ? NESTABLE_STEP_TYPES : STEP_TYPES

const dragGroup = computed(() => ({
  name: WORKFLOW_STEP_DRAG_GROUP,
  put: (_to: unknown, _from: unknown, dragEl?: HTMLElement) => {
    if (!props.nested) return true
    const type =
      dragEl?.dataset?.stepType ||
      dragEl?.closest?.('[data-step-type]')?.getAttribute('data-step-type')
    return type !== 'IF_ELSE'
  },
}))

function insert(index: number, type: WorkflowStepType) {
  const next = [...(steps.value || [])]
  next.splice(index, 0, createEmptyStep(type))
  steps.value = next
  emit('select', next[index]!)
}

function remove(index: number) {
  const next = [...(steps.value || [])]
  next.splice(index, 1)
  steps.value = next
}

function move(index: number, delta: number) {
  const target = index + delta
  const list = [...(steps.value || [])]
  if (target < 0 || target >= list.length) return
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item!)
  steps.value = list
}

function hasIssue(stepId: string) {
  return !!props.issuesByStep?.[stepId]?.length
}

function canMove(evt: { draggedContext?: { element?: { type?: string } } }) {
  if (props.nested && evt.draggedContext?.element?.type === 'IF_ELSE') {
    return false
  }
  return true
}

function onChange(evt: { added?: { element: WorkflowStepSpec } }) {
  if (evt.added?.element) emit('select', evt.added.element)
}
</script>

<template>
  <div class="workflow-step-list">
    <Draggable
      v-model="steps"
      class="step-drop-list"
      :class="{ 'is-empty': !steps?.length }"
      :data-empty-text="t('packages_business_workflow_drop_hint')"
      :group="dragGroup"
      :animation="180"
      :disabled="readonly"
      :distance="6"
      :empty-insert-threshold="48"
      item-key="stepId"
      handle=".step-drag-handle"
      ghost-class="step-ghost"
      drag-class="step-drag"
      :move="canMove"
      @change="onChange"
    >
      <template #item="{ element: step, index }">
        <div class="step-block" :data-step-type="step.type">
          <div
            class="step-card"
            :class="{
              'is-active': selectedId === step.stepId,
              'has-error': hasIssue(step.stepId),
            }"
            @click.stop="emit('select', step)"
          >
            <div class="flex align-items-center justify-content-between gap-2">
              <div class="flex align-items-center gap-2 min-w-0">
                <span v-if="!readonly" class="step-drag-handle" @click.stop>
                  <el-icon :size="14"><i-lucide-grip-vertical /></el-icon>
                </span>
                <span class="type-icon-well">
                  <StepTypeIcon :type="step.type" :size="14" />
                </span>
                <div class="min-w-0">
                  <div class="fw-sub ellipsis">
                    {{ step.name || t(stepLabelKey(step.type)) }}
                  </div>
                  <div class="fs-7 font-color-sslight">
                    {{ t(stepLabelKey(step.type)) }}
                  </div>
                </div>
              </div>
              <div
                v-if="!readonly"
                class="step-actions flex align-items-center"
                @click.stop
              >
                <ElButton text @click="move(index, -1)">
                  <el-icon><i-lucide-chevron-up /></el-icon>
                </ElButton>
                <ElButton text @click="move(index, 1)">
                  <el-icon><i-lucide-chevron-down /></el-icon>
                </ElButton>
                <ElButton text type="danger" @click="remove(index)">
                  <el-icon><i-lucide-trash-2 /></el-icon>
                </ElButton>
              </div>
            </div>
          </div>
          <div v-if="step.type === 'IF_ELSE'" class="if-else-wrap">
            <div class="if-branch">
              <div class="branch-title">
                {{ t('packages_business_workflow_then') }}
              </div>
              <WorkflowStepList
                v-model:steps="step.thenSteps"
                nested
                :readonly="readonly"
                :selected-id="selectedId"
                :issues-by-step="issuesByStep"
                @select="emit('select', $event)"
              />
            </div>
            <div class="if-branch">
              <div class="branch-title">
                {{ t('packages_business_workflow_else') }}
              </div>
              <WorkflowStepList
                v-model:steps="step.elseSteps"
                nested
                :readonly="readonly"
                :selected-id="selectedId"
                :issues-by-step="issuesByStep"
                @select="emit('select', $event)"
              />
            </div>
          </div>
        </div>
      </template>
    </Draggable>
    <ElDropdown
      v-if="!readonly"
      trigger="click"
      @command="(type: WorkflowStepType) => insert(steps?.length || 0, type)"
    >
      <ElButton text circle type="primary" class="insert-btn">
        <el-icon><i-lucide-plus /></el-icon>
      </ElButton>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="type in addableTypes"
            :key="type"
            :command="type"
          >
            {{ t(stepLabelKey(type)) }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<style lang="scss" scoped>
.workflow-step-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.step-drop-list {
  display: flex;
  flex-direction: column;
  min-height: 28px;
  &.is-empty {
    min-height: 88px;
    border: 1px dashed var(--el-border-color);
    border-radius: 12px;
    background: var(--el-bg-color);
    &::before {
      content: attr(data-empty-text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 88px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      pointer-events: none;
    }
  }
}
.step-block {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 20px;
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 2px;
    height: 12px;
    transform: translateX(-50%);
    background: var(--el-border-color);
  }
}
.insert-btn {
  align-self: center;
  margin-top: 4px;
  border: 1px dashed var(--el-color-primary-light-5);
}
.step-card {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    .step-actions {
      opacity: 1;
    }
  }
  &.is-active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
    .step-actions {
      opacity: 1;
    }
  }
  &.has-error {
    border-color: var(--el-color-danger);
  }
}
.step-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.step-drag-handle {
  display: inline-flex;
  color: var(--el-text-color-placeholder);
  cursor: grab;
  &:hover {
    color: var(--el-text-color-secondary);
  }
}
.type-icon-well {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
  flex-shrink: 0;
}
.if-else-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 8px 0 0;
}
.if-branch {
  padding: 10px;
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  background: var(--el-fill-color-blank);
  :deep(.step-drop-list.is-empty) {
    min-height: 56px;
    &::before {
      min-height: 56px;
    }
  }
}
.branch-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
:deep(.step-ghost) {
  opacity: 0.4;
}
:deep(.step-drag) {
  cursor: grabbing;
}
</style>
