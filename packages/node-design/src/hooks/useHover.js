import { useOperation } from './useOperation'

export const useHover = workspaceId => {
  const operation = useOperation(workspaceId)
  return operation?.hover
}
