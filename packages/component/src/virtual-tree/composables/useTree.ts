import { computed, ref, shallowRef, watch, type SetupContext } from 'vue'
import { isObject } from 'element-plus/es/utils/index.mjs'
import {
  CURRENT_CHANGE,
  NODE_CLICK,
  NODE_COLLAPSE,
  NODE_DROP,
  NODE_EXPAND,
  TreeOptionsEnum,
  type treeEmits,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import { useCheck } from './useCheck'
import { useFilter } from './useFilter'

import type { CheckboxValueType } from 'element-plus'
import type {
  Tree,
  TreeData,
  TreeKey,
  TreeNode,
  TreeNodeData,
  TreeProps,
} from '../types'

type ListInstance = {
  scrollToItem: (index: number, strategy?: any) => void
  scrollTo: (offset: number) => void
}

export function useTree(
  props: TreeProps,
  emit: SetupContext<typeof treeEmits>['emit'],
) {
  const expandedKeySet = ref<Set<TreeKey>>(new Set())
  const currentKey = ref<TreeKey | undefined>()
  const tree = shallowRef<Tree | undefined>()
  const listRef = ref<ListInstance>()

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
  const isLeafKey = computed(() => (props.props as any)?.isLeaf)

  const flattenTree = computed(() => {
    const expandedKeys = expandedKeySet.value
    const hiddenKeys = hiddenNodeKeySet.value
    const flattenNodes: TreeNode[] = []
    const nodes = tree.value?.treeNodes || []

    const stack: TreeNode[] = []
    for (let i = nodes.length - 1; i >= 0; --i) {
      const node = nodes[i]
      if (node) stack.push(node)
    }
    while (stack.length) {
      const node = stack.pop()
      if (!node || hiddenKeys.has(node.key)) continue

      flattenNodes.push(node)
      if (node.children && expandedKeys.has(node.key)) {
        for (let i = node.children.length - 1; i >= 0; --i) {
          const child = node.children[i]
          if (child) stack.push(child)
        }
      }
    }

    return flattenNodes
  })

  const isNotEmpty = computed(() => flattenTree.value.length > 0)

  function createTree(data: TreeData): Tree {
    const treeNodeMap = new Map<TreeKey, TreeNode>()
    const levelTreeNodeMap = new Map<number, TreeNode[]>()
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
        node.isLeaf = isLeafKey.value
          ? Boolean(rawNode[isLeafKey.value])
          : !children || children.length === 0
        node.expanded = expandedKeySet.value.has(value)
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
      if (level > maxLevel) maxLevel = level
      return siblings
    }

    return {
      treeNodeMap,
      levelTreeNodeMap,
      maxLevel,
      treeNodes: traverse(data),
    }
  }

  function filter(query: string) {
    const keys = doFilter(query)
    if (keys) expandedKeySet.value = keys
  }

  function getChildren(node: TreeNodeData): TreeNodeData[] {
    return node[childrenKey.value] || []
  }

  function getKey(node: TreeNodeData): TreeKey {
    return node ? node[valueKey.value] : ''
  }

  function getDisabled(node: TreeNodeData): boolean {
    return Boolean(node[disabledKey.value])
  }

  function getLabel(node: TreeNodeData): string {
    return node[labelKey.value]
  }

  function toggleExpand(node: TreeNode) {
    if (expandedKeySet.value.has(node.key)) {
      collapseNode(node)
    } else {
      expandNode(node)
    }
  }

  function setExpandedKeys(keys: TreeKey[]) {
    if (!tree.value) return

    const nextExpandedKeys = new Set<TreeKey>()
    const nodeMap = tree.value.treeNodeMap

    expandedKeySet.value.forEach((key) => {
      const node = nodeMap.get(key)
      if (node) node.expanded = false
    })

    keys.forEach((key) => {
      let node = nodeMap.get(key)
      while (node && !nextExpandedKeys.has(node.key)) {
        nextExpandedKeys.add(node.key)
        node.expanded = true
        node = node.parent
      }
    })

    expandedKeySet.value = nextExpandedKeys
  }

  function handleNodeClick(node: TreeNode, event: MouseEvent) {
    handleCurrentChange(node)
    emit(NODE_CLICK, node.data, node, event)
    if (props.expandOnClickNode) toggleExpand(node)

    if (
      props.showCheckbox &&
      (props.checkOnClickNode || (node.isLeaf && props.checkOnClickLeaf)) &&
      !node.disabled
    ) {
      toggleCheckbox(node, !isChecked(node), true)
    }
  }

  function handleNodeDrop(node: TreeNode, event: DragEvent) {
    emit(NODE_DROP, node.data, node, event)
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

  function expandNode(node: TreeNode) {
    const keySet = expandedKeySet.value
    if (tree.value && props.accordion) {
      const { treeNodeMap } = tree.value
      keySet.forEach((key) => {
        const sibling = treeNodeMap.get(key)
        if (node.level === sibling?.level) {
          keySet.delete(key)
          sibling.expanded = false
        }
      })
    }

    keySet.add(node.key)
    const currentNode = getNode(node.key)
    if (currentNode) {
      currentNode.expanded = true
      emit(NODE_EXPAND, currentNode.data, currentNode)
    }
  }

  function collapseNode(node: TreeNode) {
    expandedKeySet.value.delete(node.key)
    const currentNode = getNode(node.key)
    if (currentNode) {
      currentNode.expanded = false
      emit(NODE_COLLAPSE, currentNode.data, currentNode)
    }
  }

  function isCurrent(node: TreeNode): boolean {
    return currentKey.value !== undefined && currentKey.value === node.key
  }

  function getCurrentNode(): TreeNodeData | undefined {
    if (!currentKey.value) return undefined
    return tree.value?.treeNodeMap.get(currentKey.value)?.data
  }

  function getCurrentKey(): TreeKey | undefined {
    return currentKey.value
  }

  function setCurrentKey(key: TreeKey) {
    currentKey.value = key
  }

  function setData(data: TreeData) {
    tree.value = createTree(data)
  }

  function getNode(data: TreeKey | TreeNodeData) {
    const key = isObject(data) ? getKey(data) : data
    return tree.value?.treeNodeMap.get(key)
  }

  function scrollToNode(key: TreeKey, strategy: any = 'auto') {
    const node = getNode(key)
    if (node && listRef.value) {
      listRef.value.scrollToItem(flattenTree.value.indexOf(node), strategy)
    }
  }

  function scrollTo(offset: number) {
    listRef.value?.scrollTo(offset)
  }

  watch(
    () => props.currentNodeKey,
    (key) => {
      currentKey.value = key
    },
    { immediate: true },
  )

  watch(
    () => props.defaultExpandedKeys,
    (keys) => {
      setExpandedKeys(keys || [])
    },
  )

  watch(
    () => props.data,
    (data: TreeData | undefined) => {
      setData(data || [])
      setExpandedKeys(props.defaultExpandedKeys || [])
    },
    { immediate: true },
  )

  return {
    tree,
    flattenTree,
    isNotEmpty,
    listRef,
    getKey,
    getChildren,
    toggleExpand,
    toggleCheckbox,
    isChecked,
    isIndeterminate,
    isDisabled: (node: TreeNode) => Boolean(node.disabled),
    isCurrent,
    isForceHiddenExpandIcon,
    handleNodeClick,
    handleNodeDrop,
    handleNodeCheck,
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
  }
}
