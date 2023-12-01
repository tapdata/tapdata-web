import { useOperation } from './useOperation'
import { computed } from 'vue'

export const useDragon = (workspaceId) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.viewportDragon)
}
