<script setup lang="ts">
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Position,
} from '@vue-flow/core'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

interface Task {
  name: string
  status: string
}

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  markerEnd?: string
  style?: object
  tasks: Task[]
}>()

const emit = defineEmits<{
  openPopover: [target: HTMLElement, tasks: Task[]]
  clickTask: [task: Task]
}>()

const path = computed(() => getBezierPath(props))

const openTaskPopover = (ev: MouseEvent) => {
  ev.stopPropagation()
  emit(
    'openPopover',
    (ev.target as HTMLElement).closest('.el-tag')!,
    props.tasks.slice(1),
  )
}
</script>

<template>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer v-if="tasks[0]">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <div
        class="table-lineage-connection-label flex align-center overflow-hidden rounded-4"
        :class="`task-status-${tasks[0].status} ${tasks.length > 1 ? 'compact-tag' : ''}`"
      >
        <span
          class="overflow-hidden clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4"
          :title="tasks[0].name"
          @click="$emit('clickTask', tasks[0])"
          >{{ tasks[0].name }}
        </span>
        <span
          v-if="tasks.length > 1"
          class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4 flex-shrink-0"
          @click="openTaskPopover"
        >
          + {{ tasks.length - 1
          }}<el-icon class="ml-0.5" size="14"><i-lucide-chevron-down /></el-icon
        ></span>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
