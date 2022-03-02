import { useSelection } from './useSelection'

export const useSelected = workspaceId => {
  const selection = useSelection(workspaceId)
  return selection?.selected || []
}
