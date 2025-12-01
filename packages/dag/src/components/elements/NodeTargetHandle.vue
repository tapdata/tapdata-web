<script setup lang="ts">
import { Handle, Position, useNodeConnections } from '@vue-flow/core'
import { computed } from 'vue'

const connections = useNodeConnections({
  handleType: 'target',
})

const connected = computed(() => connections.value.length > 0)
</script>

<template>
  <Handle
    type="target"
    :position="Position.Left"
    :class="{ 'after:opacity-0': !connected }"
  >
    <div
      class="bg-primary rounded-pill align-center justify-center canvas-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white z-10"
    >
      <el-icon size="10" class="">
        <i-mingcute-add-fill />
      </el-icon>
    </div>
  </Handle>
</template>
