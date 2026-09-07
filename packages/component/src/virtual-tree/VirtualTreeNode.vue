<script lang="ts" setup>
import { CaretRight } from '@element-plus/icons-vue'
import {
  ElCheckbox,
  ElIcon,
  useNamespace,
  type CheckboxValueType,
} from 'element-plus'
import {
  NODE_CONTEXTMENU,
  ROOT_TREE_INJECTION_KEY,
  treeNodeEmits,
  treeNodeProps,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import ElNodeContent from 'element-plus/es/components/tree-v2/src/tree-node-content.mjs'
import { computed, inject, ref } from 'vue'
import { dragEventsKey } from './composables/useDragNode'

defineOptions({
  name: 'VirtualTreeNode',
})

const props = defineProps(treeNodeProps)
const emit = defineEmits(treeNodeEmits)
const tree = inject(ROOT_TREE_INJECTION_KEY)
const ns = useNamespace('tree')
const node$ = ref<HTMLElement | null>(null)
const dragEvents = inject(dragEventsKey)

const indent = computed(() => tree?.props.indent ?? 16)
const icon = computed(() => tree?.props.icon ?? CaretRight)
const draggable = computed(() => Boolean((tree?.props as any)?.draggable))

const getNodeClass = (node: any) => {
  const nodeClassFunc = (tree?.props as any)?.props?.class
  if (!nodeClassFunc) return {}

  const className =
    typeof nodeClassFunc === 'function'
      ? nodeClassFunc(node.data, node)
      : nodeClassFunc
  return typeof className === 'string' ? { [className]: true } : className
}

const handleClick = (event: MouseEvent) => {
  emit('click', props.node, event)
}

const handleDrop = (event: DragEvent) => {
  emit('drop', props.node, event)
  dragEvents?.treeNodeDrop({
    event,
    treeNode: {
      node: props.node,
      $el: node$.value,
    },
  })
}

const handleExpandIconClick = () => {
  emit('toggle', props.node)
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

const handleDragStart = (event: DragEvent) => {
  if (!draggable.value) return
  dragEvents?.treeNodeDragStart({
    event,
    treeNode: {
      node: props.node,
      $el: node$.value,
    },
  })
}

const handleDragOver = (event: DragEvent) => {
  if (!draggable.value) return
  event.preventDefault()
  dragEvents?.treeNodeDragOver({
    event,
    treeNode: {
      node: props.node,
      $el: node$.value,
    },
  })
}

const handleDragEnter = (event: DragEvent) => {
  if (!draggable.value) return
  event.preventDefault()
  dragEvents?.treeNodeDragOver({
    event,
    treeNode: {
      node: props.node,
      $el: node$.value,
    },
  })
}

const handleDragEnd = (event: DragEvent) => {
  if (!draggable.value) return
  dragEvents?.treeNodeDragEnd(event)
}
</script>

<template>
  <div
    ref="node$"
    :class="[
      ns.b('node'),
      ns.is('expanded', expanded),
      ns.is('current', current),
      ns.is('focusable', !disabled),
      ns.is('checked', !disabled && checked),
      getNodeClass(node),
    ]"
    role="treeitem"
    tabindex="-1"
    :draggable="draggable"
    :aria-expanded="expanded"
    :aria-disabled="disabled"
    :aria-checked="checked"
    :data-key="node?.key"
    @click.stop="handleClick"
    @contextmenu="handleContextMenu"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragenter.stop="handleDragEnter"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
  >
    <div
      :class="ns.be('node', 'content')"
      :style="{
        paddingLeft: `${(node.level - 1) * indent}px`,
        height: `${itemSize}px`,
      }"
    >
      <el-icon
        v-if="icon"
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
      <el-node-content :node="{ ...node, expanded }" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
