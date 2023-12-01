import { useDesigner } from './useDesigner'
import { computed } from 'vue'

export const useCustomNode = () => {
  const designerRef = useDesigner()
  return computed(() => designerRef.value.props.customNode)
}
