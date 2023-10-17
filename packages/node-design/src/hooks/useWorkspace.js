import { useContext } from '@tap/shared'
import { useDesigner } from './useDesigner'
import { WorkspaceContext } from '../context'
import { computed, ref } from 'vue-demi'

export const useWorkspace = (id) => {
  const designer = useDesigner()

  const workspaceRef = ref()
  const workspaceId = computed(
    () => id || useContext(WorkspaceContext).value?.id
  )
  if (workspaceId) {
    workspaceRef.value = designer.value.workbench.findWorkspaceById(
      workspaceId.value
    )
  }

  workspaceRef.value = designer.value.workbench.currentWorkspace
  return workspaceRef
}
