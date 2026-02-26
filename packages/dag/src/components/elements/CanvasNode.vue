<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDataflowStore } from '../../stores/dataflow.store'
import BaseNode from '../BaseNode.vue'
import NodeSourceHandle from './NodeSourceHandle.vue'
import NodeTargetHandle from './NodeTargetHandle.vue'
import NodeToolbar from './NodeToolbar.vue'
import type { NodeProps } from '@vue-flow/core'

export type CanvasNodeProps = NodeProps & {
  readOnly?: boolean
}

const { t } = useI18n()

const props = defineProps<CanvasNodeProps>()

const store = useStore()
const dataflowStore = useDataflowStore()

// Vuex state
const canBeConnectedNodeIds = computed(
  () => store.state.dataflow.canBeConnectedNodeIds,
)

// Vuex getters
const isNodeActive = computed(() => store.getters['dataflow/isNodeActive'])
const isNodeSelected = computed(() => store.getters['dataflow/isNodeSelected'])
const hasNodeError = computed(() => store.getters['dataflow/hasNodeError'])
const activeType = computed(() => store.getters['dataflow/activeType'])

// computed
const ins = computed(() => props.data?.__Ctor || {})

const wrapClass = computed(() => {
  if (dataflowStore.selectedNode?.id === props.data.id) return 'border-primary'
  if (canBeConnectedNodeIds.value.includes(props.data.id))
    return 'can-be-connected'
  return ''
})

const nodeClass = computed(() => {
  const list: string[] = []

  if (isNodeActive.value(props.nodeId) && activeType.value === 'node')
    list.push('active')
  if (isNodeSelected.value(props.nodeId)) list.push('selected')
  if (props.data.attrs.disabled) list.push('node--disabled')
  if (props.data.disabled) list.push('node--disabled__main')

  ins.value && list.push(`node--${ins.value.group}`)
  return list
})

const nodeErrorMsg = computed(() => {
  const res = hasNodeError.value(props.data.id)
  if (res) {
    return typeof res === 'string'
      ? res
      : t('packages_dag_components_dfnode_qingjianchajiedian')
  }
  return null
})

const canBeSource = computed(() => {
  return dataflowStore.checkAsSource(props.data)
})

const canBeTarget = computed(() => {
  return dataflowStore.checkAsTarget(props.data)
})
</script>

<template>
  <div
    class="df-node-wrap canvas-node border border-transparent rounded-2xl"
    :class="wrapClass"
    tabindex="1"
  >
    <BaseNode
      :node="props.data"
      :class="nodeClass"
      class="border border-transparent position-relative"
    >
      <template #text="{ text }">
        <OverflowTooltip
          class="df-node-text"
          :text="text"
          popper-class="df-node-text-tooltip"
          placement="top"
          :open-delay="400"
        />
        <!-- <VIcon v-if="ins.beta" class="mr-1" size="32">beta</VIcon> -->
      </template>
      <ElTooltip
        v-if="hasNodeError(props.data.id)"
        :content="nodeErrorMsg ?? undefined"
        placement="top"
      >
        <VIcon class="mr-2" size="14" color="#FF7474">warning</VIcon>
      </ElTooltip>
      <VIcon v-if="props.data.disabled" class="mr-2 color-warning" size="16"
        >disable</VIcon
      >

      <template #extra>
        <NodeSourceHandle
          v-if="canBeSource"
          v-bind="$attrs"
          :node="props.data"
          class="canvas-node-handle z-1"
        />
        <NodeTargetHandle
          v-if="canBeTarget"
          v-bind="$attrs"
          :node="props.data"
          class="canvas-node-handle z-1"
        />
        <NodeToolbar :node="props.data" />
      </template>
    </BaseNode>
    <slot />
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
    transform: none;
    top: 1rem;
    border-radius: 0;
    &.vue-flow__handle-left {
      left: -9px;
    }
    &.vue-flow__handle-right {
      right: -9px;
    }
    &:hover {
      transform: scale(1.25);
    }
    &::after {
      content: '';
      position: absolute;
      width: 0.125rem;
      height: 0.5rem;
      top: 0.25rem;
      background-color: var(--el-color-primary);
    }
    &.vue-flow__handle-left::after {
      left: 0.375rem;
    }
    &.vue-flow__handle-right::after {
      right: 0.375rem;
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

    &.force-visible {
      display: flex !important;
    }
  }

  &:hover :deep(.canvas-node-handle-icon) {
    display: flex;
  }
  &:hover .canvas-node-handle,
  .canvas-node-handle.active,
  .canvas-node-handle.popover-active {
    // width: 1rem;
    // height: 1rem;
    .canvas-node-handle-icon {
      display: flex;
    }
  }

  &:hover :deep(.node-toolbar) {
    display: flex;
  }
}
</style>
