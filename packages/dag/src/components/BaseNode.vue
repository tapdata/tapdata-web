<script>
import NodeIcon from './NodeIcon'

export default {
  name: 'BaseNode',
  components: { NodeIcon },
  props: {
    node: Object,
  },
}
</script>

<template>
  <div class="df-node">
    <div class="df-node-icon">
      <NodeIcon class="df-node-icon-bg" :size="24" :node="node" />
      <NodeIcon :size="24" :node="node" />
    </div>
    <slot :text="node.name" name="text">
      <div class="df-node-text">{{ node.name }}</div>
    </slot>
    <slot />
  </div>
</template>

<style lang="scss">
$width: 242px;
$height: 52px;

.layout-content .df-node {
  cursor: move;
}
.min-width-unset {
  min-width: unset;
}
.df-node {
  position: absolute;
  z-index: 5;
  display: flex;
  align-items: center;
  width: $width;
  height: $height;
  padding: 0 12px;
  // background-color: var(--el-bg-color-overlay);
  background-color: #fcfcfd;
  border: 1px solid transparent;
  border-radius: 1rem;
  box-sizing: border-box;
  user-select: none;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;

  &:hover {
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
      font-size: 24px;
    }
  }

  &-icon-bg {
    position: absolute;
    inset: 0;
    border-radius: 100%;
    opacity: 0;
    filter: blur(12px);
    pointer-events: none;
    transform: scale(1);
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
    color: #c9cdd4;
    background-color: #f1f2f4;
    border-color: #c9cdd4;

    .df-node-icon,
    .df-node-text {
      opacity: 0.75;
    }
  }

  /*&.node--disabled:not(.node--disabled__main) {
    pointer-events: none;
  }*/
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
