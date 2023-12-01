import { computed } from 'vue'
import { useWorkspace } from './useWorkspace'

export const useViewport = (workspaceId) => {
  const workspaceRef = useWorkspace(workspaceId)
  return computed(() => workspaceRef.value?.viewport)
}
