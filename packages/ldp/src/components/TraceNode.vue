<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import NodeIcon from '@tap/dag/src/components/NodeIcon.vue'
import { useI18n } from '@tap/i18n'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'

const { t } = useI18n()
const { getIncomers, getOutgoers } = useVueFlow()

const props = defineProps<{
  id: string
  data: any
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'expandCollapse', ids: string[]): void
  (e: 'select', id: string): void
}>()

const outgoersCount = ref<number | null>(null)
const incomersCount = ref<number | null>(null)

// 递归获取所有下游节点
function getAllOutgoers(nodeId: string, visited = new Set<string>()): string[] {
  if (visited.has(nodeId)) return []
  visited.add(nodeId)

  const directOutgoers = getOutgoers(nodeId)
  const allIds: string[] = []

  directOutgoers.forEach((outgoer) => {
    if (!visited.has(outgoer.id)) {
      allIds.push(outgoer.id)
      const childIds = getAllOutgoers(outgoer.id, visited)
      allIds.push(...childIds)
    }
  })

  return allIds
}

// 递归获取所有上游节点
function getAllIncomers(nodeId: string, visited = new Set<string>()): string[] {
  if (visited.has(nodeId)) return []
  visited.add(nodeId)

  const directIncomers = getIncomers(nodeId)
  const allIds: string[] = []

  directIncomers.forEach((incomer) => {
    if (!visited.has(incomer.id)) {
      allIds.push(incomer.id)
      const parentIds = getAllIncomers(incomer.id, visited)
      allIds.push(...parentIds)
    }
  })

  return allIds
}

function handleSourceClick() {
  if (!props.active) return
  const outgoers = getAllOutgoers(props.id)

  outgoersCount.value = outgoersCount.value === null ? outgoers.length : null

  emit('expandCollapse', outgoers)
}

function handleTargetClick() {
  if (!props.active) return
  const incomers = getAllIncomers(props.id)

  incomersCount.value = incomersCount.value === null ? incomers.length : null

  emit('expandCollapse', incomers)
}
</script>

<template>
  <div
    class="border rounded-2xl bg-white dark:bg-overlay shadow-sm table-node"
    :class="{ active }"
    @click="emit('select', id)"
  >
    <!-- Pulse Status Indicator (top-right corner) -->
    <span
      v-if="data.status === 'loading'"
      class="status-spinner"
      :title="t('packages_ldp_trace_status_loading')"
    />
    <span
      v-else-if="data.status === 'ok'"
      class="status-dot status-dot--ok"
      :title="t('packages_ldp_trace_status_ok')"
    />
    <span
      v-else-if="data.status === 'error'"
      class="status-dot status-dot--error"
      :title="t('packages_ldp_trace_status_error')"
    />

    <div class="p-2 px-3">
      <div class="flex align-items-center gap-1 overflow-hidden">
        <template v-if="data.nodeType === 'MERGE'">
          <el-tag
            v-if="data.tableType === 'mainTable'"
            type="warning"
            size="small"
            class="zoom-xs"
            >{{ t('packages_ldp_trace_main_table') }}</el-tag
          ><el-tag
            v-else-if="data.tableType === 'subTable'"
            type="primary"
            size="small"
            class="zoom-xs"
            >{{ t('packages_ldp_trace_sub_table') }}</el-tag
          >
        </template>

        <OverflowTooltip
          :text="data.table"
          class="min-w-0"
          :enterable="false"
        />
      </div>

      <div
        class="inline-flex align-items-center gap-1 font-mono lh-1 rounded-4 mw-100 zoom-xs"
      >
        <NodeIcon class="flex-shrink-0" :node="data" :size="14" /><span
          class="ellipsis font-color-sslight"
          >{{ data.connectionName }}</span
        >
      </div>
    </div>
    <Handle
      type="target"
      :position="Position.Left"
      :connectable="false"
      class="table-node-handle border-0"
      :class="{ 'pe-none': !active, active: !!incomersCount }"
      @click="handleTargetClick"
    />
    <Handle
      type="source"
      :position="Position.Right"
      :connectable="false"
      class="table-node-handle border-0"
      :class="{ 'pe-none': !active, active: !!outgoersCount }"
      @click="handleSourceClick"
    />

    <!-- Joins Badge -->
    <el-popover
      v-if="data.joinKeys?.length"
      placement="top"
      trigger="hover"
      :show-arrow="false"
      :offset="4"
      width="auto"
      popper-class="join-popover"
    >
      <template #reference>
        <div class="join-badge">
          <el-icon :size="12" class="text-zinc-400"
            ><i-lucide-link-2
          /></el-icon>
          <span>{{ t('packages_ldp_trace_join', [data.joinKeys.length]) }}</span
          >
        </div>
      </template>
      <div class="join-popover__body">
        <div
          v-for="(jk, i) in data.joinKeys"
          :key="i"
          class="join-popover__row"
        >
          {{ jk.originName }} <span class="join-popover__eq">=</span>
          {{ jk.targetName }}
        </div>
      </div>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 10;

  &--ok {
    background-color: var(--el-color-success);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-color: var(--el-color-success);
      animation: status-processing 1.2s ease-in-out infinite;
    }
  }

  &--error {
    background-color: var(--el-color-danger);
  }
}

@keyframes status-processing {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.status-spinner {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--el-color-primary-light-7);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  z-index: 10;
  animation: status-spin 0.7s linear infinite;
}

@keyframes status-spin {
  to {
    transform: rotate(360deg);
  }
}

.join-badge {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(228, 228, 231, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 10px;
  font-weight: 600;
  color: #71717a;
  cursor: help;
  white-space: nowrap;
  line-height: 1.4;
}

.table-node {
  position: relative;
  width: 200px;
  cursor: pointer;

  &.active {
    border-color: var(--el-color-primary) !important;
    outline: 3px solid var(--el-color-primary-light-8);
    outline-offset: 1px;
  }

  &-handle {
    width: 0;
    height: 0;
    min-width: 0;
    min-height: 0;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    background-color: transparent;
    pointer-events: all;
    cursor: pointer;
  }

  &-handle-icon {
    opacity: 0;
    display: flex;
    font-size: 10px;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    &:hover {
      transform: scale(1.25);
    }
  }

  &:hover .table-node-handle,
  .table-node-handle.active {
    width: 1rem;
    height: 1rem;
    .table-node-handle-icon {
      opacity: 1;
    }
  }
}
</style>

<style lang="scss">
.join-popover.el-popover {
  min-width: auto !important;
  padding: 6px 8px !important;
  background: #18181b !important;
  border: none !important;
  border-radius: 6px !important;
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))
    drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
}

.join-popover__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.join-popover__row {
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  color: #fafafa;
  white-space: nowrap;
  letter-spacing: -0.02em;
  line-height: 1.5;
}

.join-popover__eq {
  color: #a1a1aa;
  margin: 0 3px;
}
</style>
