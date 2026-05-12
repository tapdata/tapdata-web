<script setup lang="ts">
import NodeIcon from './NodeIcon.vue'

withDefaults(
  defineProps<{
    node: any
    size?: number
  }>(),
  {
    size: 24,
  },
)
</script>

<template>
  <div class="node-icon">
    <NodeIcon class="node-icon-bg" :node="node" :size="size" />
    <NodeIcon class="node-icon-img" :node="node" :size="size" />
  </div>
</template>

<style lang="scss" scoped>
.node-icon {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &-bg {
    position: absolute;
    inset: 0;
    border-radius: 100%;
    opacity: 1;
    filter: blur(8px);
    pointer-events: none;
    transform: scale(0.8);
  }

  &-img {
    background: rgb(255 255 255 / 25%);
    border-radius: 8px;
    backdrop-filter: blur(8px);
    padding: 4px;
    box-shadow:
      0px 1px 1px 0px rgba(16, 24, 40, 0.06),
      0px 1px 3px 0px rgba(16, 24, 40, 0.01);

    &:where(html.dark *) {
      background: transparent;
    }
  }
}
</style>
