import { computed } from '@tap/form/src/shared/reactive'
import { useWorkspace } from './useWorkspace'

export const useOperation = (workspaceId?: string) => {
  const workspaceRef = useWorkspace(workspaceId)
  return computed(() => workspaceRef.value?.operation)
}
