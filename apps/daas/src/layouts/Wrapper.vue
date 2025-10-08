<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/layouts/Header.vue'

// Reactive state
const IS_IFRAME = ref(Boolean(sessionStorage.getItem('IS_IFRAME') === 'true'))
</script>

<template>
  <el-container direction="vertical" class="layout">
    <div class="layout-bg">
      <div class="layout-bg-main" />
      <div
        class="layout-bg-submain"
        style="
          background-image: url('data:image/svg+xml,%3Csvg viewBox%3D%270 0 200 200%27 xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter id%3D%27noiseFilter%27%3E%3CfeTurbulence type%3D%27fractalNoise%27 baseFrequency%3D%270.65%27 numOctaves%3D%273%27 stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect width%3D%27100%25%27 height%3D%27100%25%27 filter%3D%27url%28%23noiseFilter%29%27%2F%3E%3C%2Fsvg%3E');
        "
      />
      <div class="layout-bg-layer layout-bg-tr" />
      <div class="layout-bg-layer layout-bg-bl" />
    </div>
    <Header v-if="!IS_IFRAME" />
    <ElContainer class="layout-content position-relative">
      <slot name="sidebar" />
      <ElMain class="layout-main">
        <slot name="content" />
      </ElMain>
    </ElContainer>
  </el-container>
</template>

<style lang="scss" scoped>
.layout {
  height: 100%;

  .layout-bg {
    position: fixed;
    inset: 0;
    z-index: -10;

    &-main {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(
        to right bottom,
        var(--layout-gradient-stops)
      );
    }

    &-submain {
      position: absolute;
      inset: 0;
      opacity: 0.03;
    }

    &-layer {
      position: absolute;
      width: 24rem;
      height: 24rem;
      border-radius: 9999px;
      filter: blur(64px);
    }

    &-tr {
      top: -6rem;
      right: -6rem;
      background-image: linear-gradient(
        to right bottom,
        var(--layout-tr-gradient-stops)
      );
    }

    &-bl {
      left: -8rem;
      bottom: -8rem;
      background-image: linear-gradient(
        to right top,
        var(--layout-bl-gradient-stops)
      );
    }
  }

  .layout-content {
    flex-grow: 1;
    min-height: 0;
  }

  .layout-main {
    --el-main-padding: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
    min-width: 0;
    overflow: unset; // 避免box-shadow被截断
  }

  :deep(.layout-side-scrollbar) {
    flex-shrink: 0;
    .el-scrollbar__view {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  :deep(.layout-side) {
    --el-menu-bg-color: transparent;
    --el-menu-item-height: 40px;
    --el-menu-sub-item-height: 40px;
    --el-menu-hover-bg-color: var(--fill-hover);
    // --el-menu-text-color: #d4d4d4;
    --el-menu-text-color: var(--layout-menu-text-color);

    display: flex;
    flex-direction: column;
    padding: 0 16px 82px;

    .el-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .el-menu-item.is-active {
      background-color: var(--primary-hover-light);
    }

    .el-menu-item,
    .el-sub-menu__title {
      border-radius: 8px;
    }

    .el-sub-menu__title + .el-menu {
      margin-top: 8px;
      padding-inline-start: 10px;
    }

    .el-menu-item.is-active,
    .el-menu-item:hover {
      --el-menu-text-color: var(--el-text-color-primary);
    }
  }
}
</style>
