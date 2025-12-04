<script lang="ts" setup>
import {
  BaseEdge,
  getBezierPath,
  type ConnectionLineProps,
} from '@vue-flow/core'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ConnectionLineProps>()

const curvature = 0.16

const path = computed(() =>
  getBezierPath({
    ...props,
    sourceX: props.sourceX - 8,
    curvature,
  }),
)
console.log('path', path)
</script>

<template>
  <BaseEdge
    :path="path[0]"
    marker-end="url(#marker-arrow)"
    :style="{
      stroke: 'var(--color-canvas-link-line-normal)',
      strokeWidth: 2,
    }"
  />
</template>
