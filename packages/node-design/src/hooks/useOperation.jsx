import { useWorkspace } from './useWorkspace'
import { computed } from 'vue'

export const useOperation = (workspaceId) => {
  const workspaceRef = useWorkspace(workspaceId)
  return computed(() => workspaceRef.value?.operation)
}
