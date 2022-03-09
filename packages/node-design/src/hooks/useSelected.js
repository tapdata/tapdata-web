import { useSelection } from './useSelection'
import { observe } from '@formily/reactive'
import { computed, onBeforeUnmount, ref, watch } from 'vue-demi'

export const useSelected = workspaceId => {
  const selection = useSelection(workspaceId)
  const res = ref(selection.selected || [])
  console.log('useSelected')
  const dispose = observe(selection.selected, () => {
    console.log('observe(selection.selected', selection)
    res.value = selection.selected
  })
  // return computed(() => selection?.selected || [])

  onBeforeUnmount(() => {
    dispose()
  })

  return res
}
