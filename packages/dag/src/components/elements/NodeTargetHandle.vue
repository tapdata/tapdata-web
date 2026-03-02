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

const popoverTargetKey = inject('popoverTargetKey', ref<string | null>(null))

const dataflowStore = useDataflowStore()

const connections = useNodeConnections({
  handleType: 'target',
})

const connected = computed(() => connections.value.length > 0)

const isPopoverActive = computed(
  () => popoverTargetKey.value === `${props.node.id}_target`,
)
</script>

<template>
  <Handle
    type="target"
    :position="Position.Left"
    :class="{ 'after:opacity-0': !connected }"
    :is-valid-connection="dataflowStore.isValidConnection"
  >
    <div
      v-if="!connected && !dataflowStore.stateIsReadonly"
      class="bg-primary rounded-pill align-center justify-center canvas-node-handle-icon position-absolute w-100 h-100 left-0 top-0 align-items-center justify-center color-white z-10"
      :class="{ 'force-visible': isPopoverActive }"
      @click.stop="
        $emit(
          'showNodesPopover',
          {
            nextNodeId: node.id,
          },
          $event.target!.closest('.canvas-node-handle-icon'),
          `${node.id}_target`,
        )
      "
    >
      <el-icon size="10" class="">
        <i-mingcute-add-fill />
      </el-icon>
    </div>
  </Handle>
</template>
