import { computed } from '@tap/form/src/shared/reactive'
import { useLayout } from './useLayout'

export const usePosition = () => {
  const layoutRef = useLayout()
  return computed(() => layoutRef.value.position)
}
