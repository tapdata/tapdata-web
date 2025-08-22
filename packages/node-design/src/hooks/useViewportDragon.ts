import { computed } from '@tap/form/src/shared/reactive'
import { useOperation } from './useOperation'

export const useDragon = (workspaceId?: string) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.viewportDragon)
}
