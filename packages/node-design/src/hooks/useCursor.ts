import { computed } from '@tap/form/src/shared/reactive'
import { useDesigner } from './useDesigner'

export const useCursor = () => {
  const designer = useDesigner()
  return computed(() => designer.value?.cursor)
}
