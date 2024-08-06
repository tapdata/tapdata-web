import { useSelected } from './useSelected'
import { useTree } from './useTree'
import { computed } from 'vue'

/*export const useCurrentNode = (workspaceId) => {
  const selected = useSelected(workspaceId)
  const treeRef = useTree(workspaceId)
  // return tree?.findById?.(selected.value[0])
  return computed(() => {
    return treeRef.value?.findById?.(selected.value[0])
  })
}*/

export const useSelectedNode = (workspaceId?: string) => {
  // TODO:: selected changes cause Vue computed to change, however when treenode changes there is no reaction
  const selected = useSelected(workspaceId)

  const tree = useTree(workspaceId)

  return computed(() => {
    return tree.value?.findById?.(selected.value[0])
  })
}

/**
 * @deprecated
 * please use useSelectedNode
 */
export const useCurrentNode = useSelectedNode
