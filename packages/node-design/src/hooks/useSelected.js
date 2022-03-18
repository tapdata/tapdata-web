import { useSelection } from './useSelection'
import { toJS, observe } from '@formily/reactive'
import { onBeforeUnmount, ref } from 'vue-demi'

export const useSelected = workspaceId => {
  const selectionRef = useSelection(workspaceId)
  const res = ref(toJS(selectionRef.value?.selected) || [])

  const dispose = observe(selectionRef.value, () => {
    res.value = toJS(selectionRef.value.selected)
  })

  onBeforeUnmount(() => {
    dispose()
  })

  return res
}
