import { computed } from 'vue'
import { useDesigner } from './useDesigner'

export const useCustomNode = () => {
  const designerRef = useDesigner()
  return computed(() => designerRef.value.props.customNode)
}
