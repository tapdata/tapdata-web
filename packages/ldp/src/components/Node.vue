<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import NodeIcon from '@tap/dag/src/components/NodeIcon.vue'
import { Handle, Position } from '@vue-flow/core'
defineProps<{
  id: string
  data: any
}>()
</script>

<template>
  <div class="border rounded-xl bg-white dark:bg-overlay shadow-sm table-node">
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
            <!-- <div class="ellipsis">{{ data.table }}</div> -->
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
      class="table-node-handle w-0 h-0 min-w-0 min-h-0 border-0"
    >
      <div class="bg-primary rounded-full">
        <el-icon class="color-white">
          <i-lucide-minus />
        </el-icon>
      </div>
    </Handle>
    <Handle
      type="source"
      :position="Position.Right"
      :connectable="false"
      class="table-node-handle w-0 h-0 min-w-0 min-h-0 border-0"
    >
      <div
        class="bg-primary rounded-pill flex align-center justify-center p-0.5 translate-middle position-absolute"
      >
        <el-icon size="12" class="color-white">
          <i-lucide-minus />
        </el-icon>
      </div>
    </Handle>
  </div>
</template>

<style lang="scss" scoped>
.table-node {
  width: 200px;

  &-handle {
    opacity: 0;
  }

  &:hover .table-node-handle {
    opacity: 1;
  }
}
</style>
