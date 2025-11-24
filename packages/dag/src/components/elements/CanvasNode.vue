<script>
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import i18n from '@tap/i18n'
import { mapGetters, mapMutations, mapState } from 'vuex'
import BaseNode from '../BaseNode.vue'
import NodeSourceHandle from './NodeSourceHandle.vue'
import NodeTargetHandle from './NodeTargetHandle.vue'

export default {
  name: 'DFNode',
  components: {
    OverflowTooltip,
    BaseNode,
    NodeSourceHandle,
    NodeTargetHandle,
  },
  mixins: [deviceSupportHelpers],
  props: {
    data: Object,
    nodeId: {
      type: String,
      required: true,
    },
    jsPlumbIns: Object,
    hideDisableAction: Boolean,
    isSync: Boolean,
  },
  data() {
    return {
      id: this.$attrs.id,
    }
  },
  computed: {
    ...mapState('dataflow', ['canBeConnectedNodeIds']),
    ...mapGetters('dataflow', [
      'nodeById',
      'isActionActive',
      'isNodeActive',
      'isNodeSelected',
      'isMultiSelect',
      'processorNodeTypes',
      'hasNodeError',
      'stateIsReadonly',
      'activeType',
    ]),

    ins() {
      return this.data?.__Ctor || {}
    },

    allowTarget() {
      if (typeof this.ins?.allowTarget === 'boolean') {
        return this.ins.allowTarget
      }
      return true
    },

    wrapClass() {
      if (this.canBeConnectedNodeIds.includes(this.nodeId))
        return 'can-be-connected'
      return ''
    },

    nodeClass() {
      const list = []

      if (this.isNodeActive(this.nodeId) && this.activeType === 'node')
        list.push('active')
      if (this.isNodeSelected(this.nodeId)) list.push('selected')
      if (this.data.attrs.disabled) list.push('node--disabled')
      if (this.data.disabled) list.push('node--disabled__main')

      this.ins && list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      const [left = 0, top = 0] = this.data.attrs?.position || []
      return {
        left: `${left}px`,
        top: `${top}px`,
      }
    },

    nodeErrorMsg() {
      const res = this.hasNodeError(this.data.id)
      if (res) {
        return typeof res === 'string'
          ? res
          : i18n.t('packages_dag_components_dfnode_qingjianchajiedian')
      }
      return null
    },
  },
  mounted() {},
  methods: {
    ...mapMutations('dataflow', [
      'setActiveNode',
      'addActiveAction',
      'removeActiveAction',
      'resetSelectedNodes',
      'setNodeError',
      'clearNodeError',
    ]),
  },
}
</script>

<template>
  <div class="df-node-wrap canvas-node" :class="wrapClass" tabindex="1">
    <BaseNode :node="data" :class="nodeClass" @click="mouseClick">
      <template #text="{ text }">
        <OverflowTooltip
          class="df-node-text"
          :text="text"
          popper-class="df-node-text-tooltip"
          placement="top"
          :open-delay="400"
        />
        <VIcon v-if="ins.beta" class="mr-1" size="32">beta</VIcon>
      </template>
      <div v-if="!stateIsReadonly" class="df-node-options gap-4" @click.stop>
        <div
          v-if="isSync"
          :disabled="data.disabled"
          class="cursor-pointer"
          :class="{
            'opacity-50 cursor-not-allowed': data.disabled,
          }"
          @click.stop="!data.disabled && $emit('preview', nodeId, data)"
        >
          <VIcon size="20">action-play</VIcon>
        </div>

        <div
          :disabled="data.disabled"
          class="cursor-pointer"
          :class="{
            'opacity-50 cursor-not-allowed': data.disabled,
          }"
          :title="$t('packages_dag_components_dfnode_tianjiajiedian')"
          @click.stop="
            !data.disabled &&
            $emit(
              'show-node-popover',
              'node',
              data,
              $event.currentTarget || $event.target,
            )
          "
        >
          <VIcon size="20">action-add</VIcon>
        </div>

        <template v-if="!hideDisableAction">
          <div
            v-if="data.disabled"
            name="action-enable"
            class="cursor-pointer"
            :title="$t('packages_dag_btn_disable_node')"
            @click.stop="$emit('enable', data)"
          >
            <VIcon size="20">action-enable</VIcon>
          </div>
          <div
            v-else
            name="action-disable"
            class="cursor-pointer"
            :title="$t('packages_dag_btn_disable_node')"
            @click.stop="$emit('disable', data)"
          >
            <VIcon size="20">action-disable</VIcon>
          </div>
        </template>

        <div
          :disabled="data.disabled"
          name="action-delete"
          class="cursor-pointer"
          :class="{
            'opacity-50 cursor-not-allowed': data.disabled,
          }"
          :title="$t('packages_dag_components_dfnode_shanchujiedian')"
          @click.stop="!data.disabled && $emit('delete', data.id)"
        >
          <VIcon size="20">action-delete</VIcon>
        </div>
      </div>
      <ElTooltip
        v-if="hasNodeError(data.id)"
        :content="nodeErrorMsg"
        placement="top"
      >
        <VIcon class="mr-2" size="14" color="#FF7474">warning</VIcon>
      </ElTooltip>
      <VIcon v-if="data.disabled" class="mr-2 color-warning" size="16"
        >disable</VIcon
      >
    </BaseNode>
    <slot />
    <NodeSourceHandle class="canvas-node-handle" />
    <NodeTargetHandle class="canvas-node-handle" />
  </div>
