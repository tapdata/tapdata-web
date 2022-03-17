import { useOperation } from './useOperation'
import { computed } from 'vue-demi'

export const useTree = workspaceId => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.tree)
}
