<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import NodeIcon from '@tap/dag/src/components/NodeIcon.vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'

const { getIncomers, getOutgoers } = useVueFlow()

const props = defineProps<{
  id: string
  data: any
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'expandCollapse', ids: string[]): void
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
  >
    <div class="p-2">
      <template v-if="data.type === 'apiserverLineage'">
        <div class="flex align-center gap-2">
          <div
            class="p-1 bg-gray-100 dark:bg-white/15 rounded-lg flex align-center justify-center table-item-icon mt-0.5"
          >
            <el-icon size="18" class="font-color-sslight"
              ><i-lucide-link-2
            /></el-icon>
          </div>
          <div class="min-w-0">
            <div class="ellipsis">{{ data.module.name }}</div>
            <div
              class="inline-flex align-items-center gap-1 font-mono lh-1 rounded-4 mw-100 zoom-xs"
            >
              <el-icon>
                <i-fluent-folder-link-16-regular />
              </el-icon>
              <span class="ellipsis font-color-light">
                {{ data.module.appName }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex align-items-start gap-2">
          <div
            class="p-1 bg-gray-100 dark:bg-white/15 rounded-lg flex align-center justify-center table-item-icon mt-0.5"
          >
            <el-icon size="18" class="font-color-light"
              ><i-lucide-table
            /></el-icon>
          </div>
          <div class="min-w-0">
            <OverflowTooltip
              :text="data.table"
              append-to="#table-lineage-graph"
            />
            <div
              class="inline-flex align-items-center gap-1 font-mono lh-1 rounded-4 mw-100 zoom-xs"
            >
              <NodeIcon class="flex-shrink-0" :node="data" :size="14" /><span
                class="ellipsis font-color-sslight"
                >{{ data.connectionName }}</span
              >
            </div>
          </div>
        </div>
      </template>
    </div>
    <Handle
      type="target"
      :position="Position.Left"
      :connectable="false"
      class="table-node-handle border-0"
      :class="{ 'pe-none': !active, active: !!incomersCount }"
      @click="handleTargetClick"
    >
      <div
        v-if="active"
        class="bg-primary rounded-pill align-center justify-center table-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white"
      >
        <el-icon v-if="!incomersCount" size="10">
          <i-lucide-minus />
        </el-icon>
        <span v-else>{{ incomersCount }}</span>
      </div>
    </Handle>
    <Handle
      type="source"
      :position="Position.Right"
      :connectable="false"
      class="table-node-handle border-0"
      :class="{ 'pe-none': !active, active: !!outgoersCount }"
      @click="handleSourceClick"
    >
      <div
        v-if="active"
        class="bg-primary rounded-pill align-center justify-center table-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white"
      >
        <el-icon v-if="!outgoersCount" size="10">
          <i-lucide-minus />
        </el-icon>
        <span v-else>{{ outgoersCount }}</span>
      </div>
    </Handle>
  </div>
</template>

<style lang="scss" scoped>
.table-node {
  width: 200px;
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
