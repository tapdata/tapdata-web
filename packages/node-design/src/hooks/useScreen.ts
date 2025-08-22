import { computed } from '@tap/form/src/shared/reactive'
import { useDesigner } from './useDesigner'

export const useScreen = () => {
  const designer = useDesigner()
  return computed(() => designer.value?.screen)
}
