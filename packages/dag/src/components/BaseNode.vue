<template functional>
  <div v-bind="data.attrs" v-on="listeners" class="df-node" :class="[data.class, data.staticClass]" :style="data.style">
    <div class="df-node-icon">
      <component :is="$options.components.NodeIcon" :node="props.node" />
      <!--<NodeIcon :node="props.node"></NodeIcon>-->
    </div>
    <slot name="text" v-bind:text="props.node.name">
      <div class="df-node-text">{{ props.node.name }}</div>
    </slot>
    <slot></slot>
  </div>
</template>

<script>
import NodeIcon from './NodeIcon'

export default {
  name: 'BaseNode',
  components: { NodeIcon },
  props: {
    node: Object
  }
}
</script>

<style lang="scss">
$width: 180px;
$height: 40px;

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
  background-color: #fff;
  border: 1px solid #2c65ff;
  border-radius: 10px;
  box-sizing: border-box;
  user-select: none;

  &-icon {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 100%;
    background-color: rgba(44, 101, 255, 0.2);
    border-right-style: solid;
    border-right-width: inherit;
    border-color: inherit;
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
    box-sizing: content-box;

    .icon-wrap {
      border-radius: 50%;
    }

    .v-icon {
      color: #2c65ff;
      font-size: 24px;
    }

    .el-image {
      width: 21px;
      height: 21px;
    }
  }

  &-text {
    margin: 0 10px;
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

  &.node--data,
  &.node--input {
    border-color: #6236ff;
    .df-node-icon {
      background-color: rgba(98, 54, 255, 0.2);
      &:before {
        content: '';
        position: absolute;
        width: 32px;
        height: 32px;
        border: 1px solid #6236ff;
        border-radius: 50%;
        background: #fff;
      }
      .v-icon {
        width: 28px;
        height: 28px;
        background-color: #6236ff;
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

  &.node--output {
    border-color: #008eff;
    .df-node-icon {
      background-color: rgba(0, 155, 255, 0.2);
      &:before {
        content: '';
        position: absolute;
        width: 32px;
        height: 32px;
        border: 1px solid #008eff;
        border-radius: 50%;
        background: #fff;
      }
      .v-icon {
        width: 28px;
        height: 28px;
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

  &:hover {
    .df-node-options {
      display: flex;
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
