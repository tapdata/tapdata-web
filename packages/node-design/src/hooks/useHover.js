import { useOperation } from './useOperation'
import { computed } from 'vue-demi'

export const useHover = workspaceId => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.hover)
  // return operation?.hover
}
