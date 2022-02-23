import { useContext } from '@daas/shared'
import { DesignerEngineContext } from '../context'

export const useDesigner = () => {
  const designer = useContext(DesignerEngineContext)
  return designer
}
