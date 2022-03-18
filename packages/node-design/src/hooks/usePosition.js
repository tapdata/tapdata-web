import { useLayout } from './useLayout'
import { computed } from 'vue-demi'

export const usePosition = () => {
  const layoutRef = useLayout()
  return computed(() => layoutRef.value.position)
}
