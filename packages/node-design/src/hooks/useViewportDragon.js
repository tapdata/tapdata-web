import { useOperation } from './useOperation'
import { computed } from 'vue-demi'

export const useDragon = (workspaceId) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.viewportDragon)
}
