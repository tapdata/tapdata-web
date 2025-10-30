<script setup lang="ts">
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
            <div class="ellipsis">{{ data.table }}</div>
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
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<style lang="scss" scoped>
.table-node {
  width: 200px;
}
</style>
