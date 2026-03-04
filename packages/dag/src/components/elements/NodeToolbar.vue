<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  node: any
}>()

const onDeleteNode = inject<(node: any) => void>('onDeleteNode')
const handlePreview = inject<(node: any) => void>('handlePreview')
const handleDisableNode =
  inject<(node: any, value?: boolean) => void>('handleDisableNode')

const handleDelete = () => {
  onDeleteNode?.(props.node)
}

const handleToggleDisable = () => {
  handleDisableNode?.(props.node, !props.node.disabled)
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
      <el-button text size="xs" @click.stop="handleToggleDisable">
        <template #icon>
          <i-lucide-power-off v-if="node.disabled" />
          <i-lucide-power v-else />
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
