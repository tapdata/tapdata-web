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
    <div class="p-2 px-3">
      <template v-if="data.type === 'apiserverLineage'">
        <div class="mb-1 flex align-center gap-1">
          <el-icon color="var(--icon-n2)">
            <i-lucide-link-2 />
          </el-icon>
          <span class="ellipsis">{{ data.module.name }}</span>
        </div>
        <div
          class="inline-flex align-items-center gap-1 font-mono px-1.5 py-1 lh-1 rounded-4 mw-100"
          style="background-color: var(--bg-code)"
        >
          <el-icon>
            <i-fluent-folder-link-16-regular />
          </el-icon>
          <span class="ellipsis font-color-light">
            {{ data.module.appName }}
          </span>
        </div>
      </template>
      <template v-else>
        <div class="mb-1 flex align-center gap-1">
          <el-icon color="var(--icon-n2)">
            <i-lucide-table />
          </el-icon>
          <span class="ellipsis">{{ data.table }}</span>
        </div>
        <div
          class="inline-flex align-items-center gap-1 font-mono px-1.5 py-1 lh-1 rounded-4 mw-100 zoom-xs"
          style="background-color: var(--bg-code)"
        >
          <NodeIcon class="flex-shrink-0" :node="data" :size="14" /><span
            class="ellipsis font-color-sslight"
            >{{ data.connectionName }}</span
          >
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
