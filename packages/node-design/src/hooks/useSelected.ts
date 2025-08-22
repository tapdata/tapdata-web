import { toJS } from '@formily/reactive'
import { computed } from '@tap/form/src/shared/reactive'
import { useSelection } from './useSelection'

export const useSelected = (workspaceId?: string) => {
  const selectionRef = useSelection(workspaceId)

  return computed(() => {
    return toJS(selectionRef.value?.selected)
  })
}
