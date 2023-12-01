import { useDesigner } from './useDesigner'
import { computed } from 'vue'

export const useWorkbench = () => {
  const designerRef = useDesigner()
  return computed(() => designerRef.value.workbench)
}
