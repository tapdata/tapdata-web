<script>
import BaseNodeIcon from './BaseNodeIcon.vue'
export default {
  name: 'BaseNode',
  components: { BaseNodeIcon },
  props: {
    node: Object,
  },
}
</script>

<template>
  <div class="df-node pb-1">
    <div class="flex flex-1 pt-3 pb-2 px-3 align-center">
      <BaseNodeIcon :node="node" class="mr-2" />
      <slot :text="node.name" name="text">
        <div class="df-node-text">{{ node.name }}</div>
      </slot>
      <slot />
    </div>
    <slot name="extra" />
  </div>
</template>

<style lang="scss">
$width: 242px;
$height: 52px;
$iconSize: 24px;

.layout-content .df-node {
  cursor: move;
}
.min-width-unset {
  min-width: unset;
}
.df-node {
  position: absolute;
  z-index: 5;
  // display: flex;
  // align-items: center;
  width: $width;
  // height: $height;
  // background-color: var(--el-bg-color-overlay);
  background-color: var(--bg-node);
  // border: 1px solid transparent;
  border-radius: 15px;
  box-sizing: border-box;
  user-select: none;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;

  &:hover,
  &.is-hover {
    box-shadow:
      rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(16, 24, 40, 0.03) 0px 4px 6px -2px,
      rgba(16, 24, 40, 0.08) 0px 12px 16px -4px;

    .df-node-icon-bg {
      opacity: 1;
    }
  }
  &-icon {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;

    .icon-wrap {
      border-radius: 50%;
    }

    .v-icon {
      color: #2c65ff;
      font-size: $iconSize;
    }
  }

  &-icon-bg {
    position: absolute;
    inset: 0;
    width: $iconSize;
    height: $iconSize;
    border-radius: 100%;
    opacity: 1;
    filter: blur(8px);
    pointer-events: none;
    transform: scale(0.8);
  }

  &-icon-img {
    width: $iconSize;
    height: $iconSize;
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

  &-text {
    flex: auto;
    width: 0;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-options {
    position: absolute;
    top: 100%;
    display: none;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 32px;
  }

  .node-option {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 6px;
    width: 20px;
    height: 20px;
    background-color: #9bb6ff;
    border-radius: 100%;
    cursor: pointer;
    .v-icon {
      width: 16px;
      height: 16px;
      font-size: 12px;
      background-color: #2c65ff;
      color: #fff;
      border-radius: 100%;
      &__svg {
        width: 1em;
        height: 1em;
      }
    }
  }

  &.node--output {
    .df-node-icon {
      &:before {
        content: '';
        position: absolute;
        width: 22px;
        height: 22px;
        border: 1px solid #008eff;
        border-radius: 50%;
        background: #fff;
      }
      .v-icon {
        width: 14px;
        height: 14px;
        background-color: #008eff;
        color: #fff;
        font-size: 14px;
        border-radius: 100%;
        .v-icon__svg {
          width: 1em;
          height: 1em;
        }
      }
    }
  }

  //&.active,
  //&.selected {
  //  border-color: #2c65ff;
  //}

  &.active,
  &.selected {
    //border-color: #2c65ff;
    box-shadow: 0 0 0 2px rgba(44, 101, 255, 0.3);
    .df-node-icon {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }

  &:hover:not(.node--disabled:not(.node--disabled__main)) {
    .df-node-options {
      display: flex;
    }
  }

  &.node--disabled {
    color: var(--el-text-color-placeholder);
    background-color: #ffffff88;

    .df-node-icon,
    .df-node-text {
      opacity: 0.75;
    }
  }

  /*&.node--disabled:not(.node--disabled__main) {
    pointer-events: none;
  }*/
}

.df-node-wrap.is-locating {
  --canvas-node-locate-stroke: rgba(44, 101, 255, 0.64);
  --canvas-node-locate-ring: rgba(44, 101, 255, 0.2);
  --canvas-node-locate-glow: rgba(44, 101, 255, 0.16);

  position: relative;
  z-index: 9;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 18px;
    pointer-events: none;
  }

  &::before {
    border: 1px solid var(--canvas-node-locate-stroke);
    animation: canvas-node-locate-trace 1.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &::after {
    box-shadow:
      0 0 0 0 var(--canvas-node-locate-ring),
      0 10px 24px var(--canvas-node-locate-glow);
    animation: canvas-node-locate-halo 1.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

html.dark .df-node-wrap.is-locating {
  --canvas-node-locate-stroke: rgba(92, 140, 255, 0.72);
  --canvas-node-locate-ring: rgba(92, 140, 255, 0.28);
  --canvas-node-locate-glow: rgba(92, 140, 255, 0.24);
}

@keyframes canvas-node-locate-trace {
  0% {
    opacity: 0;
    transform: scale(0.985);
  }
  14% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.035);
  }
}

@keyframes canvas-node-locate-halo {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  16% {
    opacity: 1;
  }
  68% {
    opacity: 0.42;
  }
  100% {
    opacity: 0;
    transform: scale(1.055);
    box-shadow:
      0 0 0 14px rgba(44, 101, 255, 0),
      0 10px 24px rgba(44, 101, 255, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .df-node-wrap.is-locating {
    &::before {
      animation: none;
      opacity: 1;
    }

    &::after {
      animation: none;
      box-shadow: 0 0 0 4px var(--canvas-node-locate-ring);
    }
  }
}

.df-menu-list {
  margin: -6px;
  .df-menu-item {
    margin-bottom: 2px;
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      background-color: #eef3ff;
    }
  }
}
</style>
