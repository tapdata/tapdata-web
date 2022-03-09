import { useOperation } from './useOperation'
import { computed } from 'vue-demi'

export const useHover = workspaceId => {
  const operation = useOperation(workspaceId)
  return computed(() => operation?.hover)
  // return operation?.hover
}
