import { useOperation } from './useOperation'

export const useSelection = workspaceId => {
  const operation = useOperation(workspaceId)
  return operation?.selection
}
