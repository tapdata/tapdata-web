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
      style="--btn-space: 2px"
    >
      <el-tooltip
        effect="light"
        placement="top"
        :show-arrow="false"
        :show-after="300"
        :hide-after="0"
        :enterable="false"
        :offset="4"
        :content="$t('public_button_preview')"
      >
        <el-button text size="xs" @click.stop="handlePreview?.(node.id)">
          <template #icon>
            <i-lucide-play />
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip
        effect="light"
        placement="top"
        :show-arrow="false"
        :show-after="300"
        :hide-after="0"
        :enterable="false"
        :offset="4"
        :content="
          node.disabled
            ? $t('public_button_enable')
            : $t('public_button_disable')
        "
      >
        <el-button text size="xs" @click.stop="handleToggleDisable">
          <template #icon>
            <i-lucide-power-off v-if="node.disabled" />
            <i-lucide-power v-else />
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip
        effect="light"
        placement="top"
        :show-arrow="false"
        :show-after="300"
        :hide-after="0"
        :enterable="false"
        :offset="4"
        :content="$t('public_button_delete')"
      >
        <el-button text type="danger" size="xs" @click="handleDelete">
          <template #icon>
            <i-lucide-trash-2 />
          </template>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<style>
.node-toolbar {
  display: none;
  transform: translateY(-100%);
  .node-toolbar-actions {
    background-color: var(--el-bg-color);
    .el-button {
      font-size: 14px !important;
    }
  }
}
</style>
