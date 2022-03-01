import { useOperation } from './useOperation'

export const useTree = workspaceId => {
  const operation = useOperation(workspaceId)
  return operation?.tree
}
