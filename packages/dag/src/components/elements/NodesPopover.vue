<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { ref } from 'vue'
import { useFetchConnections } from '../../composables/useFetchConnections'
import ConnectionType from '../ConnectionType.vue'
import NodeIcon from '../NodeIcon.vue'
import type { PopoverInstance } from 'element-plus'

interface Props {
  reference?: HTMLElement | null
}

defineProps<Props>()

const show = defineModel<boolean>()
const popoverRef = ref<PopoverInstance | null>(null)

defineExpose({
  update() {
    popoverRef.value?.popperRef?.popperInstanceRef?.update()
  },
})

const { runFetchConnections, runFetchMoreConnections, connections } =
  useFetchConnections()

runFetchConnections()
</script>

<template>
  <ElPopover
    ref="popoverRef"
    v-model:visible="show"
    placement="right"
    popper-class="p-0 line-popover"
    :virtual-ref="reference"
    :hide-after="0"
    transition="none"
    virtual-triggering
    trigger="click"
    width="auto"
    :show-arrow="false"
  >
    <div class="flex flex-column h-100">
      <el-scrollbar
        :max-height="480"
        class="flex-1 min-h-0"
        @end-reached="runFetchMoreConnections"
      >
        <div class="p-1">
          <div
            v-for="item in connections"
            :key="item.id"
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
          >
            <NodeIcon
              class="flex-shrink-0"
              :size="20"
              :node="item"
              draggable="false"
            />
            <OverflowTooltip
              class="text-truncate"
              placement="right"
              :text="item.name"
              :show-after="400"
            />
            <ConnectionType class="ml-auto" :type="item.connection_type" />
          </div>
        </div>
      </el-scrollbar>
    </div>
  </ElPopover>
</template>
