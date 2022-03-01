import { useWorkspace } from './useWorkspace'

export const useOperation = workspaceId => {
  const workspace = useWorkspace(workspaceId)
  return workspace?.operation
}
