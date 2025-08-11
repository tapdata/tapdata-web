import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { useSelected } from './useSelected'
import { useTree } from './useTree'

export const useSelectedNode = (workspaceId?: string) => {
  // TODO:: selected changes cause Vue computed to change, however when treenode changes there is no reaction
  const selected = useSelected(workspaceId)

  const tree = useTree(workspaceId)

  return reactiveComputed(() => {
    return tree.value?.findById?.(selected.value[0])
  })
}

/**
 * @deprecated
 * please use useSelectedNode
 */
export const useCurrentNode = useSelectedNode
