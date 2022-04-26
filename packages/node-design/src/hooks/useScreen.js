import { useDesigner } from './useDesigner'
import { computed } from 'vue-demi'

export const useScreen = () => {
  const designer = useDesigner()
  return computed(() => designer.value?.screen)
}
