<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { onBeforeUnmount, ref, watch } from 'vue'
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

// 处理 mousedown 事件以关闭 popover
const handleMouseDown = (event: MouseEvent) => {
  if (!show.value) return

  const popperElement = popoverRef.value?.popperRef?.contentRef
  const target = event.target as Node

  // 检查点击是否在 popover 外部
  if (popperElement && !popperElement.contains(target)) {
    show.value = false
  }
}

// 监听 show 的变化，添加或移除事件监听器
watch(show, (newValue) => {
  if (newValue) {
    // 使用 mousedown 而不是 click
    document.addEventListener('mousedown', handleMouseDown, true)
  } else {
    document.removeEventListener('mousedown', handleMouseDown, true)
  }
})

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleMouseDown, true)
})
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
