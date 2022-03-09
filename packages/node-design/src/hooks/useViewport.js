import { computed } from 'vue-demi'
import { useWorkspace } from './useWorkspace'

export const useViewport = workspaceId => {
  const workspace = useWorkspace(workspaceId)
  return computed(() => workspace?.viewport)
}
