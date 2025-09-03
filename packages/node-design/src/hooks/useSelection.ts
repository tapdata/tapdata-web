import { computed } from '@tap/form/src/shared/reactive'
import { useOperation } from './useOperation'

export const useSelection = (workspaceId) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.selection)
}
