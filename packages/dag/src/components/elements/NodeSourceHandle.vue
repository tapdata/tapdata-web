<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <Handle type="source" :position="Position.Right">
    <div
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
      class="bg-primary rounded-pill align-center justify-center canvas-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white"
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
