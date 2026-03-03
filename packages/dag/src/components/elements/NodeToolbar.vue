<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  node: any
}>()

const onDeleteNode = inject<(node: any) => void>('onDeleteNode')
const handlePreview = inject<(node: any) => void>('handlePreview')

const handleDelete = () => {
  onDeleteNode?.(props.node)
}
</script>

<template>
  <div class="position-absolute top-0 end-0 node-toolbar pb-1">
    <div
      class="node-toolbar-actions rounded-lg p-0.5 cursor-pointer"
      style="--btn-space: 1px"
    >
      <el-button text size="xs" @click.stop="handlePreview?.(node.id)">
        <template #icon>
          <i-lucide-play />
        </template>
      </el-button>
      <el-button text size="xs">
        <template #icon>
          <i-lucide-power />
        </template>
      </el-button>
      <el-button text size="xs" @click="handleDelete">
        <template #icon>
          <i-lucide-trash />
        </template>
      </el-button>
    </div>
  </div>
</template>

<style>
.node-toolbar {
  display: none;
  transform: translateY(-100%);
  .node-toolbar-actions {
    background-color: var(--el-bg-color);
  }
}
</style>
