import { computed } from '@tap/form/src/shared/reactive'
import { useWorkspace } from './useWorkspace'

export const useViewport = (workspaceId) => {
  const workspaceRef = useWorkspace(workspaceId)
  return computed(() => workspaceRef.value?.viewport)
}
