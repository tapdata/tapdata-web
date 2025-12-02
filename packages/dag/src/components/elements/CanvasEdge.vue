<script setup lang="ts">
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Position,
} from '@vue-flow/core'
import { computed, ref, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

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
  hovered?: boolean
}>()

const emit = defineEmits(['update:label:hovered'])

const curvature = 0.16

const path = computed(() =>
  getBezierPath({
    sourceX: props.sourceX - 8,
    sourceY: props.sourceY,
    targetX: props.targetX + 4,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature,
  }),
)

// 计算贝塞尔曲线的控制点
function getControlPoints(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  curvature: number,
) {
  const distanceX = Math.abs(tx - sx)
  const controlOffset = distanceX * curvature
  return {
    cx1: sx + controlOffset,
    cy1: sy,
    cx2: tx - controlOffset,
    cy2: ty,
  }
}

// 计算贝塞尔曲线上任意位置 t (0-1) 的点和切线角度
function getPointOnBezier(
  t: number,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  curvature: number,
) {
  const { cx1, cy1, cx2, cy2 } = getControlPoints(sx, sy, tx, ty, curvature)

  // 三次贝塞尔曲线公式
  const x =
    (1 - t) ** 3 * sx +
    3 * (1 - t) ** 2 * t * cx1 +
    3 * (1 - t) * t ** 2 * cx2 +
    t ** 3 * tx
  const y =
    (1 - t) ** 3 * sy +
    3 * (1 - t) ** 2 * t * cy1 +
    3 * (1 - t) * t ** 2 * cy2 +
    t ** 3 * ty

  // 计算切线方向（一阶导数）
  const dx =
    3 * (1 - t) ** 2 * (cx1 - sx) +
    6 * (1 - t) * t * (cx2 - cx1) +
    3 * t ** 2 * (tx - cx2)
  const dy =
    3 * (1 - t) ** 2 * (cy1 - sy) +
    6 * (1 - t) * t * (cy2 - cy1) +
    3 * t ** 2 * (ty - cy2)

  // 切线角度（弧度）
  const angle = Math.atan2(dy, dx)

  return { x, y, angle }
}

// 图标尺寸
const iconSize = 16
// 图标间距
const iconGap = 8

// 计算两个图标的位置，它们在曲线中点附近沿切线方向排列
const iconPositions = computed(() => {
  const midPoint = getPointOnBezier(
    0.5,
    props.sourceX - 8,
    props.sourceY,
    props.targetX + 5,
    props.targetY,
    curvature,
  )

  // 沿切线方向的单位向量
  const cos = Math.cos(midPoint.angle)
  const sin = Math.sin(midPoint.angle)

  // 两个图标沿切线方向分布，间距为 iconSize + iconGap
  const offset = (iconSize + iconGap) / 2

  return {
    add: {
      x: midPoint.x - cos * offset,
      y: midPoint.y - sin * offset,
    },
    close: {
      x: midPoint.x + cos * offset,
      y: midPoint.y + sin * offset,
    },
  }
})

const stroke = computed(() => {
  return 'var(--color-canvas-link-line-normal)'
})

const delayedHovered = ref(props.hovered)
const delayedHoveredSetTimeoutRef = ref<NodeJS.Timeout | null>(null)
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
</script>

<template>
  <BaseEdge
    :id="id"
    :style="{
      stroke,
      strokeWidth: 2,
    }"
    :path="path[0]"
    :marker-end="markerEnd"
  />
  <EdgeLabelRenderer>
    <div
      v-show="delayedHovered"
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
        class="bg-primary rounded-pill flex align-center justify-center w-4 h-4 align-items-center justify-center color-white z-10"
      >
        <el-icon size="10" class="">
          <i-mingcute-add-fill />
        </el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
  <EdgeLabelRenderer>
    <div
      v-show="delayedHovered"
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
        class="bg-primary rounded-pill flex align-center justify-center w-4 h-4 align-items-center justify-center color-white z-10"
      >
        <el-icon size="10" class="">
          <i-mingcute-close-fill />
        </el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
