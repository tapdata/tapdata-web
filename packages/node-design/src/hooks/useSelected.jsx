import { useSelection } from './useSelection'
import { toJS } from '@formily/reactive'
import { computed as reactiveComputed } from '../shared'

export const useSelected = (workspaceId) => {
  const selectionRef = useSelection(workspaceId)

  return reactiveComputed(() => {
    return toJS(selectionRef.value?.selected)
  })

  /*const res = ref(toJS(selectionRef.value?.selected) || [])

  const dispose = observe(selectionRef.value, () => {
    res.value = toJS(selectionRef.value.selected)
  })

  onBeforeUnmount(() => {
    dispose()
  })

  return res*/
}
