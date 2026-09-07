import {
  NODE_CHECK,
  NODE_CHECK_CHANGE,
} from 'element-plus/es/components/tree-v2/src/virtual-tree'
import { getCurrentInstance, nextTick, ref, watch, type Ref } from 'vue'

import type { Tree, TreeKey, TreeNode, TreeNodeData, TreeProps } from '../types'
import type { CheckboxValueType } from 'element-plus'

export function useCheck(props: TreeProps, tree: Ref<Tree | undefined>) {
  const checkedKeys = ref<Set<TreeKey>>(new Set())
  const indeterminateKeys = ref<Set<TreeKey>>(new Set())
  const { emit } = getCurrentInstance()!

  watch(
    [() => tree.value, () => props.defaultCheckedKeys],
    () => {
      nextTick(() => {
        setCheckedKeysFromProps(props.defaultCheckedKeys || [])
      })
    },
    { immediate: true },
  )

  const updateCheckedKeys = (deep = false) => {
    if (!tree.value || !props.showCheckbox || (props.checkStrictly && !deep)) {
      return
    }

    const { levelTreeNodeMap, maxLevel } = tree.value
    const checkedKeySet = checkedKeys.value
    const indeterminateKeySet = new Set<TreeKey>()

    for (let level = maxLevel; level >= 1; --level) {
      const nodes = levelTreeNodeMap.get(level)
      if (!nodes) continue

      nodes.forEach((node) => {
        let isEffectivelyChecked =
          !node.isLeaf || Boolean(node.disabled) || checkedKeySet.has(node.key)
        const children = node.children
        if (children) {
          let allChecked = true
          let hasChecked = false

          for (const childNode of children) {
            if (!childNode.isEffectivelyChecked) {
              isEffectivelyChecked = false
            }
            if (checkedKeySet.has(childNode.key)) {
              hasChecked = true
            } else if (indeterminateKeySet.has(childNode.key)) {
              allChecked = false
              hasChecked = true
              break
            } else {
              allChecked = false
            }
          }

          if (allChecked) {
            checkedKeySet.add(node.key)
          } else if (hasChecked) {
            indeterminateKeySet.add(node.key)
            checkedKeySet.delete(node.key)
          } else {
            checkedKeySet.delete(node.key)
            indeterminateKeySet.delete(node.key)
          }
        }

        node.isEffectivelyChecked = isEffectivelyChecked
      })
    }

    indeterminateKeys.value = indeterminateKeySet
  }

  const isChecked = (node: TreeNode) => checkedKeys.value.has(node.key)
  const isIndeterminate = (node: TreeNode) =>
    indeterminateKeys.value.has(node.key)

  const toggleCheckbox = (
    node: TreeNode,
    isChecked: CheckboxValueType,
    nodeClick = true,
    immediateUpdate = true,
    deep = false,
  ) => {
    const checkedKeySet = checkedKeys.value
    const children = node.children
    if ((!props.checkStrictly || deep) && nodeClick && children?.length) {
      isChecked = children.some((child) => !child.isEffectivelyChecked)
    }

    const toggle = (currentNode: TreeNode, checked: CheckboxValueType) => {
      if (checked) checkedKeySet.add(currentNode.key)
      else checkedKeySet.delete(currentNode.key)
      if ((!props.checkStrictly || deep) && currentNode.children) {
        currentNode.children.forEach((childNode) => {
          if (!childNode.disabled || childNode.children) {
            toggle(childNode, checked)
          }
        })
      }
    }

    toggle(node, isChecked)
    if (immediateUpdate) updateCheckedKeys(deep)
    if (nodeClick) afterNodeCheck(node, isChecked)
  }

  const afterNodeCheck = (node: TreeNode, checked: CheckboxValueType) => {
    const { checkedNodes, checkedKeys } = getChecked()
    const { halfCheckedNodes, halfCheckedKeys } = getHalfChecked()
    emit(NODE_CHECK, node.data, {
      checkedKeys,
      checkedNodes,
      halfCheckedKeys,
      halfCheckedNodes,
    })
    emit(NODE_CHECK_CHANGE, node.data, checked)
  }

  function getCheckedKeys(leafOnly = false): TreeKey[] {
    return getChecked(leafOnly).checkedKeys
  }

  function getCheckedNodes(leafOnly = false): TreeNodeData[] {
    return getChecked(leafOnly).checkedNodes
  }

  function getHalfCheckedKeys(): TreeKey[] {
    return getHalfChecked().halfCheckedKeys
  }

  function getHalfCheckedNodes(): TreeNodeData[] {
    return getHalfChecked().halfCheckedNodes
  }

  function getChecked(leafOnly = false) {
    const checkedNodes: TreeNodeData[] = []
    const keys: TreeKey[] = []
    if (tree.value && props.showCheckbox) {
      tree.value.treeNodeMap.forEach((node) => {
        if (checkedKeys.value.has(node.key) && (!leafOnly || node.isLeaf)) {
          keys.push(node.key)
          checkedNodes.push(node.data)
        }
      })
    }
    return { checkedKeys: keys, checkedNodes }
  }

  function getHalfChecked() {
    const halfCheckedNodes: TreeNodeData[] = []
    const halfCheckedKeys: TreeKey[] = []
    if (tree.value && props.showCheckbox) {
      tree.value.treeNodeMap.forEach((node) => {
        if (indeterminateKeys.value.has(node.key)) {
          halfCheckedKeys.push(node.key)
          halfCheckedNodes.push(node.data)
        }
      })
    }
    return { halfCheckedKeys, halfCheckedNodes }
  }

  function setCheckedKeys(keys: TreeKey[]) {
    checkedKeys.value.clear()
    indeterminateKeys.value.clear()
    nextTick(() => {
      setCheckedKeysFromProps(keys)
    })
  }

  function setChecked(key: TreeKey, isChecked: boolean, deep = false) {
    if (!tree.value || !props.showCheckbox) return
    const node = tree.value.treeNodeMap.get(key)
    if (node) toggleCheckbox(node, isChecked, false, true, deep)
  }

  function setCheckedKeysFromProps(keys: TreeKey[]) {
    if (!tree.value || !props.showCheckbox) return

    for (const key of keys) {
      const node = tree.value.treeNodeMap.get(key)
      if (node && !isChecked(node)) {
        toggleCheckbox(node, true, false, false)
      }
    }
    updateCheckedKeys()
  }

  return {
    updateCheckedKeys,
    toggleCheckbox,
    isChecked,
    isIndeterminate,
    getCheckedKeys,
    getCheckedNodes,
    getHalfCheckedKeys,
    getHalfCheckedNodes,
    setChecked,
    setCheckedKeys,
  }
}
