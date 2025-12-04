<script setup lang="ts">
import {
  BaseEdge,
  EdgeLabelRenderer,
  type Connection,
  type EdgeProps,
} from '@vue-flow/core'
import { computed, ref, watch } from 'vue'
import { useCanvasEdge } from '../../composables/useCanvasEdge'

defineOptions({
  inheritAttrs: false,
})

export type CanvasEdgeProps = EdgeProps & {
  readOnly?: boolean
  hovered?: boolean
  connectedNodeIsHovering?: boolean
  bringToFront?: boolean // Determines if entire edges layer should be brought to front
}

const props = defineProps<CanvasEdgeProps>()

const emit = defineEmits(['update:label:hovered'])

const { path, iconPositions } = useCanvasEdge(props)

const connection = computed<Connection>(() => ({
  source: props.source,
  target: props.target,
  sourceHandle: props.sourceHandleId,
  targetHandle: props.targetHandleId,
}))

const stroke = computed(() => {
  if (props.selected || props.connectedNodeIsHovering)
    return 'var(--color-canvas-link-line-active)'
  return 'var(--color-canvas-link-line-normal)'
})
const renderActions = computed(() => props.selected || delayedHovered.value)

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

function onAdd() {
  emit('add', connection.value)
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
    }"
    :path="path[0]"
    marker-end="url(#marker-arrow)"
  />
  <EdgeLabelRenderer>
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
        v-if="renderActions"
        class="bg-primary rounded-pill flex align-center justify-center w-4 h-4 align-items-center justify-center color-white z-10 hover:scale-150 transition-all cursor-pointer"
        @click="onAdd"
      >
        <el-icon size="10" class="">
          <i-mingcute-add-fill />
        </el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
  <EdgeLabelRenderer>
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
