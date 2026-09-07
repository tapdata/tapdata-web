import { computed, ref, type Ref } from 'vue'
import { isFunction } from 'element-plus/es/utils/index.mjs'

import type { Tree, TreeKey, TreeNode, TreeProps } from '../types'

export function useFilter(props: TreeProps, tree: Ref<Tree | undefined>) {
  const hiddenNodeKeySet = ref<Set<TreeKey>>(new Set())
  const hiddenExpandIconKeySet = ref<Set<TreeKey>>(new Set())

  const filterable = computed(() => isFunction(props.filterMethod))

  function doFilter(query: string) {
    if (!filterable.value) return

    const expandedKeys = new Set<TreeKey>()
    const hiddenKeys = hiddenNodeKeySet.value
    const hiddenExpandIconKeys = hiddenExpandIconKeySet.value
    const family: TreeNode[] = []
    const nodes = tree.value?.treeNodes || []
    const filter = props.filterMethod

    hiddenKeys.clear()
    hiddenExpandIconKeys.clear()

    function traverse(currentNodes: TreeNode[]) {
      currentNodes.forEach((node) => {
        family.push(node)
        if (filter?.(query, node.data, node)) {
          family.forEach((member) => {
            expandedKeys.add(member.key)
            member.expanded = true
          })
        } else {
          node.expanded = false
          if (node.isLeaf) hiddenKeys.add(node.key)
        }

        if (node.children) traverse(node.children)

        if (!node.isLeaf) {
          if (!expandedKeys.has(node.key)) {
            hiddenKeys.add(node.key)
          } else if (node.children) {
            const allHidden = node.children.every((child) =>
              hiddenKeys.has(child.key),
            )
            if (allHidden) hiddenExpandIconKeys.add(node.key)
          }
        }
        family.pop()
      })
    }

    traverse(nodes)
    return expandedKeys
  }

  function isForceHiddenExpandIcon(node: TreeNode) {
    return hiddenExpandIconKeySet.value.has(node.key)
  }

  return {
    hiddenExpandIconKeySet,
    hiddenNodeKeySet,
    doFilter,
    isForceHiddenExpandIcon,
  }
}
