import { useContext } from '@daas/shared'
import { useDesigner } from './useDesigner'
import { WorkspaceContext } from '../context'

export const useWorkspace = id => {
  const designer = useDesigner()
  const workspaceId = id || useContext(WorkspaceContext)?.id
  if (workspaceId) {
    return designer.value.workbench.findWorkspaceById(workspaceId)
  }
  return designer.value.workbench.currentWorkspace
}
