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
import {
  definePropType,
  mutable,
  type Nullable,
} from 'element-plus/es/utils/index.mjs'
import { computed, getCurrentInstance, provide, ref, useSlots } from 'vue'
import { useDragNodeHandler } from './composables/useDragNode'
import { useTree } from './composables/useTree'
import VirtualTreeNode from './VirtualTreeNode.vue'
import type { TreeOptionProps } from './types'

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
        disabled: TreeOptionsEnum.DISABLED,
        value: TreeOptionsEnum.KEY,
        isLeaf: undefined,
      } as const),
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  allowDrag: Function,
  allowDrop: Function,
})

// const props = defineProps(treeProps)

const emit = defineEmits(treeEmits)

const slots = useSlots()

const treeNodeSize = computed(() => props.itemSize)

const el$ = ref<Nullable<HTMLElement>>(null)
const dropIndicator$ = ref<Nullable<HTMLElement>>(null)
const nodeRef = ref<Nullable<HTMLElement>>(null)

setTimeout(() => {
  console.log('nodeRef', nodeRef.value)
}, 3000)

provide(ROOT_TREE_INJECTION_KEY, {
  ctx: {
    emit,
    slots,
  },
  props,
  instance: getCurrentInstance()!,
})
provide('RootTree', {
  ctx: {
    emit,
    slots,
  },
  props,
  instance: getCurrentInstance(),
} as any)
provide(formItemContextKey, undefined)
const { t } = useLocale()
const ns = useNamespace('tree')
const {
  flattenTree,
  isNotEmpty,
  toggleExpand,
  isExpanded,
  isIndeterminate,
  isChecked,
  isDisabled,
  isCurrent,
  isForceHiddenExpandIcon,
  handleNodeClick,
  handleNodeCheck,
  // expose
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
} = useTree(props, emit)

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
})

const { dragState } = useDragNodeHandler({
  props,
  ctx: {
    emit,
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
      :class-name="ns.b('virtual-list')"
      :data="flattenTree"
      :total="flattenTree.length"
      :height="height"
      :item-size="treeNodeSize"
      :perf-mode="perfMode"
    >
      <template #default="{ data, index, style }">
        <VirtualTreeNode
          ref="nodeRef"
          :key="data[index].key"
          :style="style"
          :node="data[index]"
          :expanded="isExpanded(data[index])"
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
        />
      </template>
    </fixed-size-list>
    <div v-else :class="ns.e('empty-block')">
      <span :class="ns.e('empty-text')">{{
        emptyText ?? t('el.tree.emptyText')
      }}</span>
    </div>

    <div
      v-show="dragState.showDropIndicator"
      ref="dropIndicator$"
      :class="ns.e('drop-indicator')"
    />
  </div>
</template>

<style scoped lang="scss"></style>
