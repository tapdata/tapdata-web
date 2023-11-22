import { useOperation } from './useOperation'
import { computed } from 'vue'

export const useSelection = (workspaceId) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.selection)
}
