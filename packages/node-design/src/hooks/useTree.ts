import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { useOperation } from './useOperation'

export const useTree = (workspaceId?: string) => {
  const operationRef = useOperation(workspaceId)
  return reactiveComputed(() => operationRef.value?.tree)
}
