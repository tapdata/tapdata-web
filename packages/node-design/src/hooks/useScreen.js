import { useDesigner } from './useDesigner'
import { computed } from 'vue'

export const useScreen = () => {
  const designer = useDesigner()
  return computed(() => designer.value?.screen)
}
