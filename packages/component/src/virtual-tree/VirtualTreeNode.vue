<template>
  <div
    ref="node$"
    :class="[
      ns.b('node'),
      ns.is('expanded', expanded),
      ns.is('current', current),
      ns.is('focusable', !disabled),
      ns.is('checked', !disabled && checked),
    ]"
    role="treeitem"
    tabindex="-1"
    :draggable="tree.props.draggable"
    :aria-expanded="expanded"
    :aria-disabled="disabled"
    :aria-checked="checked"
    :data-key="node?.key"
    @click.stop="handleClick"
    @contextmenu="handleContextMenu"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
  >
    <div
      :class="ns.be('node', 'content')"
      :style="{
        paddingLeft: `${(node.level - 1) * indent}px`,
        height: itemSize + 'px',
      }"
    >
      <el-icon v-if="loading" :class="[ns.be('node', 'loading-icon'), ns.is('loading')]">
        <Loading />
      </el-icon>
      <el-icon
        v-else-if="icon"
        :class="[
          ns.is('leaf', !!node?.isLeaf),
          ns.is('hidden', hiddenExpandIcon),
          {
            expanded: !node?.isLeaf && expanded,
          },
          ns.be('node', 'expand-icon'),
        ]"
        @click.stop="handleExpandIconClick"
      >
        <component :is="icon" />
      </el-icon>
      <el-checkbox
        v-if="showCheckbox"
        :model-value="checked"
        :indeterminate="indeterminate"
        :disabled="disabled"
        @change="handleCheckChange"
        @click.stop
      />
      <el-node-content :node="node" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, inject, provide, getCurrentInstance } from 'vue'
import { ElCheckbox, ElIcon, useNamespace, CheckboxValueType } from 'element-plus'
import { CaretRight, Loading } from '@element-plus/icons-vue'
// import ElNodeContent from 'element-plus/es/components/tree-v2/src/tree-node-content'
import ElNodeContent from 'element-plus/es/components/tree/src/tree-node-content.mjs'
import {
  NODE_CONTEXTMENU,
  ROOT_TREE_INJECTION_KEY,
  treeNodeEmits,
  treeNodeProps,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import { dragEventsKey } from './composables/useDragNode'

defineOptions({
  name: 'VirtualTreeNode',
})

const props = defineProps(treeNodeProps)
const emit = defineEmits(treeNodeEmits)

const tree = inject(ROOT_TREE_INJECTION_KEY)
const ns = useNamespace('tree')
const instance = getCurrentInstance()
const node$ = ref<Nullable<HTMLElement>>(null)

provide('NodeInstance', instance)

const loading = ref(false)

const indent = computed(() => {
  return tree?.props.indent ?? 16
})

const icon = computed(() => {
  return tree?.props.icon ?? CaretRight
})

const handleClick = (e: MouseEvent) => {
  emit('click', props.node, e)
}
const handleExpandIconClick = () => {
  emit('toggle', props.node, instance)
}
const handleCheckChange = (value: CheckboxValueType) => {
  emit('check', props.node, value)
}
const handleContextMenu = (event: Event) => {
  if (tree?.instance?.vnode?.props?.['onNodeContextmenu']) {
    event.stopPropagation()
    event.preventDefault()
  }
  tree?.ctx.emit(NODE_CONTEXTMENU, event, props.node?.data, props.node)
}

const dragEvents = inject(dragEventsKey)

const handleDragStart = (event: DragEvent) => {
  console.log('handleDragStart', event)
  if (!tree.props.draggable) return
  dragEvents.treeNodeDragStart({ event, treeNode: props })
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!tree.props.draggable) return
  dragEvents.treeNodeDragOver({
    event,
    treeNode: { $el: node$.value, node: props.node },
  })
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragEnd = (event: DragEvent) => {
  if (!tree.props.draggable) return
  dragEvents.treeNodeDragEnd(event)
}

defineExpose({
  loading,
})
</script>

<style lang="scss" scoped>
.#{$namespace}-tree-node {
  .el-tree-node__loading-icon {
    margin-right: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
  }
  .el-tree-node__content {
    position: relative;
  }
}
</style>
