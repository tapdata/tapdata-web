import { useOperation } from './useOperation'
import { computed } from 'vue-demi'

export const useSelection = (workspaceId) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.selection)
}
