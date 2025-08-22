import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { useDesigner } from './useDesigner'

export const useWorkbench = () => {
  const designerRef = useDesigner()
  return reactiveComputed(() => designerRef.value.workbench)
}
