import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { ref, type Ref } from 'vue'
import { useContext, WorkspaceSymbol } from '../context'
import type { Workspace } from '../core/models'
import { useDesigner } from './useDesigner'

export const useWorkspace = (id?: string): Ref<Workspace> => {
  const designer = useDesigner()
  const workspaceRef = ref()

  const WorkspaceSymbolRef = useContext(WorkspaceSymbol)

  if (window.__DESIGNABLE_WORKSPACE__) {
    workspaceRef.value = window.__DESIGNABLE_WORKSPACE__
    return workspaceRef
  }

  return reactiveComputed(() => {
    const workspaceId = id || WorkspaceSymbolRef?.value.id
    if (workspaceId) {
      return designer.value.workbench.findWorkspaceById(workspaceId)
    }
    return designer.value.workbench.currentWorkspace
  })
}
