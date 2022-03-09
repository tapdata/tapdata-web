import { useSelection } from './useSelection'
import { toJS, observe } from '@formily/reactive'
import { computed, onBeforeUnmount, ref, watch } from 'vue-demi'

export const useSelected = workspaceId => {
  const selectionRef = useSelection(workspaceId)
  // const res = ref(selectionRef.value.selected || [])
  const res = ref(toJS(selectionRef.value?.selected) || [])

  const dispose = observe(selectionRef.value, () => {
    res.value = toJS(selectionRef.value.selected)
  })
  // return computed(() => selection?.selected || [])

  onBeforeUnmount(() => {
    dispose()
  })

  return res
}
