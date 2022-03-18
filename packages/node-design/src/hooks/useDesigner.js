import { useContext } from '@daas/shared'
import { DesignerEngineContext } from '../context'

export const useDesigner = () => {
  return useContext(DesignerEngineContext)
}
