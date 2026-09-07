<script lang="ts" setup>
import {
  FixedSizeList,
  formItemContextKey,
  useLocale,
  useNamespace,
} from 'element-plus'
import {
  ROOT_TREE_INJECTION_KEY,
  treeEmits,
  TreeOptionsEnum,
  treeProps,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import { definePropType, mutable } from 'element-plus/es/utils/index.mjs'
import { computed, getCurrentInstance, provide, ref, useSlots } from 'vue'
import { useDragNodeHandler } from './composables/useDragNode'
import { useTree } from './composables/useTree'
import VirtualTreeNode from './VirtualTreeNode.vue'
import type { TreeOptionProps } from './types'
import 'element-plus/es/components/virtual-list/style/css'

defineOptions({
  name: 'VirtualTree',
})

const props = defineProps({
  ...treeProps,
  renderContent: Function,
  props: {
    type: definePropType<TreeOptionProps>(Object),
    default: () =>
      mutable({
        children: TreeOptionsEnum.CHILDREN,
        label: TreeOptionsEnum.LABEL,
        value: TreeOptionsEnum.KEY,
        disabled: TreeOptionsEnum.DISABLED,
        class: TreeOptionsEnum.CLASS,
      }),
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  allowDrag: Function,
  allowDrop: Function,
})

const emit = defineEmits({
  ...treeEmits,
  'node-drag-start': (node: any, event: DragEvent) => Boolean(node && event),
  'node-drag-enter': (draggingNode: any, dropNode: any, event: DragEvent) =>
    Boolean(draggingNode && dropNode && event),
  'node-drag-leave': (draggingNode: any, dropNode: any, event: DragEvent) =>
    Boolean(draggingNode && dropNode && event),
  'node-drag-over': (draggingNode: any, dropNode: any, event: DragEvent) =>
    Boolean(draggingNode && dropNode && event),
  'node-drag-end': (
    draggingNode: any,
    _dropNode: any,
    _dropType: any,
    event: DragEvent,
  ) => Boolean(draggingNode && event),
  'node-drop': (
    draggingNode: any,
    _dropNode: any,
    _dropType: any,
    event: DragEvent,
  ) => Boolean(draggingNode && _dropNode && _dropType && event),
})
const slots = useSlots()
const treeNodeSize = computed(() => props.itemSize)
const el$ = ref<HTMLElement | null>(null)
const dropIndicator$ = ref<HTMLElement | null>(null)

provide(ROOT_TREE_INJECTION_KEY, {
  ctx: {
    emit: emit as any,
    slots,
  },
  props,
  instance: getCurrentInstance()!,
})
provide(formItemContextKey, undefined)

const { t } = useLocale()
const ns = useNamespace('tree')
const {
  flattenTree,
  isNotEmpty,
  listRef,
  toggleExpand,
  isIndeterminate,
  isChecked,
  isDisabled,
  isCurrent,
  isForceHiddenExpandIcon,
  handleNodeClick,
  handleNodeDrop,
  handleNodeCheck,
  toggleCheckbox,
  getCurrentNode,
  getCurrentKey,
  setCurrentKey,
  getCheckedKeys,
  getCheckedNodes,
  getHalfCheckedKeys,
  getHalfCheckedNodes,
  setChecked,
  setCheckedKeys,
  filter,
  setData,
  getNode,
  expandNode,
  collapseNode,
  setExpandedKeys,
  scrollToNode,
  scrollTo,
} = useTree(props, emit as any)

defineExpose({
  toggleCheckbox,
  getCurrentNode,
  getCurrentKey,
  setCurrentKey,
  getCheckedKeys,
  getCheckedNodes,
  getHalfCheckedKeys,
  getHalfCheckedNodes,
  setChecked,
  setCheckedKeys,
  filter,
  setData,
  getNode,
  expandNode,
  collapseNode,
  setExpandedKeys,
  scrollToNode,
  scrollTo,
})

const { dragState } = useDragNodeHandler({
  props,
  ctx: {
    emit: emit as any,
    slots,
  },
  el$,
  dropIndicator$,
})
</script>

<template>
  <div
    ref="el$"
    :class="[ns.b(), { [ns.m('highlight-current')]: highlightCurrent }]"
    role="tree"
  >
    <fixed-size-list
      v-if="isNotEmpty"
      ref="listRef"
      :class-name="ns.b('virtual-list')"
      :data="flattenTree"
      :total="flattenTree.length"
      :height="height"
      :item-size="treeNodeSize"
      :perf-mode="perfMode"
      :scrollbar-always-on="scrollbarAlwaysOn"
    >
      <template #default="{ data, index, style }">
        <VirtualTreeNode
          :key="data[index].key"
          :style="style"
          :node="data[index]"
          :expanded="data[index].expanded"
          :show-checkbox="showCheckbox"
          :checked="isChecked(data[index])"
          :indeterminate="isIndeterminate(data[index])"
          :item-size="treeNodeSize"
          :disabled="isDisabled(data[index])"
          :current="isCurrent(data[index])"
          :hidden-expand-icon="isForceHiddenExpandIcon(data[index])"
          @click="handleNodeClick"
          @toggle="toggleExpand"
          @check="handleNodeCheck"
          @drop="handleNodeDrop"
        />
      </template>
    </fixed-size-list>
    <div v-else :class="ns.e('empty-block')">
      <slot name="empty">
        <span :class="ns.e('empty-text')">{{
          emptyText ?? t('el.tree.emptyText')
        }}</span>
      </slot>
    </div>
    <div
      v-show="dragState.showDropIndicator"
      ref="dropIndicator$"
      :class="ns.e('drop-indicator')"
    />
  </div>
</template>

<style scoped lang="scss"></style>
