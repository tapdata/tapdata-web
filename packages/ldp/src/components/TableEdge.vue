<script setup lang="ts">
import OverflowTooltip from '@tap/component/src/overflow-tooltip/OverflowTooltip.vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Position,
} from '@vue-flow/core'
import { computed, inject } from 'vue'
import TaskStatusDot from './TaskStatusDot.vue'

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

const taskReplicateLagMap = inject<Record<string, string>>(
  'taskReplicateLagMap',
)!

const path = computed(() => getBezierPath(props))

const openTaskPopover = (ev: MouseEvent) => {
  ev.stopPropagation()
  emit(
    'openPopover',
    (ev.target as HTMLElement).closest('.label-dropdown')!,
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
        class="table-lineage-connection-label flex overflow-hidden rounded-lg bg-white dark:bg-overlay border"
      >
        <div
          class="min-w-0 p-1 label-content clickable"
          @click="$emit('clickTask', tasks[0])"
        >
          <div class="flex align-center gap-1">
            <TaskStatusDot :status="tasks[0].status" />
            <OverflowTooltip
              :text="tasks[0].name"
              append-to="#table-lineage-graph"
              class="min-w-0"
            />
            <!-- <span
              class="overflow-hidden clickable ellipsis px-1 rounded-4"
              :title="tasks[0].name"
              >{{ tasks[0].name }}
            </span> -->
          </div>
          <el-tooltip
            v-if="
              tasks[0].status === 'running' &&
              taskReplicateLagMap[tasks[0].id as string]
            "
            :content="$t('public_event_incremental_delay')"
            :hide-after="0"
            :enterable="false"
            append-to="#table-lineage-graph"
          >
            <div
              class="inline-flex align-center gap-1 rounded-4 px-1 py-0.5"
              style="background-color: var(--bg-code)"
            >
              <el-icon class="font-color-sslight" size="12"
                ><i-lucide-clock /></el-icon
              ><span class="font-color-sslight fs-8">{{
                taskReplicateLagMap[tasks[0].id as string]
              }}</span>
            </div>
          </el-tooltip>
        </div>

        <div
          v-if="tasks.length > 1"
          class="flex align-center label-dropdown clickable flex-shrink-0"
          @click="openTaskPopover"
        >
          <span class="px-1 flex-shrink-0 border-start flex align-center">
            + {{ tasks.length - 1
            }}<el-icon class="ml-0.5" size="14"
              ><i-lucide-chevron-down /></el-icon
          ></span>
        </div>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
