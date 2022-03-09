import { useOperation } from './useOperation'

export const useDragon = workspaceId => {
  const operation = useOperation(workspaceId)
  return operation?.viewportDragon
}
