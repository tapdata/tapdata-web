import { computed } from '@tap/form/src/shared/reactive'
import { useOperation } from './useOperation'

export const useHover = (workspaceId?: string) => {
  const operationRef = useOperation(workspaceId)
  return computed(() => operationRef.value?.hover)
  // return operation?.hover
}
