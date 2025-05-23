import { useCheck } from 'element-plus/es/components/tree-v2/src/composables/useCheck'
import { useFilter } from 'element-plus/es/components/tree-v2/src/composables/useFilter'
import {
  CURRENT_CHANGE,
  NODE_CLICK,
  NODE_COLLAPSE,
  NODE_EXPAND,
  TreeOptionsEnum,
  type treeEmits,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import { isObject } from 'element-plus/es/utils/index.mjs'
import {
  computed,
  nextTick,
  ref,
  shallowRef,
  watch,
  type ComponentInternalInstance,
  type SetupContext,
} from 'vue'
// import type { treeEmits } from 'element-plus/es/components/tree-v2/src/virtual-tree'
import type { CheckboxValueType } from 'element-plus'
import type {
  Tree,
  TreeData,
  TreeKey,
  TreeNode,
  TreeNodeData,
  TreeProps,
} from 'element-plus/es/components/tree-v2/src/types'

export function useTree(
  props: TreeProps,
  emit: SetupContext<typeof treeEmits>['emit'],
) {
  const expandedKeySet = ref<Set<TreeKey>>(new Set(props.defaultExpandedKeys))
  const currentKey = ref<TreeKey | undefined>()
  const tree = shallowRef<Tree | undefined>()

  watch(
    () => props.currentNodeKey,
    (key) => {
      currentKey.value = key
    },
    {
      immediate: true,
    },
  )

  watch(
    () => props.data,
    (data: TreeData) => {
      setData(data)
    },
    {
      immediate: true,
    },
  )

  const {
    isIndeterminate,
    isChecked,
    toggleCheckbox,
    getCheckedKeys,
    getCheckedNodes,
    getHalfCheckedKeys,
    getHalfCheckedNodes,
    setChecked,
    setCheckedKeys,
  } = useCheck(props, tree)

  const { doFilter, hiddenNodeKeySet, isForceHiddenExpandIcon } = useFilter(
    props,
    tree,
  )

  const valueKey = computed(() => {
    return props.props?.value || TreeOptionsEnum.KEY
  })
  const childrenKey = computed(() => {
    return props.props?.children || TreeOptionsEnum.CHILDREN
  })
  const disabledKey = computed(() => {
    return props.props?.disabled || TreeOptionsEnum.DISABLED
  })
  const labelKey = computed(() => {
    return props.props?.label || TreeOptionsEnum.LABEL
  })
  const isLeafKey = computed(() => {
    return props.props?.isLeaf
  })

  const flattenTree = computed(() => {
    const expandedKeys = expandedKeySet.value
    const hiddenKeys = hiddenNodeKeySet.value
    const flattenNodes: TreeNode[] = []
    const nodes = (tree.value && tree.value.treeNodes) || []
    function traverse() {
      const stack: TreeNode[] = []
      for (let i = nodes.length - 1; i >= 0; --i) {
        stack.push(nodes[i])
      }
      while (stack.length) {
        const node = stack.pop()
        if (!node) continue
        if (!hiddenKeys.has(node.key)) {
          flattenNodes.push(node)
        }
        // Only "visible" nodes will be rendered
        if (expandedKeys.has(node.key)) {
          const children = node.children
          if (children) {
            const length = children.length
            for (let i = length - 1; i >= 0; --i) {
              stack.push(children[i])
            }
          }
        }
      }
    }
    traverse()
    return flattenNodes
  })

  const isNotEmpty = computed(() => {
    return flattenTree.value.length > 0
  })

  function createTree(data: TreeData): Tree {
    const treeNodeMap: Map<TreeKey, TreeNode> = new Map()
    const levelTreeNodeMap: Map<number, TreeNode[]> = new Map()
    let maxLevel = 1
    function traverse(
      nodes: TreeData,
      level = 1,
      parent: TreeNode | undefined = undefined,
    ) {
      const siblings: TreeNode[] = []
      for (const rawNode of nodes) {
        const value = getKey(rawNode)
        const node: TreeNode = {
          level,
          key: value,
          data: rawNode,
        }
        node.label = getLabel(rawNode)
        node.parent = parent
        const children = getChildren(rawNode)
        node.disabled = getDisabled(rawNode)
        node.isLeaf = getIsLeaf(rawNode, children)
        if (children && children.length) {
          node.children = traverse(children, level + 1, node)
        }
        siblings.push(node)
        treeNodeMap.set(value, node)
        if (!levelTreeNodeMap.has(level)) {
          levelTreeNodeMap.set(level, [])
        }
        levelTreeNodeMap.get(level)?.push(node)
      }
      if (level > maxLevel) {
        maxLevel = level
      }
      return siblings
    }
    const treeNodes: TreeNode[] = traverse(data)
    return {
      treeNodeMap,
      levelTreeNodeMap,
      maxLevel,
      treeNodes,
    }
  }

  function filter(query: string) {
    const keys = doFilter(query)
    if (keys) {
      expandedKeySet.value = keys
    }
  }

  function getChildren(node: TreeNodeData): TreeNodeData[] {
    return node[childrenKey.value]
  }

  function getKey(node: TreeNodeData): TreeKey {
    if (!node) {
      return ''
    }
    return node[valueKey.value]
  }

  function getDisabled(node: TreeNodeData): boolean {
    return node[disabledKey.value]
  }

  function getLabel(node: TreeNodeData): string {
    return node[labelKey.value]
  }

  function getIsLeaf(node: TreeNodeData, children: TreeNodeData[]): boolean {
    return isLeafKey.value
      ? node[isLeafKey.value]
      : !children || children.length === 0
  }

  function toggleExpand(
    node: TreeNode,
    nodeInstance: ComponentInternalInstance,
  ) {
    const expandedKeys = expandedKeySet.value
    if (expandedKeys.has(node.key)) {
      collapseNode(node, nodeInstance)
    } else {
      expandNode(node, nodeInstance)
    }
  }

  function setExpandedKeys(keys: TreeKey[]) {
    expandedKeySet.value = new Set(keys)
  }

  function handleNodeClick(node: TreeNode, e: MouseEvent) {
    emit(NODE_CLICK, node.data, node, e)
    handleCurrentChange(node)
    if (props.expandOnClickNode) {
      toggleExpand(node)
    }
    if (props.showCheckbox && props.checkOnClickNode && !node.disabled) {
      toggleCheckbox(node, !isChecked(node), true)
    }
  }

  function handleCurrentChange(node: TreeNode) {
    if (!isCurrent(node)) {
      currentKey.value = node.key
      emit(CURRENT_CHANGE, node.data, node)
    }
  }

  function handleNodeCheck(node: TreeNode, checked: CheckboxValueType) {
    toggleCheckbox(node, checked)
  }

  function expandNode(node: TreeNode, nodeInstance: ComponentInternalInstance) {
    const keySet = expandedKeySet.value
    if (tree.value && props.accordion) {
      // whether only one node among the same level can be expanded at one time
      const { treeNodeMap } = tree.value
      keySet.forEach((key) => {
        const treeNode = treeNodeMap.get(key)
        if (node && node.level === treeNode?.level) {
          keySet.delete(key)
        }
      })
    }
    keySet.add(node.key)
    emit(NODE_EXPAND, node.data, node, nodeInstance)
  }

  function collapseNode(
    node: TreeNode,
    nodeInstance: ComponentInternalInstance,
  ) {
    expandedKeySet.value.delete(node.key)
    emit(NODE_COLLAPSE, node.data, node, nodeInstance)
  }

  function isExpanded(node: TreeNode): boolean {
    return expandedKeySet.value.has(node.key)
  }

  function isDisabled(node: TreeNode): boolean {
    return !!node.disabled
  }

  function isCurrent(node: TreeNode): boolean {
    const current = currentKey.value
    return current !== undefined && current === node.key
  }

  function getCurrentNode(): TreeNodeData | undefined {
    if (!currentKey.value) return undefined
    return tree.value?.treeNodeMap.get(currentKey.value)?.data
  }

  function getCurrentKey(): TreeKey | undefined {
    return currentKey.value
  }

  function setCurrentKey(key: TreeKey): void {
    currentKey.value = key
  }

  function setData(data: TreeData) {
    nextTick(() => (tree.value = createTree(data)))
  }

  function getNode(data: TreeKey | TreeNodeData) {
    const key = isObject(data) ? getKey(data) : data
    return tree.value?.treeNodeMap.get(key)
  }

  return {
    tree,
    flattenTree,
    isNotEmpty,
    getKey,
    getChildren,
    toggleExpand,
    toggleCheckbox,
    isExpanded,
    isChecked,
    isIndeterminate,
    isDisabled,
    isCurrent,
    isForceHiddenExpandIcon,
    handleNodeClick,
    handleNodeCheck,
    // expose
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
  }
}