</template>

<style lang="scss">
.layout-content .df-node {
  cursor: move;
}
.min-width-unset {
  min-width: unset;
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
.df-node-text {
  font-weight: 500;
  font-size: var(--font-base-title);
}
.df-node-text-tooltip {
  transform: translateY(-6px);
}
.df-node {
  &.jtk-drag {
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }
  }

  .node-anchor {
    display: none;
    width: 16px;
    height: 16px;
    border-color: var(--color-primary);
    position: absolute;
    cursor: crosshair;
    left: 100%;
    transform: translateX(-50%);
    place-content: center;
    place-items: center;

    &:before {
      content: '';
      position: absolute;
      border-width: 1px;
      border-style: solid;
      border-color: inherit;
      border-radius: 50%;
      background: var(--el-bg-color);
      width: 16px;
      height: 16px;
    }

    &.input {
      left: 0;
    }
  }

  &:hover .node-anchor.output {
    display: flex;
  }
}
</style>

<style lang="scss" scoped>
.df-node-wrap {
  z-index: 5;
  outline: none;
  &.can-be-connected {
    .node-anchor.input {
      display: flex;

      &:before {
        content: '';
        position: absolute;
        border-width: 2px;
        border-style: solid;
        border-color: #2c65ff;
        border-radius: 50%;
        background: #c0d1ff;
        width: 14px;
        height: 14px;
      }
    }

    &.dropHover .node-anchor.input {
      &:before {
        width: 16px;
        height: 16px;
        border-color: #2c65ff;
      }
    }

    &.dropHover ~ svg.jtk-connector.jtk-dragging {
      path:nth-child(2) {
        stroke: #2c65ff;
      }
      path:nth-child(3) {
        fill: #2c65ff;
        stroke: #2c65ff;
      }
    }
  }
  .df-node {
    position: static;
  }

  &.options-active {
    .df-node-options {
      display: flex;
    }
  }
}
.canvas-node {
  .canvas-node-handle {
    width: 1rem;
    height: 1rem;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    background-color: transparent;
    pointer-events: all;
    border: none;
    cursor: pointer;
    &.vue-flow__handle-left:hover {
      transform: translate(-50%, -50%) scale(1.25);
    }
    &.vue-flow__handle-right:hover {
      transform: translate(50%, -50%) scale(1.25);
    }
  }

  :deep(.canvas-node-handle-icon) {
    display: none;
    width: 1rem;
    height: 1rem;
    font-size: 10px;
    // transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    // &:hover {
    //   transform: scale(1.25);
    // }
  }

  &:hover :deep(.canvas-node-handle-icon) {
    display: flex;
  }
  &:hover .canvas-node-handle,
  .canvas-node-handle.active {
    // width: 1rem;
    // height: 1rem;
    .canvas-node-handle-icon {
      display: flex;
    }
  }
}
</style>
