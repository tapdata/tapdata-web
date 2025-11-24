<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <Handle type="target" :position="Position.Left">
    <div
      class="bg-primary rounded-pill align-center justify-center canvas-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white"
    >
      <el-icon size="10" class="">
        <i-mingcute-add-fill />
      </el-icon>
    </div>
  </Handle>
</template>
