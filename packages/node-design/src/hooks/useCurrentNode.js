import { useSelected } from './useSelected'
import { useTree } from './useTree'
import { computed } from 'vue-demi'

export const useCurrentNode = workspaceId => {
  const selected = useSelected(workspaceId)
  const tree = useTree(workspaceId)
  // return tree?.findById?.(selected.value[0])
  return computed(() => {
    return tree?.findById?.(selected.value[0])
  })
}
