<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, type Connection } from '@vue-flow/core'
import { computed, inject, ref, watch } from 'vue'
import {
  useCanvasEdge,
  type CanvasEdgeProps,
} from '../../composables/useCanvasEdge'
import { useDataflowStore } from '../../stores/dataflow.store'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<CanvasEdgeProps>()

const dataflowStore = useDataflowStore()

const emit = defineEmits<{
  'update:label:hovered': [hovered: boolean]
  add: [connection: Connection]
  delete: [connection: Connection]
  showNodesPopover: [data: any, target: HTMLElement, key: string]
}>()

const popoverTargetKey = inject('popoverTargetKey', ref<string | null>(null))

const { path, iconPositions } = useCanvasEdge(props)

const connection = computed<Connection>(() => ({
  source: props.source,
  target: props.target,
  sourceHandle: props.sourceHandleId,
  targetHandle: props.targetHandleId,
}))

const isDisabled = computed(() => {
  const sourceNode = dataflowStore.findNodeById(props.source)
  const targetNode = dataflowStore.findNodeById(props.target)
  return !!(sourceNode?.attrs?.disabled || targetNode?.attrs?.disabled)
})

const stroke = computed(() => {
  if (isDisabled.value) return 'var(--color-canvas-link-line-normal)'
  if (props.selected || props.connectedNodeIsHovering)
    return 'var(--color-canvas-link-line-active)'
  return 'var(--color-canvas-link-line-normal)'
})
const renderActions = computed(
  () => !isDisabled.value && (props.selected || delayedHovered.value),
)
const isPopoverActive = computed(() => popoverTargetKey.value === props.id)

const delayedHovered = ref(props.hovered)
const delayedHoveredSetTimeoutRef = ref<number | null>(null)
const delayedHoveredTimeout = 50

watch(
  () => props.hovered,
  (isHovered) => {
    if (isHovered) {
      if (delayedHoveredSetTimeoutRef.value) {
        clearTimeout(delayedHoveredSetTimeoutRef.value)
      }
      delayedHovered.value = true
    } else {
      delayedHoveredSetTimeoutRef.value = setTimeout(() => {
        delayedHovered.value = false
      }, delayedHoveredTimeout)
    }
  },
)

function onEdgeLabelMouseEnter() {
  emit('update:label:hovered', true)
}

function onEdgeLabelMouseLeave() {
  emit('update:label:hovered', false)
}

function onAdd(event: MouseEvent) {
  emit(
    'showNodesPopover',
    {
      prevNodeId: props.source,
      nextNodeId: props.target,
    },
    event.target!.closest('.canvas-edge-add-icon'),
    props.id,
  )
}

function onDelete() {
  emit('delete', connection.value)
}
</script>

<template>
  <BaseEdge
    :id="id"
    :style="{
      stroke,
      strokeWidth: 2,
      opacity: isDisabled ? 0.8 : 1,
      strokeDasharray: isDisabled ? '6 4' : undefined,
    }"
    :path="path[0]"
    marker-end="url(#marker-arrow)"
  />
  <EdgeLabelRenderer v-if="!dataflowStore.stateIsReadonly">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${iconPositions.add.x}px,${iconPositions.add.y}px)`,
      }"
      class="nodrag nopan"
      @mouseenter="onEdgeLabelMouseEnter"
      @mouseleave="onEdgeLabelMouseLeave"
    >
      <div
        v-if="renderActions || isPopoverActive"
        class="bg-primary rounded-pill flex align-center justify-center w-4 h-4 align-items-center justify-center color-white z-10 hover:scale-150 transition-all cursor-pointer canvas-edge-add-icon"
        @click="onAdd"
      >
        <el-icon size="10" class="">
          <i-mingcute-add-fill />
        </el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
  <EdgeLabelRenderer v-if="!dataflowStore.stateIsReadonly">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${iconPositions.close.x}px,${iconPositions.close.y}px)`,
      }"
      class="nodrag nopan"
      @mouseenter="onEdgeLabelMouseEnter"
      @mouseleave="onEdgeLabelMouseLeave"
    >
      <div
        v-if="renderActions"
        class="bg-primary rounded-pill flex align-center justify-center w-4 h-4 align-items-center justify-center color-white z-10 hover:scale-150 transition-all cursor-pointer"
        @click="onDelete"
      >
        <el-icon size="10" class="">
          <i-mingcute-close-fill />
        </el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
