<script setup lang="ts">
import { Handle, Position, useNodeConnections } from '@vue-flow/core'
import { computed, inject, ref } from 'vue'
import { useDataflowStore } from '../../stores/dataflow.store'

const props = defineProps<{
  node: any
}>()

defineEmits<{
  showNodesPopover: [data: any, target: HTMLElement]
}>()

const popoverTarget = inject('popoverTarget', ref<HTMLElement | null>(null))
const showPopover = inject('showPopover', ref(false))
const popoverTargetKey = inject('popoverTargetKey', ref<string | null>(null))

const dataflowStore = useDataflowStore()

const connections = useNodeConnections({
  handleType: 'source',
})

const connected = computed(() => connections.value.length > 0)

// 当 popover 显示时，且是当前节点触发的，保持图标可见
const isPopoverActive = computed(
  () => popoverTargetKey.value === `${props.node.id}_source`,
)
</script>

<template>
  <Handle
    type="source"
    :position="Position.Right"
    :class="{
      'after:opacity-0': !connected,
      'popover-active': isPopoverActive,
    }"
    :is-valid-connection="dataflowStore.isValidConnection"
  >
    <div
      v-if="!dataflowStore.stateIsReadonly"
      class="position-absolute handle-tooltip -top-1 left-1/2 rounded-lg border-[0.5px] border-components-panel-border bg-card p-1.5 shadow-lg group-hover/handle:block"
    >
      <div class="fs-8 font-color-sslight lh-4">
        <div class="text-nowrap">
          <span class="fw-sub font-color-dark">点击</span>添加节点
        </div>
        <div><span class="fw-sub font-color-dark">拖拽</span>连接节点</div>
      </div>
    </div>
    <div
      v-if="!dataflowStore.stateIsReadonly"
      class="bg-primary rounded-pill align-center justify-center canvas-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white z-10"
      :class="{ 'force-visible': isPopoverActive }"
      @click.stop="
        $emit(
          'showNodesPopover',
          {
            prevNodeId: node.id,
          },
          $event.target!.closest('.canvas-node-handle-icon'),
          `${node.id}_source`,
        )
      "
    >
      <el-icon size="10" class="">
        <i-mingcute-add-fill />
      </el-icon>
    </div>
  </Handle>
</template>

<style scoped>
.handle-tooltip {
  display: none;
  left: 50%;
  top: -4px;
  transform: translate(-50%, -100%);
}

.vue-flow__handle:hover .handle-tooltip {
  display: block;
}
</style>
